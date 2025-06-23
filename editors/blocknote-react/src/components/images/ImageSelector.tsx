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
import { LinkEditionContext, LinkSuggestion } from "../../misc/linkSuggest";
import {
  Box,
  Breadcrumbs,
  Button,
  FileInput,
  Flex,
  Select,
  Space,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import {
  AttachmentReference,
  DocumentReference,
} from "@xwiki/cristal-model-api";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiAttachmentLine, RiLink } from "react-icons/ri";

export type ImageSelectorProps = {
  linkEditionCtx: LinkEditionContext;
  onSelected: (url: string) => void;
};

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  linkEditionCtx,
  onSelected,
}) => {
  const { t } = useTranslation();

  const fileUploadRef = useRef<HTMLButtonElement>(null);

  const triggerUpload = useCallback(() => {
    fileUploadRef?.current?.click();
  }, [fileUploadRef]);

  const fileSelected = useCallback(
    async (file: File) => {
      const currentPageName =
        linkEditionCtx.documentService.getCurrentDocumentReferenceString()
          .value ?? "";

      await linkEditionCtx.attachmentsService.upload(currentPageName, [file]);

      const parser =
        linkEditionCtx.modelReferenceParser?.parse(currentPageName);

      const url = linkEditionCtx.remoteURLSerializer?.serialize(
        new AttachmentReference(file.name, parser as DocumentReference),
      );

      if (url) {
        onSelected(url);
      }
    },
    [onSelected],
  );

  const [results, setResults] = useState<LinkSuggestion[]>([]);

  const searchAttachments = useCallback(
    debounce(async (query: string) => {
      const results = await linkEditionCtx.linkSuggestService.getLinks(
        query,
        LinkType.ATTACHMENT,
        "image/*",
      );

      const suggestions = results.map((link): LinkSuggestion => {
        const attachmentReference = linkEditionCtx.modelReferenceParser?.parse(
          link.reference,
        ) as AttachmentReference;

        const documentReference = attachmentReference.document;
        const segments = documentReference.space?.names.slice(0) ?? [];

        if (documentReference.terminal) {
          segments.push(documentReference.name);
        }

        return {
          type: link.type,
          title: link.label,
          reference: link.reference,
          url: link.url,
          segments,
        };
      });

      setResults(suggestions);
    }),
    [setResults],
  );

  // Start a first empty search on the first load, to not let the results empty.
  useEffect(() => {
    searchAttachments("");
  }, []);

  return (
    <Box>
      <Button variant="default" onClick={triggerUpload}>
        {t("blocknote.imageSelector.uploadButton")}
      </Button>

      <Space h="sm" />

      <VisuallyHidden>
        <FileInput
          ref={fileUploadRef}
          accept="image/*"
          onChange={(file) => file && fileSelected(file)}
        />
      </VisuallyHidden>

      <Select
        leftSection={<RiLink />}
        rightSection=" "
        searchable
        data={results.map((result) => ({
          value: result.url,
          label: result.title,
        }))}
        onChange={(value) => value && onSelected(value)}
        renderOption={({ option }) => {
          const link = results.find((result) => result.url === option.value)!;

          return (
            <Flex gap="sm">
              <img src={option.value} style={{ maxWidth: "100px" }} />
              <Stack justify="center">
                <Text>
                  <RiAttachmentLine /> {link.title}
                </Text>
                <Breadcrumbs c="gray">
                  {link.segments.map((segment, i) => (
                    <Text key={`${i}${segment}`}>{segment}</Text>
                  ))}
                </Breadcrumbs>
              </Stack>
            </Flex>
          );
        }}
        comboboxProps={{ zIndex: 10000, width: "auto" }}
      />
    </Box>
  );
};
