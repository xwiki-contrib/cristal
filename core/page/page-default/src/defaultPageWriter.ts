import { PageWriter } from "@xwiki/cristal-page-api";
import { stringify } from "yaml";

class DefaultPageWriter implements PageWriter {
  writePage(page: { [key: string]: unknown }): string {
    const { pageContent, ...metadata } = page;
    if (metadata && Object.keys(metadata).length > 0) {
      return `---
${stringify(metadata)}---
${pageContent ?? ""}`;
    } else {
      return (pageContent ?? "") as string;
    }
  }
}

export { DefaultPageWriter };
