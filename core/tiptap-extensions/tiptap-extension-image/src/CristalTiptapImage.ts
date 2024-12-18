/*
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
import ImageView from "./vue/ImageView.vue";
import Image from "@tiptap/extension-image";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import type { Mark } from "@tiptap/pm/model";

function isExternalImage(mark: Mark) {
  return !(mark.attrs.src as string)?.startsWith("http://");
}

/**
 * We need to override the default image view to be able to easily add widgets (i.e., visual elements that are not
 * part of the persisted DOM) using Vue.
 */
const TiptapImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: undefined,
      height: undefined,
    };
  },
  addNodeView() {
    return VueNodeViewRenderer(ImageView);
  },
  // addStorage() {
  //   return {
  //     markdown: {
  //       serialize: {
  //         open(state: unknown, mark: Mark) {
  //           return isExternalImage(mark)
  //             ? "![["
  //             : // TODO: replace with a call to the default spec.
  //               "![";
  //         },
  //         close: function (state: unknown, mark: Mark) {
  //           if (isExternalImage(mark)) {
  //             return `|${mark.attrs.src}]]`;
  //           } else {
  //             // TODO: replace with a call to the default spec.
  //             return `](${mark.attrs.src.replace(/[()"]/g, "\\$&")}${
  //               mark.attrs.alt
  //                 ? ` "${mark.attrs.alt.replace(/"/g, '\\"')}"`
  //                 : ""
  //             })`;
  //           }
  //         },
  //         mixable: true,
  //       },
  //     },
  //   };
  // },
});

export { TiptapImage };
