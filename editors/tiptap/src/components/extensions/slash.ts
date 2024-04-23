import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { createApp } from "vue";
import Selector from "../../vue/Selector.vue";
import { App } from "@vue/runtime-core";

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

function getSuggestionItems(query) {
  console.log("QUERY", query);
  return [
    {
      title: "H1",
      command: ({ editor, range, props }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
  ];
}

function renderItems() {
  let component: App;
  let elemDiv: HTMLDivElement;

  return {
    onStart(props) {
      elemDiv = document.createElement("div");
      document.body.appendChild(elemDiv);
      component = createApp(Selector, {
        clientRect: props.clientRect,
      });
      component.mount(elemDiv);
      // TODO: destroy when finished
    },
    onUpdate(props) {
      console.log("ON UPDATE", props);
    },
    onKeyDown(props) {
      console.log("ON KEY DOWN", props);
    },
    onExit() {
      component?.unmount();
      document.body.removeChild(elemDiv);
    },
  };
}

export { Slash, renderItems, getSuggestionItems };
