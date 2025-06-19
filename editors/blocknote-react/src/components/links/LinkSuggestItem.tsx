import { LinkSuggestion } from "../../../components/linkSuggest";
import { CSSProperties } from "react";

export type LinkSuggestionItemProps = {
  link: LinkSuggestion;
  isImage: boolean;
};

export const LinkSuggestionItem: React.FC<LinkSuggestionItemProps> = ({
  link,
  isImage,
}) => {
  return (
    <>
      <div style={{}}></div>
    </>
  );
};

const styles = {
  parent: {
    display: "grid",
    gridTemplateColumns: "repeat(2, auto)",
    gridTemplateRows: "repeat(2, auto)",
    gridColumnGap: 0,
    gridRowGap: 0,
    cursor: "pointer",
  },
} satisfies Record<string, CSSProperties>;
