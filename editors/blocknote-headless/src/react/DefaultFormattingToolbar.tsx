import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";

export type DefaultFormattingToolbarProps = {
  disableButtons?: {
    blockTypeSelect?: boolean;
    fileCaption?: boolean;
    fileReplace?: boolean;
    basicTextStyle?: boolean;
    textAlign?: boolean;
    colorStyle?: boolean;
    nestBlock?: boolean;
    unnestBlock?: boolean;
    createLink?: boolean;
  };
};

export const DefaultFormattingToolbar = ({
  disableButtons,
}: DefaultFormattingToolbarProps) => (
  <>
    {disableButtons?.blockTypeSelect !== true && (
      <BlockTypeSelect key={"blockTypeSelect"} />
    )}

    {disableButtons?.fileCaption !== true && (
      <FileCaptionButton key={"fileCaptionButton"} />
    )}

    {disableButtons?.fileReplace !== true && (
      <FileReplaceButton key={"replaceFileButton"} />
    )}

    {disableButtons?.basicTextStyle !== true && (
      <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
    )}

    {disableButtons?.basicTextStyle !== true && (
      <BasicTextStyleButton
        basicTextStyle={"italic"}
        key={"italicStyleButton"}
      />
    )}

    {disableButtons?.basicTextStyle !== true && (
      <BasicTextStyleButton
        basicTextStyle={"underline"}
        key={"underlineStyleButton"}
      />
    )}

    {disableButtons?.basicTextStyle !== true && (
      <BasicTextStyleButton
        basicTextStyle={"strike"}
        key={"strikeStyleButton"}
      />
    )}

    {disableButtons?.basicTextStyle !== true && (
      <BasicTextStyleButton key={"codeStyleButton"} basicTextStyle={"code"} />
    )}

    {disableButtons?.textAlign !== true && (
      <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />
    )}
    {disableButtons?.textAlign !== true && (
      <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />
    )}
    {disableButtons?.textAlign !== true && (
      <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />
    )}

    {disableButtons?.colorStyle !== true && (
      <ColorStyleButton key={"colorStyleButton"} />
    )}

    {disableButtons?.nestBlock !== true && (
      <NestBlockButton key={"nestBlockButton"} />
    )}
    {disableButtons?.unnestBlock !== true && (
      <UnnestBlockButton key={"unnestBlockButton"} />
    )}

    {disableButtons?.createLink !== true && (
      <CreateLinkButton key={"createLinkButton"} />
    )}
  </>
);
