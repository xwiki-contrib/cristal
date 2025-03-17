import { BlockType } from "..";
import { createCustomBlockSpec, upgradeEditorType } from "../utils";

export const TableOfContents = createCustomBlockSpec({
  config: {
    type: "toc",
    content: "inline",
    propSchema: {},
  },

  implementation: {
    render(props) {
      const editor = upgradeEditorType(props.editor);
      const headings = collectHeadings(editor.document);

      console.log(headings);

      return (
        <ul style={{ border: "1px solid black", padding: "5px" }}>
          {headings.map((heading) => (
            <HeadingWithChildren key={heading.blockId} heading={heading} />
          ))}
        </ul>
      );
    },
  },

  slashMenu: {
    title: "Table of Contents",
    icon: <>T</>,
    group: "Other",
    aliases: [],
    create: () => ({
      type: "toc",
    }),
  },

  toolbar: () => <strong>TODO: toolbar for TableOfContents</strong>,
});

// TODO: consider level as it's required if we go from e.g. heading level 2 to 5 immediately
function HeadingWithChildren({ heading: { name } }: { heading: Heading }) {
  return (
    <>
      <li>{name}</li>
      {/* {children && (
        <ul>
          {children.map((child) => (
            <HeadingWithChildren key={child.blockId} heading={child} />
          ))}
        </ul>
      )} */}
    </>
  );
}

type Heading = {
  blockId: string;
  level: number;
  name: string;
};

function collectHeadings(blocks: BlockType[]): Heading[] {
  const headings = new Array<Heading>();

  for (const block of blocks) {
    if (block.type !== "heading") {
      continue;
    }

    if (block.content.length !== 1 || block.content[0].type !== "text") {
      console.warn("Only plain text headings are supported, skipping: ", {
        block,
      });
      continue;
    }

    headings.push({
      blockId: block.id,
      level: block.props.level,
      name: block.content[0].text,
    });
  }

  return headings;
}
