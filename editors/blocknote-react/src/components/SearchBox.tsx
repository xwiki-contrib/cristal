import { LinkSuggestion } from "../misc/linkSuggest";
import { Combobox, InputBase, useCombobox } from "@mantine/core";
import { t } from "i18next";
import { debounce } from "lodash-es";
import { ReactElement, useEffect, useState } from "react";
import { RiLink } from "react-icons/ri";

export type SearchBoxProps = {
  initialValue?: string;
  placeholder: string;
  getSuggestions: (query: string) => Promise<LinkSuggestion[]>;
  renderSuggestion: (suggestion: LinkSuggestion) => ReactElement;
  onSelect: (url: string) => void;
  onSubmit: (url: string) => void;
};

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
          // These options are required due to not using a portal (see above)
          background: "white",
          borderRadius: "5px",
          boxShadow: "#CFCFCF 0px 4px 12px 0px",
        }}
      >
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
      </Combobox.Dropdown>
    </Combobox>
  );
};
