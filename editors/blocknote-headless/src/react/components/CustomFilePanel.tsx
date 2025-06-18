import { FilePanelProps } from "@blocknote/react";
import { css } from "@emotion/react";
// import { style } from "@vanilla-extract/css";

// const test = style({
//   backgroundColor: "red",
// });

export const CustomFilePanel: React.FC<FilePanelProps> = (props) => {
  return (
    <h1
      css={css`
        background-color: yellow;
      `}
    >
      Yeah!
    </h1>
  );
};
