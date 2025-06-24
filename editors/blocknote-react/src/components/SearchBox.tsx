import { LinkSuggestion } from "../misc/linkSuggest";
import { Combobox, InputBase, Paper, useCombobox } from "@mantine/core";
import { t } from "i18next";
import { debounce } from "lodash-es";
import { ReactElement, useEffect, useState } from "react";
import { RiLink } from "react-icons/ri";

export type SearchBoxProps = {
  /**
   * The search box's initial value
   */
  initialValue?: string;

  /**
   * The search box's placeholder (when empty)
   */
  placeholder: string;

  /**
   * Perform a search
   *
   * @param query - A user query (text)
   *
   * @returns Suggestions matching the provided query
   */
  getSuggestions: (query: string) => Promise<LinkSuggestion[]>;

  /**
   * Render a single suggestion
   *
   * @param suggestion -
   *
   * @returns A JSX element
   */
  renderSuggestion: (suggestion: LinkSuggestion) => ReactElement;

  /**
   * Triggered when a result is selected in the list of suggestions
   */
  onSelect: (url: string) => void;

  /**
   * Triggered when a result is submitted by the user
   *
   * e.g. when the user uses the `<Enter>` key on an URL
   */
  onSubmit: (url: string) => void;
};

/**
 * This component provides a search (text) field with a dropdown for the results
 *
 * Raw URLs input is supported.
 *
 * @see SearchBoxProps
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  initialValue,
  placeholder,
  getSuggestions,
  renderSuggestion,
  onSelect,
  onSubmit,
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);

  const isUrl = (value: string) =>
    value.startsWith("http://") || value.startsWith("https://");

  useEffect(
    debounce(() => {
      if (isUrl(search)) {
        setSuggestions([]);
        return;
      }

      getSuggestions(search).then((suggestions) => {
        setSuggestions(suggestions);
      });
    }),
    [search, getSuggestions, setSuggestions],
  );

  return (
    <Combobox
      store={combobox}
      // We don't use a portal as BlockNote's toolbar closes on interaction with an element that isn't part of it in the DOM
      withinPortal={false}
      onOptionSubmit={(url) => {
        combobox.closeDropdown();
        setSearch(suggestions.find((s) => s.url === url)?.title ?? url);
        onSelect(url);
      }}
    >
      <Combobox.Target>
        <InputBase
          leftSection={<RiLink />}
          rightSection=" "
          placeholder={placeholder}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
          }}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            isUrl(e.currentTarget.value) &&
            onSubmit(e.currentTarget.value)
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown
        style={{
          zIndex: 10000,
        }}
      >
        <Paper shadow="md" p="sm">
          <Combobox.Options>
            {suggestions.length > 0
              ? suggestions.map((suggestion) => (
                  <Combobox.Option value={suggestion.url} key={suggestion.url}>
                    {renderSuggestion(suggestion)}
                  </Combobox.Option>
                ))
              : !isUrl(search) && (
                  <Combobox.Empty>
                    {t("blocknote.combobox.noResultFound")}
                  </Combobox.Empty>
                )}
          </Combobox.Options>
        </Paper>
      </Combobox.Dropdown>
    </Combobox>
  );
};
