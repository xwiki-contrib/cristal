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
  createLinkSuggestor,
} from "../../misc/linkSuggest";
import { SearchBox } from "../SearchBox";
import { Button, Input, Stack, Text, useCombobox } from "@mantine/core";
import { tryFallible } from "@xwiki/cristal-fn-utils";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiText } from "react-icons/ri";

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

  const submit = useCallback(
    (overrides?: { title?: string; url?: string }) => {
      updateLink({
        title: overrides?.title ?? title,
        url: overrides?.url ?? url,
      });
    },
    [updateLink, title, url],
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
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) =>
            current &&
            e.key === "Enter" &&
            submit({ title: e.currentTarget.value })
          }
        />
      )}

      <SearchBox
        placeholder={t("blocknote.linkEditor.placeholder")}
        initialValue={
          current?.url
            ? getSerializedReference(current.url, linkEditionCtx)
            : ""
        }
        getSuggestions={(query) =>
          suggestLink({ query }).then((suggestions) =>
            suggestions.filter(
              (suggestion) => suggestion.type === LinkType.PAGE,
            ),
          )
        }
        renderSuggestion={(label) => <Text>{label.title}</Text>}
        onSelect={(url) => (creationMode ? submit({ url }) : setUrl(url))}
        onSubmit={(url) => submit({ url })}
      />

      {!creationMode && (
        <Button fullWidth type="submit" onClick={() => submit()}>
          {t("blocknote.linkEditor.submit")}
        </Button>
      )}
    </Stack>
  );
};

function getSerializedReference(
  url: string,
  linkEditionCtx: LinkEditionContext,
): string {
  const reference = tryFallible(() =>
    linkEditionCtx.remoteURLParser.parse(url),
  );

  return reference
    ? linkEditionCtx.modelReferenceSerializer.serialize(reference)!
    : url;
}

export type { LinkData, LinkEditorProps };
