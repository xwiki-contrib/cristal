import { Editor, Extension, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { App, createApp } from "vue";
import Selector from "../../vue/c-tiptap-selector.vue";
import { Plugin } from "prosemirror-state";
import { CommandParams } from "./menu-helpers";

const Slash = Extension.create({
  name: "slash",
  // TODO: defaultOptions is deprecated, addOptions must be used instead.
  defaultOptions: {
    suggestion: {
      char: "/",
      startOfLine: true,
      command: ({ editor, range, props }: CommandParams) => {
        props.command({ editor, range, props });
      },
      items: getSuggestionItems,
      render: renderItems,
    },
  },
  addProseMirrorPlugins(): Plugin[] {
    return [
      // @ts-expect-error TODO: this seems to be working but we need to understand
      // why the types are not accepted.
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export interface Action {
  title: string;
  command: (params: CommandParams) => void;
}

// TODO: add an icon, an alt description and a shortcut
export interface ActionDescriptor {
  title: string;
  command: (commandParams: { editor: Editor; range: Range }) => void;
}

// TODO: the isCode condition as well as active condition are note useful here.
// They should only be displayed for contextual selections.
function getHeadingAction(level: number): ActionDescriptor {
  return {
    title: `H${level}`,
    command({ editor, range }) {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: level })
        .run();
    },
  };
}

function getListActions(): ActionDescriptor[] {
  return [
    {
      title: "Bulleted list",
      command({ editor, range }) {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Ordered list",
      command({ editor, range }) {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
  ];
}

function getAllActions(): ActionDescriptor[] {
  const getHeadingActions = [1, 2, 3, 4, 5, 6].map((level) =>
    getHeadingAction(level),
  );

  // TODO: add image, links and attachments.
  return [...getHeadingActions, ...getListActions()];
}

function getSuggestionItems({ query }: { query: string }): Action[] {
  const actions = getAllActions();
  return actions.filter((action) =>
    action!.title.toLowerCase().includes(query.toLowerCase()),
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
    onKeyDown({ event }: { event: KeyboardEvent }) {
      const key = event.key;
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
    onStart(props: unknown) {
      elemDiv = document.createElement("div");
      document.body.appendChild(elemDiv);
      app = createApp(Selector, {
        props,
      });
      app.mount(elemDiv);
      // TODO: destroy when finished
    },
    onUpdate(props: unknown) {
      if (app._instance) {
        app._instance.props.props = props;
      }
    },
  };
}

export { Slash, renderItems, getSuggestionItems };
