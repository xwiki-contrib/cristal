import { createCustomBlockSpec } from "../utils";
import { defaultProps } from "@blocknote/core";

export const Alert = createCustomBlockSpec({
  config: {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      backgroundColor: defaultProps.backgroundColor,
      type: {
        default: "warning",
        values: ["warning", "error", "info", "success"],
      },
    },
    content: "inline",
  },
  implementation: {
    render(props) {
      console.log("Updated!");

      const callback = () => {
        const color = `#${new Array(6)
          .fill(0)
          .map(() => Math.floor(Math.random() * 10))
          .join("")}`;

        console.log("Updating !");

        props.editor.updateBlock(props.block, {
          props: {
            backgroundColor: color,
          },
        });
      };

      return (
        <div
          style={{
            border: "1px solid gray",
            padding: "5px",
            display: "flex",
            backgroundColor: props.block.props.backgroundColor,
          }}
        >
          <button
            onClick={callback}
            style={{
              backgroundColor: "gray",
              padding: "2px",
              marginRight: "5px",
              cursor: "pointer",
            }}
          >
            Change color!
          </button>

          {props.block.props.backgroundColor}

          <span
            ref={props.contentRef}
            style={{ padding: "3px", border: "1px solid blue" }}
          />
        </div>
      );
    },
  },
  slashMenu: {
    title: "Alert",
    aliases: ["alert", "notification"],
    group: "Other",
    icon: <></>,
    create: () => ({
      type: "alert",
    }),
  },
  toolbar: () => <strong>TODO: toolbar for Alert</strong>,
});
