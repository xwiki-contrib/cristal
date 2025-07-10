import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import { WebsocketProvider } from "y-websocket";
import { Doc } from "yjs";

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

function readClientId(handlerDecoder: decoding.Decoder) {
  const decoder = decoding.createDecoder(handlerDecoder.arr);
  // Read and ignore the first uint value (message type).
  decoding.readVarUint(decoder);
  return decoding.readVarUint(decoder);
}

export function createXWikiWebsocketProvider(
  url: string,
  roomname: string,
  params: { [p: string]: string },
): WebsocketProvider {
  const doc = new Doc();
  // Creates a new editor instance.
  const websocketProvider = new WebsocketProvider(url, roomname, doc, {
    params,
  });

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
