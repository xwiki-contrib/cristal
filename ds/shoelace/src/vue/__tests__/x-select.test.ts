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
import XSelect from "../form/x-select.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

// Items with a value distinct from their label are typed by SelectItem, which recent @xwiki/platform-dsapi versions
// declare; the cast lets this test compile against the versions where the items are only strings.
const items = [
  { value: "v1", label: "Same label" },
  { value: "v2", label: "Same label" },
  "i3",
] as unknown as string[];

describe("x-select", () => {
  it("renders the value and the label of each item", () => {
    const xSelect = mount(XSelect, { props: { label: "My Label", items } });

    // Vue sets the value of the custom element as a DOM property, which is what Shoelace reads.
    const options = xSelect
      .findAll("sl-option")
      .map((option) => [
        (option.element as HTMLElement & { value: string }).value,
        option.text(),
      ]);
    expect(options).toEqual([
      ["v1", "Same label"],
      ["v2", "Same label"],
      ["i3", "i3"],
    ]);
  });
});
