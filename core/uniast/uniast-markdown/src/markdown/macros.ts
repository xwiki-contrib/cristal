/**
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

import { assertUnreachable } from "@xwiki/cristal-fn-utils";
import type { MarkdownToUniAstConverter } from "./markdown-to-uni-ast-converter";
import type { MacrosService } from "@xwiki/cristal-macros-service";
import type { MacroInvocation } from "@xwiki/cristal-uniast-api";

type MacroHandler = (
  content: string,
  markdownParser: MarkdownToUniAstConverter,
  macrosService: MacrosService,
) => Promise<
  | { do: "parseAs"; call: MacroInvocation; chars: number }
  | { do: "ignore" }
  | { do: "break" }
>;

// eslint-disable-next-line max-statements
async function transformMacros(
  markdown: string,
  markdownParser: MarkdownToUniAstConverter,
  macrosService: MacrosService,
  macroHandler: MacroHandler = eatMacro,
): Promise<{
  content: string;
  brokeAt: number | null;
}> {
  let escaping = false;
  let inCodeBlock = false;
  let inInlineCode = false;
  let lastPush = -1;
  let out = "";

  let i = 0;

  for (i = 0; i < markdown.length; i++) {
    if (escaping) {
      escaping = false;
      continue;
    }

    const char = markdown[i];

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (inInlineCode) {
      if (char === "`") {
        inInlineCode = false;
      }

      continue;
    }

    if (inCodeBlock) {
      if (markdown.slice(i).startsWith("```")) {
        inCodeBlock = false;
        i += 2;
      }

      continue;
    }

    if (char === "`") {
      if (markdown.slice(i).startsWith("```")) {
        inCodeBlock = true;
        i += 2;
      } else {
        inInlineCode = true;
      }

      continue;
    }

    if (char === "{" && markdown[i + 1] === "{") {
      const handling = await macroHandler(
        markdown.slice(i + 2),
        markdownParser,
        macrosService,
      );

      switch (handling.do) {
        case "parseAs":
          out +=
            markdown.slice(lastPush + 1, i) +
            `\`${CODIFIED_MACRO_PREFIX}${btoa(JSON.stringify(handling.call))}\``;

          // NOTE: we only add 1 instead of 2 even though there are two closing braces (`}}`) as `i` will be incremented when loop starts over
          i += handling.chars + 1;
          lastPush = i;

          break;

        case "ignore":
          continue;

        case "break":
          return {
            content: out + markdown.slice(lastPush + 1, i),
            brokeAt: i,
          };

        default:
          assertUnreachable(handling);
      }
    }
  }

  return { content: out + markdown.slice(lastPush + 1), brokeAt: null };
}

// eslint-disable-next-line max-statements
const eatMacro: MacroHandler = async (
  content,
  mdParser,
  macrosService,
): ReturnType<MacroHandler> => {
  // Find the macro's name
  const macroIdMatch = content.match(
    // This weird group matches valid accentuated Unicode letters
    /^\s*([A-Za-zÀ-ÖØ-öø-ÿ\d]+)(\s+(?=[A-Za-zÀ-ÖØ-öø-ÿ\d/])|\s*(?=\/|}}))/,
  );

  // If the macro's name is invalid, the whole macro invocation is invalid
  if (!macroIdMatch) {
    return { do: "ignore" };
  }

  const macroId = macroIdMatch[1];

  let i;

  // Is the next character being escaped?
  let escaping = false;

  // Parameters are built character by character
  // First the name is parsed from the source, then the value
  let buildingParameter: { name: string; value: string | null } | null = null;

  // The list of parsed parameters
  const parameters: Record<string, string> = {};

  // Is the macro being closed?
  let closingMacro = false;

  for (i = macroIdMatch[0].length; i < content.length; i++) {
    // Escaping is possible only inside parameter values
    if (escaping) {
      if (!buildingParameter || buildingParameter.value === null) {
        throw new Error("Unexpected");
      }

      escaping = false;
      buildingParameter.value += content[i];

      continue;
    }

    // If we're not building a parameter, we are expecting one thing between...
    if (!buildingParameter) {
      // ...a space (no particular meaning)
      if (content[i] === " ") {
        continue;
      }

      // ...a valid identifier character which will begin the parameter's name
      if (content[i].match(/[A-Za-zÀ-ÖØ-öø-ÿ_\d]/)) {
        buildingParameter = { name: content[i], value: null };
        continue;
      }

      // ...or a closing slash which indicates the macro has no more parameter
      if (content[i] === "/") {
        i++;
        closingMacro = true;
        break;
      }

      // Invalid character, stop building macro here
      break;
    }

    // If we're building a parameter's name, we are expecting one thing between...
    if (buildingParameter.value === null) {
      // ...a valid identifier character which will continue the parameter's name
      if (content[i].match(/[A-Za-zÀ-ÖØ-öø-ÿ_\d]/)) {
        buildingParameter.name += content[i];
        continue;
      }

      // ...or an '=' operator sign which indicates we are going to assign a value to the parameter
      if (content[i] === "=") {
        // Usually parameters start with a double quote to indicate they have a string-like value
        if (content[i + 1] === '"') {
          i += 1;
          buildingParameter.value = "";
          continue;
        }

        // But unquoted integers are also accepted
        const number = content
          .substring(i + 1)
          .match(/\d+(?=[^A-Za-zÀ-ÖØ-öø-ÿ\d])/);

        if (!number) {
          // Invalid character, stop building macro here
          break;
        }

        parameters[buildingParameter.name] = number[0];
        buildingParameter = null;

        i += number[0].length;
        continue;
      }

      // Invalid character, stop building macro here
      break;
    }

    // If we reach this point, we are building the parameter's value.
    // Which means we are expecting either:
    // ...an escaping character
    if (content[i] === "\\") {
      escaping = true;
    }
    // ...a closing double quote to indicate the parameter's value's end
    else if (content[i] === '"') {
      parameters[buildingParameter.name] = buildingParameter.value;
      buildingParameter = null;
    }
    // ...or any other character that will continue the parameter's value
    else {
      buildingParameter.value += content[i];
    }
  }

  // When the macro closes, we expect double braces afterwards
  const closingBraces = content.substring(i).match(/\s*}}/);

  // If the macro doesn't have closing braces, it's invalid
  if (!closingBraces) {
    return { do: "ignore" };
  }

  let offset = i + closingBraces[0].length;
  let rawBody: string | null = null;

  // If the macro has not been closed with a `/`, it must have a content
  if (!closingMacro) {
    const closingRegex = new RegExp(`^\\s*/${macroId}\\s*}}`);

    const { brokeAt } = await transformMacros(
      content.slice(offset),
      mdParser,
      macrosService,
      async (content, mdParser, macrosService) =>
        closingRegex.exec(content)
          ? { do: "break" }
          : await eatMacro(content, mdParser, macrosService),
    );

    // If everything was parsed without stopping, the macro is not closed properly
    if (brokeAt === null) {
      throw new Error("Unclosed macro");
    }

    const closingMatch = content
      .slice(offset + brokeAt + 2)
      .match(closingRegex);

    if (!closingMatch) {
      throw new Error("Unexpected");
    }

    rawBody = content.slice(offset, offset + brokeAt);
    offset += brokeAt + closingMatch[0].length + 2;
  }

  const macro = macrosService.get(macroId);

  // Ensure the macro is known
  // We have to wait for this point since only there do we know the syntax is valid
  if (!macro) {
    // TODO: properly report an error
    // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-725
    return {
      do: "parseAs",
      call: {
        id: macroId,
        params: parameters,
        body: rawBody ? { type: "raw", content: rawBody } : { type: "none" },
      },
      chars: offset,
    };
  }

  let body: MacroInvocation["body"];

  switch (macro.infos.bodyType) {
    case "none":
      if (rawBody && rawBody.trim() !== "") {
        // TODO: properly report the error
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-739
        throw new Error("Wrongly provided a body for contentless macro");
      }

      body = { type: "none" };
      break;

    case "raw":
      if (!rawBody) {
        // TODO: properly report the error
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-739
        throw new Error("Missing body for contentful macro");
      }

      body = { type: "raw", content: rawBody };
      break;

    case "wysiwyg": {
      if (!rawBody) {
        // TODO: properly report the error
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-739
        throw new Error("Missing body for contentful macro");
      }

      const uniAst = await mdParser.parseMarkdown(rawBody);

      if (uniAst instanceof Error) {
        // TODO: properly report the error (?)
        throw uniAst;
      }

      if (uniAst.blocks.length !== 1 || uniAst.blocks[0].type !== "paragraph") {
        // TODO: properly report the error
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-739
        throw new Error(
          "Expected a single paragraph block as the macro's content",
        );
      }

      const inlineContents = uniAst.blocks[0].content;

      if (macro.renderAs === "inline") {
        if (inlineContents.length !== 1) {
          // TODO: properly report the error
          // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-739
          throw new Error(
            "Expected precisely one inline content for inline macro",
          );
        }

        body = { type: "inlineContent", inlineContent: inlineContents[0] };
      } else {
        body = { type: "inlineContents", inlineContents };
      }

      break;
    }
  }

  // We can now properly build the macro
  // NOTE: If a paragraph only contains an inline macro, it will be converted to a macro block instead
  //       by the calling function

  return {
    do: "parseAs",
    call: {
      id: macroId,
      params: parameters,
      body,
    },
    chars: offset,
  };
};

function reparseCodifiedMacro(code: string): MacroInvocation {
  if (!code.startsWith(CODIFIED_MACRO_PREFIX)) {
    console.error({ code });
    throw new Error(
      "Internal error: provided code does not start with macro invocation prefix",
    );
  }

  return JSON.parse(
    atob(code.substring(CODIFIED_MACRO_PREFIX.length)),
  ) as MacroInvocation;
}

const CODIFIED_MACRO_PREFIX = "###cristalMacro:###";

export { CODIFIED_MACRO_PREFIX, reparseCodifiedMacro, transformMacros };
export type { MacroHandler };
