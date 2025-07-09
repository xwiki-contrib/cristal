import { createMacro } from "../utils";

export const XWikiMacroHtmlBlockMacro = createMacro({
  name: "XWikiMacroHtmlBlock",
  description: "",
  parameters: {
    html: { type: "string" },
    metadata: { type: "string" },
  },
  defaultParameters: {
    html: "",
    metadata: "",
  },
  renderType: "block",
  render(parameters) {
    return <div dangerouslySetInnerHTML={{ __html: parameters.html }} />;
  },
});
