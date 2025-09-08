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

import { DefaultVueTemplateProvider } from "@xwiki/cristal-skin";
import { injectable } from "inversify";
import type { Component } from "vue";

/**
 * Editor provider for Blocknote editor.
 *
 * @since 0.16
 * @beta
 */
@injectable()
export class UixBlocknoteEditorProvider extends DefaultVueTemplateProvider {
  public static override cname = "cristal.editor.blocknote";
  public static override hint = "";
  public static override priority = 1000;
  public static override singleton = true;
  public static extensionPoint = "editor";

  registered = false;

  override async getVueComponent(): Promise<Component> {
    const component = (await import("../vue/c-edit-blocknote.vue")).default;
    component.editorname = "blocknote";
    return component;
  }
  override getVueName(): string {
    return "BlocknoteEditor";
  }
  override isGlobal(): boolean {
    return false;
  }

  isSupported(): boolean {
    return true;
  }
}
