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
import { Input, Select, Stack } from "@mantine/core";
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

  const [customTitle, setCustomTitle] = useState(current?.title ?? "");
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

  const submit = useCallback(
    ({
      title,
      url,
      reference,
    }: {
      title: string;
      url: string;
      reference: EntityReference | null;
    }) => {
      const result = results.find((result) => result.title === title);

      if (!result) {
        return;
      }

      updateLink({
        title,
        url,
        reference,
      });
    },
    [results, setResults],
  );

  const selectFromTitle = useCallback(
    (title: string) => {
      const result = results.find((result) => result.title === title)!;

      submit({
        title: customTitle || title,
        url: result.url,
        reference:
          result.type === "url"
            ? null
            : linkEditionCtx.remoteURLParser.parse(result.reference)!,
      });
    },
    [results, customTitle, submit],
  );

  return (
    <Stack>
      {!hideTitle && (
        <Input
          leftSection={<RiText />}
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          onKeyDown={(e) =>
            current &&
            e.key === "Enter" &&
            submit({
              title: customTitle,
              url: current.url,
              reference: current.reference,
            })
          }
        />
      )}

      <Select
        leftSection={<RiLink />}
        rightSection=" "
        searchable
        data={results.map((result) => ({
          value: result.url,
          label: result.title,
        }))}
        defaultValue={
          "TODO"

          // current?.reference
          //   ? (linkEditionCtx.modelReferenceSerializer.serialize(
          //       current.reference,
          //     ) ?? current.url)
          //   : ""
        }
        onInput={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          search((e.target as any).value);
        }}
        onChange={(value, option) => {
          console.log({ option });
          // selectFromTitle
        }}
        comboboxProps={{ zIndex: 10000 }}
      />
    </Stack>
  );
};

export type { LinkData, LinkEditorProps };
