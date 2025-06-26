import { BlockNoteForTest } from "./BlockNote.story";
import { expect, test } from "@playwright/experimental-ct-react";

test("BlockNote shows with empty content", async ({ mount }) => {
  const component = await mount(<BlockNoteForTest content={[]} />);

  await expect(component).toBeVisible();
  await expect(component).toHaveText("");
});

test("BlockNote shows with initial content", async ({ mount }) => {
  const component = await mount(
    <BlockNoteForTest
      content={[
        {
          id: "a",
          type: "paragraph",
          props: {
            backgroundColor: "default",
            textAlignment: "left",
            textColor: "default",
          },
          content: [
            {
              type: "text",
              text: "Hello world!",
              styles: {},
            },
          ],
          children: [],
        },
      ]}
    />,
  );

  await expect(component).toBeVisible();
  await expect(component).toHaveText("Hello world!");
});
