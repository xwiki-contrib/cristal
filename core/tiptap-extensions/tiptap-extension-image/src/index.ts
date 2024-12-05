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

import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { defaultMarkdownSerializer } from "@tiptap/pm/markdown";
import type { MarkdownSerializerState } from "@tiptap/pm/markdown";
import type { Node } from "@tiptap/pm/model";

const TiptapImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    console.log("render hml", this.options.HTMLAttributes, HTMLAttributes);
    const merged = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    if (merged.src) {
      return ["img", merged];
    } else {
      // TODO: replace with a component to select or upload an image
      return ["div", { class: "divtest" }];
    }
  },
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: Node) => {
          if (node.attrs.src)
            defaultMarkdownSerializer.nodes.image(state, node, this.parent, 0);
          else console.log("xxxxskip");
        },
      },
    };
  },
});

export { TiptapImage };
