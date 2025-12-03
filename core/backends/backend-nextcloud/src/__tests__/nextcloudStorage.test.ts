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

import { NextcloudStorage } from "../nextcloudStorage";
import { DefaultLogger } from "@xwiki/platform-api";
import { describe, expect, it, vi } from "vitest";
import { anyObject, mock } from "vitest-mock-extended";
import type {
  AuthenticationManager,
  AuthenticationManagerProvider,
  UserDetails,
} from "@xwiki/cristal-authentication-api";
import type { WikiConfig } from "@xwiki/platform-api";

describe("nextcloudStorage", () => {
  const wikiConfig: WikiConfig = {
    baseRestURL: "http://baseurl/remote.php/dav",
    storageRoot: "/files/${username}/.cristal",
  } as WikiConfig;

  class MockAuthenticationManager implements AuthenticationManager {
    getUserDetails(): UserDetails {
      return { name: "Test User", username: "testuser" };
    }
    getAuthorizationHeader(): Promise<string> {
      return Promise.resolve("TEST-AUTHORIZATION");
    }
  }

  class MockAuthenticationManagerProvider implements AuthenticationManagerProvider {
    get(): AuthenticationManager | undefined {
      return new MockAuthenticationManager();
    }
  }

  const nextcloudStorage: NextcloudStorage = new NextcloudStorage(
    new DefaultLogger(),
    new MockAuthenticationManagerProvider(),
    mock<AlertsServiceProvider>(),
  );
  nextcloudStorage.setWikiConfig(wikiConfig);

  it("delete page with metadata", async () => {
    const page = "test/page/withmetadata";
    const pageUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/withmetadata.md";
    const pageMetaUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/.withmetadata";
    globalThis.fetch = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method == "DELETE" && url.toString() == pageUrl) {
        return Promise.resolve({
          ok: true,
        } as Response);
      } else if (init?.method == "DELETE" && url.toString() == pageMetaUrl) {
        return Promise.resolve({
          ok: true,
        } as Response);
      } else {
        throw Error(`Unexpected URL fetched during delete test: ${url}`);
      }
    });

    const deleteResult = await nextcloudStorage.delete(page);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(pageUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(pageMetaUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(deleteResult).toStrictEqual({ success: true });
  });

  it("delete page without metadata", async () => {
    const page = "test/page/withoutmetadata";
    const pageUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/withoutmetadata.md";
    const pageMetaUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/.withoutmetadata";
    globalThis.fetch = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method == "DELETE" && url.toString() == pageUrl) {
        return Promise.resolve({
          ok: true,
        } as Response);
      } else if (init?.method == "DELETE" && url.toString() == pageMetaUrl) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve("Not Found"),
        } as Response);
      } else {
        throw Error(`Unexpected URL fetched during delete test: ${url}`);
      }
    });

    const deleteResult = await nextcloudStorage.delete(page);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(pageUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(pageMetaUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(deleteResult).toStrictEqual({ success: true });
  });

  it("delete non-existing page", async () => {
    const page = "test/page/notfound";
    const pageUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/notfound.md";
    const pageMetaUrl =
      "http://baseurl/remote.php/dav/files/testuser/.cristal/test/page/.notfound";
    globalThis.fetch = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method == "DELETE" && url.toString() == pageUrl) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve("Not Found"),
        } as Response);
      } else if (init?.method == "DELETE" && url.toString() == pageMetaUrl) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve("Not Found"),
        } as Response);
      } else {
        throw Error(`Unexpected URL fetched during delete test: ${url}`);
      }
    });

    const deleteResult = await nextcloudStorage.delete(page);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(pageUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(pageMetaUrl, {
      method: "DELETE",
      headers: anyObject(),
    });
    expect(deleteResult).toStrictEqual({ success: false, error: "Not Found" });
  });
});
