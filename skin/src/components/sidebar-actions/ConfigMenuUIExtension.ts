import { type UIExtension } from "@xwiki/cristal-uiextension-api";
import { injectable } from "inversify";
import { type Component } from "vue";

@injectable()
export class ConfigMenuUIExtension implements UIExtension {
  id = "sidebar.actions.configMenu";
  uixpName = "sidebar.actions";
  order = 1000;
  parameters = {};

  async component(): Promise<Component> {
    return (await import("../../vue/c-config-menu.vue")).default;
  }

  enabled(): boolean {
    return true;
  }
}
