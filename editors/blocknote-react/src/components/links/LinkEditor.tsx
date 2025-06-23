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
import {
  Button,
  Combobox,
  Input,
  InputBase,
  Stack,
  useCombobox,
} from "@mantine/core";
import { tryFallible } from "@xwiki/cristal-fn-utils";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiLink, RiText } from "react-icons/ri";

type LinkData = {
  title: string;
  url: string;
};

type LinkEditorProps = {
  linkEditionCtx: LinkEditionContext;
  current: LinkData | null;
  updateLink: (linkData: LinkData) => void;
  creationMode?: boolean;
};

// eslint-disable-next-line max-statements
export const LinkEditor: React.FC<LinkEditorProps> = ({
  linkEditionCtx,
  current,
  updateLink,
  creationMode,
}) => {
  const { t } = useTranslation();
  const suggestLink = createLinkSuggestor(linkEditionCtx);

  const [title, setTitle] = useState(current?.title ?? "");
  const [url, setUrl] = useState(current?.url ?? "");
  const [search, setSearch] = useState(
    current?.url ? getTitleFromRefUrl(current.url, linkEditionCtx) : "",
  );

  const [suggestions, setSuggestions] = useState<
    (
      | LinkSuggestion // A link suggestion returned by the relevant service, contains an entity reference
      | { type: "url"; title: string; url: string } // Just an URL
    )[]
  >([]);

  // Automatically perform a new search when the query changes
  useEffect(
    debounce(() => {
      if (search.startsWith("http://") || search.startsWith("https://")) {
        setSuggestions([{ type: "url", title: search, url: search }]);
        return;
      }

      suggestLink({ query: search }).then((suggestions) =>
        setSuggestions(
          suggestions.filter((suggestion) => suggestion.type === LinkType.PAGE),
        ),
      );
    }),
    [search, setSuggestions],
  );

  const submit = useCallback(
    (overrides?: { title?: string; url?: string }) => {
      updateLink({
        title: overrides?.title ?? title,
        url: overrides?.url ?? url,
      });
    },
    [updateLink, title, url],
  );

  const selectUrlResult = useCallback(
    (url: string) => {
      const reference = tryFallible(() =>
        linkEditionCtx.remoteURLParser.parse(url),
      );

      setSearch(
        reference
          ? linkEditionCtx.modelReferenceHandler.getTitle(reference)
          : url,
      );

      if (creationMode) {
        submit({ url });
      } else {
        setUrl(url);
      }
    },
    [setSearch, linkEditionCtx, creationMode, submit],
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <Stack>
      {!creationMode && (
        <Input
          leftSection={<RiText />}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => current && e.key === "Enter" && submit()}
        />
      )}

      <Combobox
        store={combobox}
        // We don't use a portal as BlockNote's toolbar closes on interaction with an element that isn't part of it in the DOM
        withinPortal={false}
        onOptionSubmit={(url) => {
          combobox.closeDropdown();
          selectUrlResult(url);
        }}
      >
        <Combobox.Target>
          <InputBase
            leftSection={<RiLink />}
            rightSection=" "
            value={search}
            onChange={(event) => {
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
              setSearch(event.currentTarget.value);
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              combobox.closeDropdown();
            }}
          />
        </Combobox.Target>

        <Combobox.Dropdown
          style={{
            zIndex: 10000,
            // These options are required due to not using a portal (see above)
            background: "white",
            borderRadius: "5px",
            boxShadow: "#CFCFCF 0px 4px 12px 0px",
          }}
        >
          <Combobox.Options>
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Combobox.Option value={suggestion.url} key={suggestion.url}>
                  {suggestion.title}
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>
                {t("blocknote.linkEditor.noResultFound")}
              </Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      {!creationMode && (
        <Button fullWidth type="submit" onClick={() => submit()}>
          {t("blocknote.linkEditor.submit")}
        </Button>
      )}
    </Stack>
  );
};

function getTitleFromRefUrl(
  url: string,
  linkEditionCtx: LinkEditionContext,
): string {
  const reference = tryFallible(() =>
    linkEditionCtx.remoteURLParser.parse(url),
  );

  return reference
    ? linkEditionCtx.modelReferenceHandler.getTitle(reference)
    : url;
}

export type { LinkData, LinkEditorProps };
