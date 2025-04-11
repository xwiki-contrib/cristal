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

/**
 * Ensure a statement is unreachable
 *
 * @param value - the error value printed when this method is reached
 *
 * @since 0.16
 */
function assertUnreachable(value: never): never {
  console.error({ unreachable: value });
  throw new Error("Reached a theoretically unreachable statement");
}

/**
 * Assert that a value is in an array, and fix its type
 *
 * @since 0.16
 *
 * @param array - the array to check
 * @param value - the value expected in the array
 * @param message - a message displayed in case the value is not found in the array
 *
 * @returns Whether the value is in the provided array, with the correct type
 */
function assertInArray<T, U extends T>(
  value: T,
  array: U[],
  message: string,
): U {
  if (!array.includes(value as U)) {
    throw new Error(message + ": " + value);
  }

  return value as U;
}

/**
 * Get a function's output or `null` if thrown an error
 *
 * @since 0.16
 *
 * @param func - The function to try
 *
 * @returns The function's output, or `null` if it thrown an error
 */
function tryFallible<T>(func: () => T): T | null {
  try {
    return func();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return null;
  }
}

/**
 * Get a function's output of the thrown error
 * Will construct a new Error object if the thrown value is not an instance of the Error class
 *
 * @since 0.17
 *
 * @param func - The function to try
 *
 * @returns The function's output, the thrown error if it's an instance of the `Error` class, or a constructed `Error` instance
 */
// eslint-disable-next-line max-statements
function tryFallibleOrError<T>(func: () => T): T | Error {
  try {
    return func();
  } catch (e: unknown) {
    if (e instanceof Error) {
      return e;
    }

    if (typeof e === "string") {
      return new Error(e);
    }

    if (typeof e === "number" || typeof e === "boolean") {
      return new Error(e.toString());
    }

    if (e === null) {
      return new Error("null");
    }

    if (e === undefined) {
      return new Error("undefined");
    }

    console.error({ throw: e });
    return new Error("<thrown unknown value type>");
  }
}

export { assertInArray, assertUnreachable, tryFallible, tryFallibleOrError };
