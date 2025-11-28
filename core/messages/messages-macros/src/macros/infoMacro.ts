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

import { produceHtmlEl } from "@xwiki/platform-fn-utils";
import { injectable } from "inversify";
import type { BlockMacro, MacroInfos } from "@xwiki/platform-macros-api";

const macroParams = {} as const;

type MacroParams = typeof macroParams;

/**
 * Implementation of the information macro
 *
 * @since 0.24-rc-1
 * @beta
 */
@injectable()
export class InfoMacro implements BlockMacro<MacroParams> {
  readonly infos: MacroInfos<MacroParams> = {
    id: "info",
    name: "Box for an information message",
    description: "Block showing an information message",
    params: macroParams,
    paramsDescription: {},
    defaultParameters: {},
    bodyType: "wysiwyg",
  };

  renderAs = "block" as const;

  render: BlockMacro<MacroParams>["render"] = () => {
    return [
      {
        type: "rawHtml",
        // Here we produce a custom <style> element to style the editable area down below
        // This is obviously a very dirty method and should be replaced ASAP with a proper CSS implementation in macros
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-744
        //
        // Colors should also not be hardcoded
        // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-745
        html: produceHtmlEl(
          "style",
          {},
          `.${CSS_CLASS_NAME} {
              width: fit-content;
              border-radius: 10px;
              padding: var(--cr-spacing-x-large) !important;
              color: #31708f !important;
              background-color: #e1f1f9 !important;
            }`,
        ),
      },
      {
        type: "macroBlockEditableArea",
        styles: {
          cssClasses: [CSS_CLASS_NAME],
        },
      },
    ];
  };
}

const CSS_CLASS_NAME = "cristal-macro-info-box";
