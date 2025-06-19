import { LinkEditionContext, LinkEditor } from "./LinkEditor";
import { LinkToolbarProps, useComponentsContext } from "@blocknote/react";
import { tryFallible } from "@xwiki/cristal-fn-utils";
import { useState } from "react";
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

  const [showLinkEditor, setShowLinkEditor] = useState(false);

  return (
    <>
      <Components.Generic.Popover.Root opened={showLinkEditor}>
        <Components.Generic.Popover.Trigger>
          {/* TODO: hide tooltip on click */}
          <Components.FormattingToolbar.Button
            className="bn-button"
            label="Edit link"
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
              reference: tryFallible(
                () =>
                  linkEditionCtx.remoteURLParser.parse(linkToolbarProps.url) ??
                  null,
              ),
              title: linkToolbarProps.text,
            }}
            hideTitle
            updateLink={({ url, title }) =>
              linkToolbarProps.editLink(url, title)
            }
          />
        </Components.Generic.Popover.Content>
      </Components.Generic.Popover.Root>

      <Components.FormattingToolbar.Button
        className="bn-button"
        label="Open target"
        icon={<RiExternalLinkLine />}
        onClick={() => window.open(linkToolbarProps.url)}
      />

      <Components.FormattingToolbar.Button
        className="bn-button"
        label="Delete link"
        icon={<RiDeleteBin6Line />}
        onClick={() => linkToolbarProps.deleteLink()}
      />
    </>
  );
};
