import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionProps } from "@tiptap/suggestion";
import { App, createApp } from "vue";
import Selector from "../../vue/c-tiptap-selector.vue";
import { CommandProps, Editor, Range } from "@tiptap/core";

const Slash = Extension.create({
  name: "slash",
  defaultOptions: {
    suggestion: {
      char: "/",
      startOfLine: true,
      command: ({ editor, range, props }) => {
        props.command({ editor, range, props });
      },
    },
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export interface CommandParams {
  editor: Editor;
  range: Range;
  props: SuggestionProps<unknown>;
}

export interface Action {
  title: string;
  command: (params: CommandParams) => void;
}

function getH1Action(): Action {
  return {
    title: "H1",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  };
}

function getH2Action(): Action {
  return {
    title: "H2",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  };
}

function getAllActions() {
  return [getH1Action(), getH2Action()];
}

function getSuggestionItems({ query }) {
  const actions = getAllActions();
  return actions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase()),
  );
}

function renderItems() {
  let app: App;
  let elemDiv: HTMLDivElement;

  return {
    onExit() {
      app?.unmount();
      document.body.removeChild(elemDiv);
    },
    onKeyDown(props) {
      const key = props.event.key;
      if (key === "Escape") {
        app?.unmount();
        document.body.removeChild(elemDiv);
        return true;
      }

      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter") {
        return (app._instance?.refs.container as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { key: key }),
        );
      }
      return false;
    },
    onStart(props) {
      elemDiv = document.createElement("div");
      document.body.appendChild(elemDiv);
      app = createApp(Selector, {
        props,
      });
      app.mount(elemDiv);
      // TODO: destroy when finished
    },
    onUpdate(props) {
      if (app._instance) {
        app._instance.props.props = props;
      }
    },
  };
}

export { Slash, renderItems, getSuggestionItems };
