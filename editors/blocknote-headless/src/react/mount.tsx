import {
  BlockNoteViewWrapper,
  BlockNoteViewWrapperProps,
} from "./components/BlockNoteViewWrapper";
import { createRoot } from "react-dom/client";

export function mountBlockNote(
  containerEl: HTMLElement,
  props: BlockNoteViewWrapperProps,
): { unmount: () => void } {
  const root = createRoot(containerEl);

  root.render(<BlockNoteViewWrapper {...props} />);

  let unmounted = false;

  return {
    unmount() {
      if (unmounted) {
        throw new Error("BlockNote is already unmounted!");
      }

      unmounted = true;
      root.unmount();
    },
  };
}
