import {
  UIExtension,
  UIExtensionsManager,
} from "@xwiki/cristal-uiextension-api";
import { injectable, multiInject } from "inversify";
import { filter, sortBy } from "lodash";

@injectable()
export class DefaultUIExtensionsManager implements UIExtensionsManager {
  constructor(
    @multiInject("UIExtension") private uiExtensions: UIExtension[],
  ) {}

  async list(name: string): Promise<UIExtension[]> {
    const filtered = filter(
      this.uiExtensions,
      (uix) => uix.uixpName === name && uix.enabled(),
    );

    return sortBy(filtered, [(uix) => uix.order]);
  }
}
