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
import { EditorType } from "../../blocknote";
import { useEditor } from "../../hooks";
import { LinkEditionContext } from "../../misc/linkSuggest";
import { LinkToolbarProps, useComponentsContext } from "@blocknote/react";
import { NodeSelection } from "@tiptap/pm/state";
import { tryFallible } from "@xwiki/cristal-fn-utils";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiDeleteBin6Line,
  RiExternalLinkLine,
  RiPencilLine,
} from "react-icons/ri";

export type CustomLinkToolbarProps = {
  linkToolbarProps: LinkToolbarProps;
  linkEditionCtx: LinkEditionContext;
};

export const CustomLinkToolbar: React.FC<CustomLinkToolbarProps> = ({
  linkToolbarProps,
  linkEditionCtx,
}) => {
  const Components = useComponentsContext()!;
  const { t } = useTranslation();
  const editor = useEditor();

  const [showLinkEditor, setShowLinkEditor] = useState(false);

  const editLink = useCallback(
    // eslint-disable-next-line max-statements
    ({ url, title }: { url: string; title: string }) => {
      // No link (internal or external) or existing external link =>
      //   * internal link: replace selection with an internal link element
      //   * external link: use editor.createLink()
      //
      // Existing internal link =>
      //   * internal link: find internal link node and update it
      //   * external link: replace selection with text node and use editor.createLink()

      const referenceObj = tryFallible(() =>
        linkEditionCtx.remoteURLParser.parse(url),
      );

      const reference = referenceObj
        ? linkEditionCtx.modelReferenceSerializer.serialize(referenceObj)!
        : null;

      const state = editor.prosemirrorView!.state;

      const externalLink = findSelectLinkCoords(editor);

      if (externalLink) {
        if (reference) {
          editor.transact((tr) => {
            const selection = NodeSelection.create(
              state.doc,
              externalLink.start,
            );

            tr.setSelection(selection);

            editor.insertInlineContent(
              [
                {
                  type: "InternalLink",
                  props: { reference },
                  content: editor.getSelectedText(),
                },
              ],
              {
                updateSelection: true,
              },
            );
          });
        } else {
          linkToolbarProps.editLink(url, title);
        }

        return;
      }

      const pos = state.selection.$from;

      for (let i = pos.depth; i > 0; i--) {
        const node = pos.node(i);
        if (node.type.name === "InternalLink") {
          // internalLink = {
          //   pos: i > 0 ? $pos.before(i) : 0,
          //   start: $pos.start(i),
          //   depth: i,
          //   node,
          // };

          // TODO: update NODE

          return;
        }
      }

      throw new Error("Unreachable: no links found in link editor");

      // linkToolbarProps.editLink(url, title)
    },
    [editor],
  );

  return (
    <>
      <Components.Generic.Popover.Root opened={showLinkEditor}>
        <Components.Generic.Popover.Trigger>
          {/* TODO: hide tooltip on click
              (note: this comment is from BlockNote's source code but may remain relevant here) */}
          <Components.FormattingToolbar.Button
            className="bn-button"
            label={t("blocknote.linkToolbar.buttons.edit")}
            icon={<RiPencilLine />}
            onClick={() => setShowLinkEditor(true)}
          />
        </Components.Generic.Popover.Trigger>
        <Components.Generic.Popover.Content
          className="bn-popover-content bn-form-popover"
          variant="form-popover"
        >
          <LinkEditor
            linkEditionCtx={linkEditionCtx}
            current={{
              url: linkToolbarProps.url,
              title: linkToolbarProps.text,
            }}
            updateLink={({ url, title }) => editLink({ url, title })}
          />
        </Components.Generic.Popover.Content>
      </Components.Generic.Popover.Root>

      <Components.FormattingToolbar.Button
        className="bn-button"
        label={t("blocknote.linkToolbar.buttons.open")}
        icon={<RiExternalLinkLine />}
        onClick={() => window.open(linkToolbarProps.url)}
      />

      <Components.FormattingToolbar.Button
        className="bn-button"
        label={t("blocknote.linkToolbar.buttons.delete")}
        icon={<RiDeleteBin6Line />}
        onClick={() => linkToolbarProps.deleteLink()}
      />
    </>
  );
};

/**
 * Find the link's coordinates the cursor is inside of (note: only for 'normal' links, not internal ones)
 *
 * @param editor - The BlockNote editor instance
 *
 * @returns - The selected link's coordinates, or `false` if the cursor is not inside a link
 */
// eslint-disable-next-line max-statements
function findSelectLinkCoords(
  editor: EditorType,
): { start: number; end: number } | false {
  const state = editor.prosemirrorState!;
  const { $from, $to } = state.selection;

  // Check if we're in a link
  const linkMark = $from.marks().find((mark) => mark.type.name === "link");
  if (!linkMark) {
    return false;
  }

  // Find the start and end of the link
  let start = $from.pos;
  let end = $to.pos;

  // Expand backwards to find link start
  while (start > 0) {
    const $pos = state.doc.resolve(start - 1);
    const marks = $pos.marks();
    if (
      !marks.some(
        (mark) =>
          mark.type.name === "link" && mark.attrs.href === linkMark.attrs.href,
      )
    ) {
      break;
    }
    start--;
  }

  // Expand forwards to find link end
  while (end < state.doc.content.size) {
    const $pos = state.doc.resolve(end);
    const marks = $pos.marks();
    if (
      !marks.some(
        (mark) =>
          mark.type.name === "link" && mark.attrs.href === linkMark.attrs.href,
      )
    ) {
      break;
    }
    end++;
  }

  return { start, end };
}
