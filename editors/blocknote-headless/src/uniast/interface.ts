import { EntityReference } from "@xwiki/cristal-model-api";

export type ConverterContext = {
  parseReferenceFromUrl: (url: string) => EntityReference | null;
  serializeReferenceToUrl: (reference: EntityReference) => string | null;
};
