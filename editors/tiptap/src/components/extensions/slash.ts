import { Editor, Extension, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { App, createApp } from "vue";
import Selector from "../../vue/c-tiptap-selector.vue";
import { Plugin } from "prosemirror-state";
import { CommandParams } from "./menu-helpers";

const Slash = Extension.create({
  name: "slash",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        command: ({ editor, range, props }: CommandParams) => {
          props.command({ editor, range, props });
        },
        items: getSuggestionItems,
        render: renderItems,
      },
    };
  },
  addProseMirrorPlugins(): Plugin[] {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// TODO: add an icon, an alt description and a shortcut
/**
 * Defines the structure of a slash action descriptor.
 *
 * @since 0.8
 */
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

function getTableAction(): ActionDescriptor {
  return {
    title: "Table",
    command({ editor, range }) {
      editor.chain().focus().deleteRange(range).insertTable().run();
    },
  };
}

function getBlockquoteAction(): ActionDescriptor {
  return {
    title: "Blockquote",
    command({ editor, range }) {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  };
}

function getCodeBlockAction(): ActionDescriptor {
  return {
    title: "Code",
    command({ editor, range }) {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  };
}

function getAllActions(): ActionDescriptor[] {
  const getHeadingActions = [1, 2, 3, 4, 5, 6].map((level) =>
    getHeadingAction(level),
  );

  // TODO: add image, links and attachments.
  return [
    ...getHeadingActions,
    ...getListActions(),
    getTableAction(),
    getBlockquoteAction(),
    getCodeBlockAction(),
  ];
}

function getSuggestionItems({ query }: { query: string }): ActionDescriptor[] {
  const actions = getAllActions().filter((action) =>
    action!.title.toLowerCase().includes(query.toLowerCase()),
  );
  actions.sort((action0, action1) => {
    const title0 = action0.title;
    const title1 = action1.title;
    return title0 === title1 ? 0 : title0 > title1 ? 1 : -1;
  });
  return actions;
}

function renderItems() {
  let app: App;
  let elemDiv: HTMLDivElement;

  return {
    onExit() {
      app?.unmount();
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
