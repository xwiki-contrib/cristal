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

import { createMacro } from "../utils";
import type { CSSProperties } from "react";

function createAlertMacro(
  name: string,
  description: string,
  style: Pick<CSSProperties, "color" | "backgroundColor">,
) {
  return createMacro({
    name,
    parameters: { content: { type: "string" } },
    renderType: "block",
    render(parameters) {
      return (
        <div
          style={{
            ...style,
            width: "100%",
            padding: "1rem",
            borderRadius: "5px",
          }}
        >
          {parameters.content}
        </div>
      );
    },
    slashMenu: {
      defaultParameters: {
        content: "",
      },
      description,
    },
  });
}

const InfoMacro = createAlertMacro("Info", "Information message", {
  backgroundColor: "#e1f1f9",
  color: "#31708f",
});

const WarnMacro = createAlertMacro("Warn", "Warning message", {
  backgroundColor: "#fcf8e3",
  color: "#8a6d3b",
});

const ErrorMacro = createAlertMacro("Error", "Error message", {
  backgroundColor: "#f8ecec",
  color: "#a94442",
});

export { ErrorMacro, InfoMacro, WarnMacro };
