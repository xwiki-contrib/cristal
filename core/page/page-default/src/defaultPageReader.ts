import { PageReader } from "@xwiki/cristal-page-api";
import { parse } from "yaml";

class DefaultPageReader implements PageReader {
  readPage(pageContent: string): { [key: string]: unknown } {
    const lines = pageContent.split("\n");
    if (lines[0] == "---") {
      // Remove the first element
      lines.shift();
      const endFrontMatterIndex = lines.findIndex((line) => line == "---");
      if (endFrontMatterIndex >= 0) {
        // We only try to read the front matter if we can find two '---' lines
        const frontMatterContent = lines
          .slice(0, endFrontMatterIndex)
          .join("\n");
        const parsedYaml = parse(frontMatterContent);
        return {
          ...parsedYaml,
          content: lines.slice(endFrontMatterIndex + 1).join("\n"),
        };
      } else {
        return {
          content: pageContent,
        };
      }
    } else {
      // When the page does not start with '---' it's content is returned as-is
      return {
        content: pageContent,
      };
    }
  }
}

export { DefaultPageReader };
