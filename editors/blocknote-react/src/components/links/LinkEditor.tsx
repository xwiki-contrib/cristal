import { LinkSuggestion, createLinkSuggestor } from "../../misc/linkSuggest";
import {
  Autocomplete,
  Button,
  ComboboxStringItem,
  Input,
  Stack,
} from "@mantine/core";
import { debounce } from "@xwiki/cristal-fn-utils";
import { LinkSuggestService, LinkType } from "@xwiki/cristal-link-suggest-api";
import { EntityReference } from "@xwiki/cristal-model-api";
import {
  ModelReferenceParser,
  ModelReferenceSerializer,
} from "@xwiki/cristal-model-reference-api";
import {
  RemoteURLParser,
  RemoteURLSerializer,
} from "@xwiki/cristal-model-remote-url-api";
import { useCallback, useState } from "react";
import { RiLink, RiText } from "react-icons/ri";

type LinkEditionContext = {
  linkSuggestService: LinkSuggestService;
  modelReferenceParser: ModelReferenceParser;
  modelReferenceSerializer: ModelReferenceSerializer;
  remoteURLParser: RemoteURLParser;
  remoteURLSerializer: RemoteURLSerializer;
};

type LinkData = {
  title: string;
  reference: EntityReference | null;
  url: string;
};

type LinkEditorProps = {
  linkEditionCtx: LinkEditionContext;
  current: LinkData | null;
  updateLink: (linkData: LinkData) => void;
  hideTitle?: boolean;
};

export const LinkEditor: React.FC<LinkEditorProps> = ({
  linkEditionCtx,
  current,
  updateLink,
  hideTitle,
}) => {
  const suggestLink = createLinkSuggestor(linkEditionCtx);

  const [target, setTarget] = useState({
    url: current?.url ?? "",
    reference: current?.reference ?? null,
  });

  const [title, setTitle] = useState(current?.title ?? "");
  const [results, setResults] = useState<
    (LinkSuggestion | { type: "url"; title: string; url: string })[]
  >([]);

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.startsWith("http://") || query.startsWith("https://")) {
        setResults([{ type: "url", title: query, url: query }]);
        return;
      }

      const suggestions = await suggestLink({ query });

      setResults(
        suggestions.filter((suggestion) => suggestion.type === LinkType.PAGE),
      );
    }),
    [setTarget, setResults],
  );

  const select = useCallback(
    (title: string) => {
      const result = results.find((result) => result.title === title);

      if (!result) {
        return;
      }

      setTitle(title || result.title);
      setTarget({
        url: result.url,
        reference:
          result.type === "url"
            ? null
            : linkEditionCtx.modelReferenceParser.parse(result.reference),
      });
      setResults([]);
    },
    [results, setTitle /*, setQuery*/, setTarget, setResults],
  );

  const submit = useCallback(() => {
    updateLink({
      title,
      url: target.url,
      reference: target.reference,
    });
  }, [updateLink, title, target]);

  return (
    <Stack>
      {!hideTitle && (
        <Input
          leftSection={<RiText />}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}

      <Autocomplete
        leftSection={<RiLink />}
        data={results.map(
          (result): ComboboxStringItem => ({
            value: result.title,
          }),
        )}
        onInput={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          search((e.target as any).value);
        }}
        onChange={select}
        comboboxProps={{ zIndex: 10000 }}
      />

      <Button type="submit" onClick={submit}>
        Submit
      </Button>
    </Stack>
  );
};

export type { LinkData, LinkEditionContext, LinkEditorProps };
