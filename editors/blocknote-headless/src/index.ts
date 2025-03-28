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
import BlocknoteEditor from "./vue/c-blocknote-view.vue";
import BlocknoteEditorRealtimeUsers from "./vue/c-realtime-users.vue";
import type { EditorType } from "./blocknote";
import type { BlockNoteViewWrapperProps } from "./react/BlockNoteView";
import type { ReactNonSlotProps } from "@xwiki/cristal-reactivue/dist";

type BlocknoteEditorProps = ReactNonSlotProps<BlockNoteViewWrapperProps>;

export { BlocknoteEditor, BlocknoteEditorRealtimeUsers };
export type { BlocknoteEditorProps, EditorType };
