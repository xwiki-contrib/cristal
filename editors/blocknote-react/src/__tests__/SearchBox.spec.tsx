import { SearchBoxForTest } from "./SearchBox.story";
import { expect, test } from "@playwright/experimental-ct-react";

test("Options should appear", async ({ mount }) => {
  const component = await mount(<SearchBoxForTest />);

  await expect(component.locator("input")).toHaveValue(
    "Some great initial value",
  );

  await expect(component.locator(".mantine-Popover-dropdown")).toHaveText(
    "Suggestion title: Some great suggestion title starting with ",
  );
});

// eslint-disable-next-line max-statements
test("Options should be selectable", async ({ mount }) => {
  let selected = null;
  let submitted = null;

  const component = await mount(
    <SearchBoxForTest
      onSelect={(url) => {
        selected = url;
      }}
      onSubmit={(url) => {
        submitted = url;
      }}
    />,
  );

  await component.locator("input").click();

  await expect(component.locator(".mantine-Popover-dropdown")).toBeVisible();

  expect(selected).toBeNull();
  expect(submitted).toBeNull();

  await component.locator("input").press("ArrowDown");
  await component.locator("input").press("Enter");

  expect(selected).toBe("https://picsum.photos/");
  expect(submitted).toBeNull();

  await component.locator("input").clear();
  await component.locator("input").fill("https://perdu.com");
  await component.locator("input").press("Enter");

  expect(selected).toBe("https://picsum.photos/");
  expect(submitted).toBe("https://perdu.com");
});
