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
import { tryFallible } from "./utils";
import { EntityReference, EntityType } from "@xwiki/cristal-model-api";
import {
  ModelReferenceParserProvider,
  ModelReferenceSerializerProvider,
} from "@xwiki/cristal-model-reference-api";
import { RemoteURLSerializerProvider } from "@xwiki/cristal-model-remote-url-api";
import { Container } from "inversify";

/**
 * Set of tools used by converters
 *
 * @since 0.16
 */
export type ConverterContext = {
  /**
   * Try to parse a reference from a string
   * This function must **NOT** throw
   *
   * @since 0.16
   *
   * @param reference -
   * @param type -
   *
   * @returns - The entity reference or `null` if the input as invalid. Must be serializable with `serializeReferenceToUrl`
   */
  parseReference(
    reference: string,
    type: EntityType | null,
  ): EntityReference | null;

  /**
   * Serialize a reference to a string
   * This function must **NOT** throw
   *
   * @since 0.17
   *
   * @param reference -
   *
   * @returns - The serialized reference. Must be parsable with `parseReference`
   */
  serializeReference(reference: EntityReference): string;

  /**
   * Get the URL a reference is pointing to
   * This function must **NOT** throw
   *
   * @since 0.17
   *
   * @param reference -
   *
   * @returns - The URL for the reference
   */
  getUrlFromReference(reference: EntityReference): string;
};

/**
 * @since 0.16
 *
 * Automatically create a converter context from a container
 * This works by extracting the required providers from the container
 *
 * @param container - Cristal application's Inversify container
 *
 * @returns -
 */
export function createConverterContext(container: Container): ConverterContext {
  const modelReferenceParser = container
    .get<ModelReferenceParserProvider>("ModelReferenceParserProvider")
    .get()!;

  const modelReferenceSerializer = container
    .get<ModelReferenceSerializerProvider>("ModelReferenceSerializerProvider")
    .get()!;

  const remoteURLSerializer = container
    .get<RemoteURLSerializerProvider>("RemoteURLSerializerProvider")
    .get()!;

  return {
    parseReference: (reference, type) =>
      tryFallible(() =>
        modelReferenceParser.parse(reference, type ?? undefined),
      ),

    serializeReference: (reference) =>
      modelReferenceSerializer.serialize(reference)!,

    getUrlFromReference: (reference) =>
      remoteURLSerializer.serialize(reference)!,
  };
}
