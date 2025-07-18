import { createMacro } from "../utils";

export const StandaloneMacro = createMacro({
  name: "StandaloneMacro",
  parameters: {
    salut: {
      type: "string",
    },
  },
  defaultParameters: {
    salut: "Yoh Man",
  },
  description: "-",
  renderType: "block",
  render(parameters, contentRef, openParamsEditor, id) {
    return (
      <strong>
        <em>{id}:</em> {parameters.salut}
      </strong>
    );
  },
});
