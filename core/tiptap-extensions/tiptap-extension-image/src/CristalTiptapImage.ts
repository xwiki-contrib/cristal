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
import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

/**
 * We need to override the default image view to be able to easily add widgets (i.e., visual elements that are not
 * part of the persisted DOM) using Vue.
 */
const TiptapImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    // console.log("render hml", this.options.HTMLAttributes, HTMLAttributes);
    const merged = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    if (merged.src) {
      return ["img", merged];
    } else {
      // TODO: replace with a component to select or upload an image
      return ["div", { class: "missingimage" }];
    }
  },
  addNodeView() {
    return VueNodeViewRenderer(ImageView);
  },
});

export { TiptapImage };
