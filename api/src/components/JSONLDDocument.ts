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

import type { Document } from "../api/document";

export type JsonLd = Record<string, unknown> & {
  identifier: string;
  name: string;
  text: string;
};

export class JSONLDDocument implements Document {
  protected jsonld: JsonLd;

  constructor(jsonld: JsonLd) {
    this.jsonld = jsonld;
  }

  getIdentifier(): string {
    return this.jsonld.identifier;
  }

  setIdentifier(identifier: string): void {
    this.jsonld.identifier = identifier;
  }

  getName(): string {
    return this.jsonld.name;
  }

  setName(name: string): void {
    this.jsonld.name = name;
  }

  getText(): string {
    return this.jsonld.text;
  }

  setText(text: string): void {
    this.jsonld.text = text;
  }

  get(fieldName: string): unknown {
    return this.jsonld[fieldName];
  }

  set(fieldName: string, value: unknown): void {
    this.jsonld[fieldName] = value;
  }

  getSource(): unknown {
    return this.jsonld;
  }
}
