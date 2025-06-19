import { ImageEditor } from "./ImageEditor";
import { BlockOfType } from "../../blocknote";
import { useEditor } from "../../hooks";
import { LinkEditionContext } from "../../misc/linkSuggest";
import { Box } from "@mantine/core";
import { useCallback } from "react";

export type ImageFilePanelProps = {
  currentBlock: BlockOfType<"image">;
  linkEditionCtx: LinkEditionContext;
};

export const ImageFilePanel: React.FC<ImageFilePanelProps> = ({
  currentBlock: image,
  linkEditionCtx,
}) => {
  const editor = useEditor();

  const updateImage = useCallback(
    (url: string) => {
      console.log({ url });
      editor.updateBlock({ id: image.id }, { props: { url } });
      editor.focus();
    },
    [editor, image],
  );

  return (
    <Box bg="white" p="sm" bd="1px solid black">
      <ImageEditor linkEditionCtx={linkEditionCtx} onSelected={updateImage} />
    </Box>
  );
};
