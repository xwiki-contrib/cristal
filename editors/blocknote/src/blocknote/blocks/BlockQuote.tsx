import { createCustomBlockSpec } from "../utils";

export const BlockQuote = createCustomBlockSpec({
  config: {
    type: "BlockQuote",
    content: "inline",
    propSchema: {},
  },
  implementation: {
    render({ contentRef }) {
      return <blockquote style={{ width: "100%" }} ref={contentRef} />;
    },
  },
  slashMenu: {
    title: "Blockquote",
    group: "Basic blocks",
    icon: <>B</>,
    aliases: [],
    create: () => ({
      type: "BlockQuote",
    }),
  },
  toolbar: () => <>TODO</>,
});
