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
import { LinkEditor } from "./LinkEditor";
import { BlockType, EditorType, InlineContentType } from "../../blocknote";
import { useEditor } from "../../hooks";
import { LinkEditionContext } from "../../misc/linkSuggest";
import { formatKeyboardShortcut } from "@blocknote/core";
import {
  useComponentsContext,
  useDictionary,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import { ensureArrayType, tryFallible } from "@xwiki/cristal-fn-utils";
import { useCallback, useEffect, useState } from "react";
import { RiLink } from "react-icons/ri";

export type CustomCreateLinkButtonProps = {
  linkEditionCtx: LinkEditionContext;
};

// TODO: don't show this button if inside an internal or external link
// eslint-disable-next-line max-statements
export const CustomCreateLinkButton: React.FC<CustomCreateLinkButtonProps> = ({
  linkEditionCtx,
}) => {
  const editor = useEditor();
  const Components = useComponentsContext()!;
  const dict = useDictionary();

  const [selection, setSelection] =
    useState<ReturnType<typeof extractSelectedInlineContents>>(false);

  const [selectedText, setSelectedText] = useState(editor.getSelectedText());

  useEffect(() => {
    console.log(extractSelectedInlineContents(editor));
    setSelection(extractSelectedInlineContents(editor));
    setSelectedText(editor.getSelectedText());
  }, []);

  useEditorContentOrSelectionChange(() => {
    console.log(extractSelectedInlineContents(editor));
    setSelection(extractSelectedInlineContents(editor));
    setSelectedText(editor.getSelectedText());
  }, editor);

  const [showDropdown, setShowDropdown] = useState(false);

  const insertLink = useCallback(
    (url: string) => {
      if (selection === false) {
        return;
      }

      const reference = tryFallible(() =>
        linkEditionCtx.remoteURLParser.parse(url),
      );

      if (reference) {
        console.log({ selection });
        editor.insertInlineContent([
          {
            type: "InternalLink",
            props: {
              reference:
                linkEditionCtx.modelReferenceSerializer.serialize(reference)!,
            },
            content: selection,
          },
        ]);
      } else {
        editor.insertInlineContent(
          [
            {
              type: "link",
              href: url,
              content: selection,
            },
          ],
          { updateSelection: true },
        );
      }

      editor.focus();
    },
    [editor, selection],
  );

  if (selection === false) {
    return null;
  }

  return (
    <Components.Generic.Popover.Root opened={showDropdown}>
      <Components.Generic.Popover.Trigger>
        {/* TODO: hide tooltip on click
              (note: this comment is from BlockNote's source code but may remain relevant here) */}
        <Components.FormattingToolbar.Button
          className={"bn-button"}
          data-test="createLink"
          label={dict.formatting_toolbar.link.tooltip}
          mainTooltip={dict.formatting_toolbar.link.tooltip}
          secondaryTooltip={formatKeyboardShortcut(
            dict.formatting_toolbar.link.secondary_tooltip,
            dict.generic.ctrl_shortcut,
          )}
          icon={<RiLink />}
          onClick={() => setShowDropdown(true)}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content
        className={"bn-popover-content bn-form-popover"}
        variant={"form-popover"}
      >
        <LinkEditor
          creationMode
          linkEditionCtx={linkEditionCtx}
          current={{
            title: selectedText,
            url: "",
          }}
          updateLink={({ url }) => insertLink(url)}
        />
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
};

/**
 * Extracted the selected inline contents. Ensures no full block or link is selected.
 *
 * @param editor - The editor instance
 *
 * @returns - The selected inline contents, or `false` if blocks are selected
 */

function extractSelectedInlineContents(
  editor: EditorType,
):
  | Array<
      Exclude<InlineContentType, { type: "link" } | { type: "InternalLink" }>
    >
  | false {
  // Get the portion of the blocks that are currently selected
  // This also allows to check if the selection is inside a link, as links cannot contain blocks themselves
  const selection = editor.getSelectionCutBlocks();

  if (selection.blocks.length !== 1) {
    return false;
  }

  // Required as this is wrongly typed as a generic block (doesn't consider the custom BlockNote schema)
  const block = selection.blocks[0] as BlockType;

  // Don't consider blocks containing nested blocks
  if (block.children.length > 0) {
    return false;
  }

  const validateInlineContent = (inlineContents: InlineContentType[]) =>
    ensureArrayType(
      inlineContents,
      (content) => content.type !== "link" && content.type !== "InternalLink",
    );

  switch (block.type) {
    case "heading":
    case "Heading4":
    case "Heading5":
    case "Heading6":
    case "quote":
    case "paragraph":
    case "codeBlock":
    case "bulletListItem":
    case "numberedListItem":
    case "checkListItem":
      if (block.children.length > 0) {
        return false;
      }

      return validateInlineContent(block.content);

    case "image":
      return false;

    case "table": {
      // TODO: make this work once https://github.com/TypeCellOS/BlockNote/issues/1922 is solved
      return false;

      // if (block.content.rows.length !== 1) {
      //   return false;
      // }
      // const row = block.content.rows[0];
      // if (row.cells.length !== 1) {
      //   return false;
      // }
      // const cell = row.cells[0];
      // return validateInlineContent(Array.isArray(cell) ? cell : cell.content);
    }
  }
}
