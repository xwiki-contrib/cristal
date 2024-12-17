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

import VueDsfr from "@gouvminint/vue-dsfr";
import { registerAsyncComponent } from "@xwiki/cristal-api";

import { injectable } from "inversify";

import type { DesignSystemLoader } from "@xwiki/cristal-api";
import type { App } from "vue";

@injectable()
export class DSFRDesignSystemLoader implements DesignSystemLoader {
  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  loadDesignSystem(app: App): void {
    // Loading specific components from DSFR
    app.use(VueDsfr);
    registerAsyncComponent(app, "XLoad", () => import("../vue/x-load.vue"));
    registerAsyncComponent(app, "XBtn", () => import("../vue/x-btn.vue"));
    registerAsyncComponent(app, "XCard", () => import("../vue/x-card.vue"));
    registerAsyncComponent(app, "XAlert", () => import("../vue/x-alert.vue"));
    registerAsyncComponent(
      app,
      "XDivider",
      () => import("../vue/x-divider.vue"),
    );
    registerAsyncComponent(app, "XDialog", () => import("../vue/x-dialog.vue"));
    registerAsyncComponent(app, "XAvatar", () => import("../vue/x-avatar.vue"));
    registerAsyncComponent(
      app,
      "XContainer",
      () => import("../vue/x-container.vue"),
    );
    registerAsyncComponent(app, "XImg", () => import("../vue/x-img.vue"));
    registerAsyncComponent(app, "XRow", () => import("../vue/x-row.vue"));
    registerAsyncComponent(app, "XCol", () => import("../vue/x-col.vue"));
    registerAsyncComponent(
      app,
      "XTextField",
      () => import("../vue/x-textfield.vue"),
    );
    registerAsyncComponent(app, "XMenu", () => import("../vue/x-menu.vue"));
    registerAsyncComponent(
      app,
      "XMenuItem",
      () => import("../vue/x-menuitem.vue"),
    );
  }
}
