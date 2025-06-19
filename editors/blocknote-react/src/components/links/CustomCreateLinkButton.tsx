import { LinkEditionContext, LinkEditor } from "./LinkEditor";
import { useEditor } from "../../hooks";
import { formatKeyboardShortcut } from "@blocknote/core";
import { useComponentsContext, useDictionary } from "@blocknote/react";
import { useCallback, useState } from "react";
import { RiLink } from "react-icons/ri";

export type CustomCreateLinkButtonProps = {
  linkEditionCtx: LinkEditionContext;
};

export const CustomCreateLinkButton: React.FC<CustomCreateLinkButtonProps> = ({
  linkEditionCtx,
}) => {
  const editor = useEditor();
  const Components = useComponentsContext()!;
  const dict = useDictionary();

  const [opened, setOpened] = useState(false);

  const insertLink = useCallback(
    (url: string) => {
      editor.createLink(url);
      editor.focus();
    },
    [editor],
  );

  // TODO: update in realtime
  const selected = editor.getSelectedText();

  return (
    <Components.Generic.Popover.Root opened={opened}>
      <Components.Generic.Popover.Trigger>
        {/* TODO: hide tooltip on click */}
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
          onClick={() => setOpened(true)}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content
        className={"bn-popover-content bn-form-popover"}
        variant={"form-popover"}
      >
        <LinkEditor
          linkEditionCtx={linkEditionCtx}
          current={{
            title: selected,
            reference: null,
            url: "",
          }}
          hideTitle
          updateLink={({ url }) => insertLink(url)}
        />
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
};
