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

import "reflect-metadata";
import { XWikiModelReferenceParser } from "../xWikiModelReferenceParser";
import {
  AttachmentReference,
  DocumentReference,
  EntityType,
  SpaceReference,
} from "@xwiki/cristal-model-api";
import { describe, expect, test } from "vitest";

describe("xWikiModelReferenceParser", () => {
  const parser = new XWikiModelReferenceParser();
  const currentSpace = new SpaceReference(undefined, "TestSpace");
  test.each([
    // TODO, the space reference must be filled relatively to the current document
    ["WebHome", undefined, new DocumentReference("WebHome", currentSpace)],
    // TODO the document reference must be filled relatively to the current document
    [
      "attach:TestSpace.png",
      undefined,
      new AttachmentReference(
        "TestSpace.png",
        new DocumentReference("WebHome", currentSpace),
      ),
    ],
    // TODO the document reference must be filled relatively to the current document
    [
      "TestSpace.png",
      EntityType.ATTACHMENT,
      new AttachmentReference(
        "TestSpace.png",
        new DocumentReference(
          "WebHome",
          new SpaceReference(undefined, "TestSpace"),
        ),
      ),
    ],
    [
      "TestSpace.TestSubSpace.WebHome@TestSubSpace.png",
      EntityType.ATTACHMENT,
      new AttachmentReference(
        "TestSubSpace.png",
        new DocumentReference(
          "WebHome",
          new SpaceReference(undefined, "TestSpace", "TestSubSpace"),
        ),
      ),
    ],
    [
      "attach:TestSpace.TestSubSpace.WebHome@TestSubSpace.png",
      undefined,
      new AttachmentReference(
        "TestSubSpace.png",
        new DocumentReference(
          "WebHome",
          new SpaceReference(undefined, "TestSpace", "TestSubSpace"),
        ),
      ),
    ],
    [
      "TestSpace.TestSubSpace.WebHome",
      undefined,
      new DocumentReference(
        "WebHome",
        new SpaceReference(undefined, "TestSpace", "TestSubSpace"),
      ),
    ],
  ])("%s -> %s", (reference, type, expected) => {
    expect(parser.parse(reference, type)).toEqual(expected);
  });
});