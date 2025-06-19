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
