import { DefaultWikiConfig } from "@xwiki/cristal-api";
import { inject, injectable, named } from "inversify";
import type { CristalApp, Logger, Storage } from "@xwiki/cristal-api";

@injectable()
export class DocsWikiConfig extends DefaultWikiConfig {
  override storage: Storage;
  override cristal: CristalApp;

  constructor(
    @inject("Logger") logger: Logger,
    @inject("Storage") @named("Docs") storage: Storage,
    @inject("CristalApp") cristal: CristalApp,
  ) {
    super(logger);
    this.cristal = cristal;
    this.storage = storage;
    this.storage.setWikiConfig(this);
  }

  override isSupported(/*format: string*/): boolean {
    // TODO: improve is support
    return true;
  }

  override defaultPageName(): string {
    // TODO: might need to be changed?
    return "home";
  }

  override getType(): string {
    return "Docs";
  }
}
