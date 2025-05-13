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

import { inject, injectable } from "inversify";
import type {
  Settings,
  SettingsManager,
  SettingsParserProvider,
  SettingsSerializerProvider,
} from "@xwiki/cristal-settings-api";

/**
 * Default implementation for {@link SettingsManager}.
 * It will try to find the best {@link SettingsParser} and
 * {@link SettingsSerializer} instances for the settings it handles.
 * @since 0.18
 */
@injectable()
export class DefaultSettingsManager implements SettingsManager {
  private settings: Map<string, Settings>;

  constructor(
    @inject("SettingsParserProvider")
    private parserProvider: SettingsParserProvider,
    @inject("SettingsSerializerProvider")
    private serializerProvider: SettingsSerializerProvider,
  ) {
    this.settings = new Map();
  }

  set(settings: Settings): void {
    this.settings.set(settings.key, settings);
  }

  get<T extends Settings>(t: new () => T): T | undefined {
    const key = new t().key;
    if (this.settings.has(key)) {
      return this.settings.get(key) as T;
    } else {
      return undefined;
    }
  }

  toJSON(): string {
    const settingsJson = [];
    for (const [key, value] of this.settings) {
      settingsJson.push(
        this.serializerProvider?.get(key).serialize(value) ?? "",
      );
    }
    return `[${settingsJson.join(",")}]`;
  }

  fromJSON(json: string): void {
    const settings = JSON.parse(json) as [
      {
        key: string;
        content: unknown;
      },
    ];
    for (const setting of settings) {
      this.settings.set(
        setting.key,
        this.parserProvider?.get(setting.key).parse(JSON.stringify(setting)) ??
          {},
      );
    }
  }
}
