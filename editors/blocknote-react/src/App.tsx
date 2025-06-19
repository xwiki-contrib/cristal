import {
  BlockNoteViewWrapper,
  BlockNoteViewWrapperProps,
} from "./components/BlockNoteViewWrapper";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

export const App = (props: BlockNoteViewWrapperProps) => {
  return (
    <MantineProvider>
      <BlockNoteViewWrapper {...props} />
    </MantineProvider>
  );
};
