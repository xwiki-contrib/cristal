import { SearchBox } from "../components/SearchBox";
import { expect, test } from "@playwright/experimental-ct-react";
import { LinkType } from "@xwiki/cristal-link-suggest-api";

test("event should work", async ({ mount }) => {
  let selected = null;
  let submitted = null;

  const component = await mount(
    <SearchBox
      initialValue="Some great initial value"
      placeholder="Some super placeholder"
      getSuggestions={async (query) => [
        {
          type: LinkType.PAGE,
          reference: "",
          segments: [],
          title: "Some great suggestion title starting with " + query,
          url: "https://picsum.photos/",
        },
      ]}
      renderSuggestion={(suggestion) => (
        <span>Suggestion title: {suggestion.title}</span>
      )}
      onSelect={(url) => {
        selected = url;
      }}
      onSubmit={(url) => {
        submitted = url;
      }}
    />,
  );

  await expect(component).toContainClass("Some great initial value");
});
