import { LinkEditionContext } from "../../misc/linkSuggest";
import {
  Box,
  Button,
  FileInput,
  Select,
  Space,
  VisuallyHidden,
} from "@mantine/core";
import { debounce } from "@xwiki/cristal-fn-utils";
import { Link, LinkType } from "@xwiki/cristal-link-suggest-api";
import {
  AttachmentReference,
  DocumentReference,
} from "@xwiki/cristal-model-api";
import { useCallback, useEffect, useRef, useState } from "react";
import { RiLink } from "react-icons/ri";

export type ImageEditorProps = {
  linkEditionCtx: LinkEditionContext;
  onSelected: (url: string) => void;
};

export const ImageEditor: React.FC<ImageEditorProps> = ({
  linkEditionCtx,
  onSelected,
}) => {
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

  const [results, setResults] = useState<Link[]>([]);

  const searchAttachments = useCallback(
    debounce(async (query: string) => {
      const results = await linkEditionCtx.linkSuggestService.getLinks(
        query,
        LinkType.ATTACHMENT,
        "image/*",
      );

      setResults(results);
    }),
    [setResults],
  );

  // Start a first empty search on the first load, to not let the content empty.
  useEffect(() => {
    searchAttachments("");
  }, []);

  return (
    <Box>
      <Button variant="default" onClick={triggerUpload}>
        Upload
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
        data={results.map((result) => ({
          value: result.url,
          label: result.label,
        }))}
        onChange={(value) => value && onSelected(value)}
        renderOption={({ option }) => (
          <img style={{ maxWidth: "100%" }} src={option.value} />
        )}
        searchable
        comboboxProps={{ zIndex: 10000 }}
      />
    </Box>
  );
};
