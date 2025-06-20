/*
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
import {
  LinkEditionContext,
  LinkSuggestion,
  createLinkSuggestor,
} from "../../misc/linkSuggest";
import { Autocomplete, Input, Stack } from "@mantine/core";
import { debounce } from "@xwiki/cristal-fn-utils";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import { EntityReference } from "@xwiki/cristal-model-api";
import { useCallback, useState } from "react";
import { RiLink, RiText } from "react-icons/ri";

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
    [setResults],
  );

  const select = useCallback(
    (title: string) => {
      const result = results.find((result) => result.title === title);

      if (!result) {
        return;
      }

      updateLink({
        title: title || result.title,
        url: result.url,
        reference:
          result.type === "url"
            ? null
            : linkEditionCtx.modelReferenceParser.parse(result.reference),
      });
    },
    [results, setResults],
  );

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
        data={results.map((result) => ({
          value: result.title,
        }))}
        defaultValue={
          current?.reference
            ? (linkEditionCtx.modelReferenceSerializer.serialize(
                current.reference,
              ) ?? current.url)
            : ""
        }
        onInput={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          search((e.target as any).value);
        }}
        onChange={select}
        comboboxProps={{ zIndex: 10000 }}
      />
    </Stack>
  );
};

export type { LinkData, LinkEditorProps };
