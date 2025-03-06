import { LinkSuggestor, createLinkSuggestor } from "./linkSuggest";
import { LinkSuggestServiceProvider } from "@xwiki/cristal-link-suggest-api";
import {
  ModelReferenceParser,
  ModelReferenceParserProvider,
  ModelReferenceSerializer,
  ModelReferenceSerializerProvider,
} from "@xwiki/cristal-model-reference-api";
import {
  RemoteURLParser,
  RemoteURLParserProvider,
  RemoteURLSerializer,
  RemoteURLSerializerProvider,
} from "@xwiki/cristal-model-remote-url-api";
import { Container } from "inversify";

export type LinkEditionContext = {
  suggestLink: LinkSuggestor;
  modelReferenceParser: ModelReferenceParser;
  modelReferenceSerializer: ModelReferenceSerializer;
  remoteURLParser: RemoteURLParser;
  remoteURLSerializer: RemoteURLSerializer;
};

export function createLinkEditionContext(
  container: Container,
): LinkEditionContext {
  const linkSuggestService = container
    .get<LinkSuggestServiceProvider>("LinkSuggestServiceProvider")
    .get()!;

  const modelReferenceParser = container
    .get<ModelReferenceParserProvider>("ModelReferenceParserProvider")
    .get()!;

  const modelReferenceSerializer = container
    .get<ModelReferenceSerializerProvider>("ModelReferenceSerializerProvider")
    .get()!;

  const remoteURLParser = container
    .get<RemoteURLParserProvider>("RemoteURLParserProvider")
    .get()!;

  const remoteURLSerializer = container
    .get<RemoteURLSerializerProvider>("RemoteURLSerializerProvider")
    .get()!;

  return {
    suggestLink: createLinkSuggestor(linkSuggestService, modelReferenceParser),
    modelReferenceParser,
    modelReferenceSerializer,
    remoteURLParser,
    remoteURLSerializer,
  };
}
