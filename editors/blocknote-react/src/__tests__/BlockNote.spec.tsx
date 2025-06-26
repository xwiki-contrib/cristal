import { BlockNoteForTest } from "./BlockNote.story";
import { BlockType } from "../blocknote";
import { expect, test } from "@playwright/experimental-ct-react";

test("BlockNote shows with empty content", async ({ mount }) => {
  const component = await mount(<BlockNoteForTest content={[]} />);

  await expect(component).toBeVisible();
  await expect(component).toHaveText("");
});

test("BlockNote shows with initial content", async ({ mount }) => {
  const component = await mount(
    <BlockNoteForTest content={buildParagraphs(["Hello,", "world!"])} />,
  );

  await expect(component).toBeVisible();
  await expect(component).toHaveText("Hello,world!");
});

test("BlockNote's content can be modified", async ({ mount }) => {
  const component = await mount(<BlockNoteForTest content={[]} />);

  await component.locator(".bn-editor").fill("Some basic content!!!");
  await expect(component).toHaveText("Some basic content!!!");

  await component.locator(".bn-editor").press("Backspace");
  await component.locator(".bn-editor").press("Backspace");
  await component.locator(".bn-editor").press("Backspace");
  await expect(component).toHaveText("Some basic content");
});

function buildParagraphs(blocks: string[]): BlockType[] {
  return blocks.map((blockText, i) => ({
    id: i.toString(),
    type: "paragraph",
    props: {
      backgroundColor: "default",
      textAlignment: "left",
      textColor: "default",
    },
    content: [
      {
        type: "text",
        text: blockText,
        styles: {},
      },
    ],
    children: [],
  }));
}
