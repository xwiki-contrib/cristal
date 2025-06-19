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

import { CustomCreateLinkButton } from "./links/CustomCreateLinkButton.js";
import { LinkEditionContext } from "./links/LinkEditor.js";
import { BlockType } from "../blocknote/index.js";
import { useEditor } from "../hooks.js";
import {
  AddCommentButton,
  AddTiptapCommentButton,
  BasicTextStyleButton,
  BlockTypeSelect,
  BlockTypeSelectItem,
  ColorStyleButton,
  FileCaptionButton,
  FileDeleteButton,
  FileDownloadButton,
  FilePreviewButton,
  FileRenameButton,
  FileReplaceButton,
  FormattingToolbarProps,
  NestBlockButton,
  TableCellMergeButton,
  TextAlignButton,
  UnnestBlockButton,
  useComponentsContext,
} from "@blocknote/react";
import { JSX } from "react";

const PREFIX_DEFAULT_TOOLBAR_FOR_ITEM_TYPES: Array<BlockType["type"]> = [
  "paragraph",
  "quote",
  "heading",
  "Heading4",
  "Heading5",
  "Heading6",
  "bulletListItem",
  "checkListItem",
  "numberedListItem",
  "column",
  "columnList",
  "codeBlock",
  "table",
];

export type CustomFormattingToolbarProps = {
  formattingToolbarProps: FormattingToolbarProps;
  linkEditionCtx: LinkEditionContext;
};

export const CustomFormattingToolbar: React.FC<
  CustomFormattingToolbarProps
> = ({ formattingToolbarProps, linkEditionCtx }) => {
  const Components = useComponentsContext()!;

  const editor = useEditor();

  return (
    <Components.FormattingToolbar.Root
      className={"bn-toolbar bn-formatting-toolbar"}
    >
      {PREFIX_DEFAULT_TOOLBAR_FOR_ITEM_TYPES.includes(
        editor.getTextCursorPosition().block.type,
      ) &&
        getDefaultFormattingToolbarItems(
          formattingToolbarProps.blockTypeSelectItems,
          linkEditionCtx,
        )}
    </Components.FormattingToolbar.Root>
  );
};

const getDefaultFormattingToolbarItems = (
  blockTypeSelectItems: BlockTypeSelectItem[] | undefined,
  linkEditionCtx: LinkEditionContext,
): JSX.Element[] => [
  <BlockTypeSelect key={"blockTypeSelect"} items={blockTypeSelectItems} />,
  <TableCellMergeButton key={"tableCellMergeButton"} />,
  <FileCaptionButton key={"fileCaptionButton"} />,
  <FileReplaceButton key={"replaceFileButton"} />,
  <FileRenameButton key={"fileRenameButton"} />,
  <FileDeleteButton key={"fileDeleteButton"} />,
  <FileDownloadButton key={"fileDownloadButton"} />,
  <FilePreviewButton key={"filePreviewButton"} />,
  <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />,
  <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />,
  <BasicTextStyleButton
    basicTextStyle={"underline"}
    key={"underlineStyleButton"}
  />,
  <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />,
  <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />,
  <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />,
  <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />,
  <ColorStyleButton key={"colorStyleButton"} />,
  <NestBlockButton key={"nestBlockButton"} />,
  <UnnestBlockButton key={"unnestBlockButton"} />,
  <CustomCreateLinkButton
    key={"createLinkButton"}
    linkEditionCtx={linkEditionCtx}
  />,
  <AddCommentButton key={"addCommentButton"} />,
  <AddTiptapCommentButton key={"addTiptapCommentButton"} />,
];
