import { createCustomBlockSpec } from "../utils";

function createCustomHeading(level: 4 | 5 | 6) {
  return createCustomBlockSpec({
    config: {
      type: `Heading${level}`,
      content: "inline",
      propSchema: {},
    },
    implementation: {
      render({ contentRef }) {
        return {
          [4]: <h4 ref={contentRef}></h4>,
          [5]: <h5 ref={contentRef}></h5>,
          [6]: <h6 ref={contentRef}></h6>,
        }[level];
      },
    },
    slashMenu: {
      title: `Heading ${level}`,
      group: "Headings",
      icon: <>H</>,
      aliases: [],
      default: {
        type: `Heading${level}`,
      },
    },
    toolbar: () => null,
  });
}

const Heading4 = createCustomHeading(4);
const Heading5 = createCustomHeading(5);
const Heading6 = createCustomHeading(6);

export { Heading4, Heading5, Heading6 };
