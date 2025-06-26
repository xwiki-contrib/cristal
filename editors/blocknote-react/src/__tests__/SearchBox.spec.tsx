import { SearchBoxForTest } from "./SearchBox.story";
import { expect, test } from "@playwright/experimental-ct-react";

test("Options should appear", async ({ mount }) => {
  const component = await mount(<SearchBoxForTest />);

  await expect(component.locator("input")).toHaveValue(
    "Some great initial value",
  );

  await expect(
    component.locator(
      ".mantine-Popover-dropdown .mantine-Combobox-option:nth-child(1)",
    ),
  ).toHaveText("Suggestion title: Some great suggestion title starting with ");

  await expect(
    component.locator(
      ".mantine-Popover-dropdown .mantine-Combobox-option:nth-child(2)",
    ),
  ).toHaveText(
    "Suggestion title: Another great suggestion title starting with ",
  );
});

test("Options should update depending on the input value", async ({
  mount,
}) => {
  const component = await mount(<SearchBoxForTest />);

  await component.locator("input").clear();
  await component.locator("input").fill("Test input");

  await expect(
    component.locator(
      ".mantine-Popover-dropdown .mantine-Combobox-option:nth-child(1)",
    ),
  ).toHaveText(
    "Suggestion title: Some great suggestion title starting with Test input",
  );

  await expect(
    component.locator(
      ".mantine-Popover-dropdown .mantine-Combobox-option:nth-child(2)",
    ),
  ).toHaveText(
    "Suggestion title: Another great suggestion title starting with Test input",
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

  expect(selected).toBe("https://picsum.photos/150");
  expect(submitted).toBeNull();

  await component.locator("input").clear();
  await component.locator("input").fill("https://perdu.com");
  await component.locator("input").press("Enter");

  expect(selected).toBe("https://picsum.photos/150");
  expect(submitted).toBe("https://perdu.com");
});

// eslint-disable-next-line max-statements
test("Options should be navigable", async ({ mount }) => {
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
  await component.locator("input").press("ArrowDown");
  await component.locator("input").press("Enter");

  expect(selected).toBe("https://picsum.photos/300");
  expect(submitted).toBeNull();
});
