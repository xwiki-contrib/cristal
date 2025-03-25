import { Link, LinkSuggestService } from "@xwiki/cristal-link-suggest-api";
import {
  AttachmentReference,
  DocumentReference,
  EntityType,
} from "@xwiki/cristal-model-api";
import { ModelReferenceParser } from "@xwiki/cristal-model-reference-api";

/**
 * @since 0.11
 */
enum LinkType {
  PAGE,
  ATTACHMENT,
}

/**
 * Describe a link suggestion action (i.e., a search result entry).
 */
type LinkSuggestion = {
  title: string;
  segments: string[];
  reference: string;
  url: string;
  type: LinkType;
};

type LinkSuggestor = (params: { query: string }) => Promise<LinkSuggestion[]>;

/**
 * Build a function returning an array of link suggestions from a string.
 */
function createLinkSuggestor(
  linkSuggest?: LinkSuggestService,
  modelReferenceParser?: ModelReferenceParser,
): LinkSuggestor {
  // Return an array of suggestions from a query
  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  return async ({ query }) => {
    // TODO: add upload attachment action
    // TODO: add create new page action
    // TODO: add links suggestions
    let links: Link[];

    try {
      if (linkSuggest) {
        links = await linkSuggest.getLinks(query);
      } else {
        links = [];
      }
    } catch (e) {
      console.group("Failed to fetch remote links");
      console.error(e);
      console.groupEnd();
      links = [];
    }

    const equalityOperator = queryEqualityOperator(query);

    return links
      .filter((link) => equalityOperator(link.label))
      .map((link) => {
        // FIXME: relate to link management is reference management, here too we
        // need to think me precisely of the architecture we want for this.
        const entityReference = modelReferenceParser?.parse(link.reference);

        const documentReference =
          entityReference?.type == EntityType.ATTACHMENT
            ? (entityReference as AttachmentReference).document
            : (entityReference as DocumentReference);

        const segments = documentReference.space?.names.slice(0) ?? [];

        // TODO: replace with an actual construction of segments from a reference
        if (documentReference.terminal) {
          segments.push(documentReference.name);
        }

        return {
          title: link.label,
          segments,
          reference: link.reference,
          url: link.url,
          type: link.type,
        };
      });
  };
}

function queryEqualityOperator(query: string) {
  const queryNoCase = query.toLowerCase();
  return (value: string): boolean => {
    return value.toLowerCase().includes(queryNoCase);
  };
}

export { createLinkSuggestor };
export type { LinkSuggestion, LinkSuggestor, LinkType };
