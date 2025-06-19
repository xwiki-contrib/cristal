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
import { ImageFilePanel } from "./ImageFilePanel";
import { BlockOfType } from "../../blocknote";
import { LinkEditionContext } from "../../misc/linkSuggest";
import { useComponentsContext } from "@blocknote/react";
import { useState } from "react";
import { RiExternalLinkLine, RiPencilLine } from "react-icons/ri";

export type CustomImageToolbarProps = {
  currentBlock: BlockOfType<"image">;
  linkEditionCtx: LinkEditionContext;
};

export const CustomImageToolbar: React.FC<CustomImageToolbarProps> = ({
  currentBlock,
  linkEditionCtx,
}) => {
  const Components = useComponentsContext()!;

  const [showLinkEditor, setShowLinkEditor] = useState(false);

  return (
    <>
      <Components.Generic.Popover.Root opened={showLinkEditor}>
        <Components.Generic.Popover.Trigger>
          {/* TODO: hide tooltip on click */}
          <Components.FormattingToolbar.Button
            className="bn-button"
            label="Change image"
            icon={<RiPencilLine />}
            onClick={() => setShowLinkEditor(true)}
          />
        </Components.Generic.Popover.Trigger>
        <Components.Generic.Popover.Content
          className="bn-popover-content bn-form-popover"
          variant="form-popover"
        >
          <ImageFilePanel
            linkEditionCtx={linkEditionCtx}
            currentBlock={currentBlock}
          />
        </Components.Generic.Popover.Content>
      </Components.Generic.Popover.Root>

      <Components.FormattingToolbar.Button
        className="bn-button"
        label="Open target"
        icon={<RiExternalLinkLine />}
        onClick={() => window.open(currentBlock.props.url)}
      />

      {/* <Components.FormattingToolbar.Button
        className="bn-button"
        label="Delete link"
        icon={<RiDeleteBin6Line />}
        onClick={() => linkToolbarProps.deleteLink()}
      /> */}
    </>
  );
};
