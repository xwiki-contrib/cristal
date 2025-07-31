import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import { WebsocketProvider } from "y-websocket";
import { Doc } from "yjs";

/**
 * Send the current client id to the server.
 *
 * @param websocketProvider - the websocket provider to register
 */
function registerClient(websocketProvider: WebsocketProvider) {
  // Put a messagetype of value 3, then the clientId
  // readVarUint for both values
  // server side, intercept the messagae if the type is 3 and instead of broadcasting, save the client id
  // then when the client disconnects, broadcast with message type 4 and send the client id back
  // this should be enough for other clients to cleanup their awareness status
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, 2);
  encoding.writeVarUint(encoder, websocketProvider.doc.clientID);
  const buf = encoding.toUint8Array(encoder);
  websocketProvider.ws?.send(buf);
}

/**
 * Decode the client id from a message handler of index 4.
 *
 * @param handlerDecoder - the decoder, usually provided by the hander
 */
function readClientId(handlerDecoder: decoding.Decoder) {
  const decoder = decoding.createDecoder(handlerDecoder.arr);
  // Read and ignore the first uint value (message type).
  decoding.readVarUint(decoder);
  return decoding.readVarUint(decoder);
}

/**
 * Initialize a websocket provider for a XWiki yjs endpoint.
 *
 * @param url - the url of the websocket endpoint
 * @param room - the string serialization of the room
 * @since 0.20
 */
export function createXWikiWebsocketProvider(
  url: string,
  room: string,
): WebsocketProvider {
  const splits = url.split("/");
  const roomname = splits[splits.length - 1];
  const doc = new Doc();
  // Creates a new editor instance.
  const websocketProvider = new WebsocketProvider(
    // Since Websocket provider force having a roomname that is concatenated to the url with a '/'.
    // Therefore, we have to artificially split out the last segment to have it concatenated back by Websocket
    // provider later.
    splits.slice(0, splits.length - 1).join("/"),
    roomname,
    doc,
    {
      params: { room },
    },
  );

  websocketProvider.messageHandlers[4] = (
    encoder,
    decoder: decoding.Decoder,
    provider: WebsocketProvider,
  ): void => {
    const disconnectedClientId = readClientId(decoder);
    provider.awareness.getStates().delete(disconnectedClientId);
  };
  // Send the client id to the server once on connect.
  websocketProvider.once("status", ({ status }) => {
    if (status == "connected") {
      registerClient(websocketProvider);
    }
  });
  return websocketProvider;
}
