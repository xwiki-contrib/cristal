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

import { addVuetifyOptions } from "./utils/vuetify";
import XSelect from "../form/x-select.vue";
import { VueWrapper, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";

/**
 * Mount a XSelect component with the default configuration.
 * @param modelValue - the value of the selected item
 */
function mountXSelect(modelValue: string): VueWrapper {
  const options = addVuetifyOptions({
    props: {
      label: "My Label",
      items: [
        { value: "v1", label: "First" },
        { value: "v2", label: "Second" },
        "i3",
      ],
      modelValue,
    },
  });
  // XSelect translates its validation message.
  options.global.plugins.push(createI18n({ legacy: false, locale: "en" }));
  return mount(XSelect, options);
}

describe("x-select", () => {
  it("displays the label of the selected item", () => {
    expect(mountXSelect("v2").find(".v-select__selection").text()).eq("Second");
  });

  it("displays a string item as its own label", () => {
    expect(mountXSelect("i3").find(".v-select__selection").text()).eq("i3");
  });
});
