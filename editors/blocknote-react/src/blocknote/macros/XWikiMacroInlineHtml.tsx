import { createMacro } from "../utils";

export const XWikiMacroInlineHtmlMacro = createMacro({
  name: "XWikiMacroInlineHtml",
  description: "",
  parameters: {
    html: { type: "string" },
    metadata: { type: "string" },
  },
  defaultParameters: {
    html: "",
    metadata: "",
  },
  renderType: "inline",
  hasChildren: false,
  render(parameters) {
    return <span dangerouslySetInnerHTML={{ __html: parameters.html }} />;
  },
});
