import { SearchBox } from "../components/SearchBox";
import { MantineProvider } from "@mantine/core";

export type SearchBoxForTestProps = {
  onSelect?: (url: string) => void;
  onSubmit?: (url: string) => void;
};

export const SearchBoxForTest: React.FC<SearchBoxForTestProps> = ({
  onSelect,
  onSubmit,
}) => {
  return (
    <MantineProvider>
      <SearchBox
        initialValue="Some great initial value"
        placeholder="Some super placeholder"
        getSuggestions={async (query) => [
          {
            type: 1,
            reference: "",
            segments: [],
            title: "Some great suggestion title starting with " + query,
            url: "https://picsum.photos/",
          },
        ]}
        renderSuggestion={(suggestion) => (
          <span>Suggestion title: {suggestion.title}</span>
        )}
        onSelect={(url) => onSelect?.(url)}
        onSubmit={(url) => onSubmit?.(url)}
      />
    </MantineProvider>
  );
};
