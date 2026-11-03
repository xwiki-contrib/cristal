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

import "reflect-metadata";
import { XWikiStorage } from "../xwikiStorage";
import { DefaultLogger } from "@xwiki/platform-api";
import { afterEach, describe, expect, it, vi } from "vitest";
import { anyObject, mock } from "vitest-mock-extended";
import type { AlertsServiceProvider } from "@xwiki/cristal-alerts-api";
import type {
  AuthenticationManager,
  AuthenticationManagerProvider,
} from "@xwiki/cristal-authentication-api";
import type { WikiConfig } from "@xwiki/platform-api";

describe("getPageFromViewURL", () => {
  const wikiConfig: WikiConfig = {
    baseURL: "http://baseurl",
  } as WikiConfig;

  class MockAuthenticationManagerProvider implements AuthenticationManagerProvider {
    get(): AuthenticationManager | undefined {
      return undefined;
    }
  }

  const xwikiStorage: XWikiStorage = new XWikiStorage(
    new DefaultLogger(),
    new MockAuthenticationManagerProvider(),
    mock<AlertsServiceProvider>(),
  );
  xwikiStorage.setWikiConfig(wikiConfig);
  it("regular identifier", () => {
    expect(
      xwikiStorage.getPageFromViewURL(
        "http://baseurl/bin/view/Space1/Space2/WebHome",
      ),
    ).toStrictEqual("Space1.Space2.WebHome");
  });
  it("identifier with special characters", () => {
    expect(
      xwikiStorage.getPageFromViewURL(
        "http://baseurl/bin/view/Space1%5C.Space%5C2.Space3/Web%2FHome",
      ),
    ).toStrictEqual("Space1\\\\\\.Space\\\\2\\.Space3.Web/Home");
  });
  it("missing terminal page", () => {
    expect(
      xwikiStorage.getPageFromViewURL("http://baseurl/bin/view/Space1/Space2/"),
    ).toStrictEqual("Space1.Space2.WebHome");
  });
  it("fetch page with dots", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            hierarchy: {
              items: [{ name: "" }],
            },
          }),
      } as Response),
    );
    await xwikiStorage.getPageContent(
      "Main.Page\\.With\\.Dots.WebHome",
      "html",
    );
    expect(global.fetch).toHaveBeenCalledExactlyOnceWith(
      new URL(
        "http://baseurl/rest/wikis/xwiki/spaces/Main/spaces/Page%2EWith%2EDots/pages/WebHome?checkRight=edit&supportedSyntax=markdown%2F1.2",
      ),
      anyObject(),
    );
  });
});

const legacyUrl =
  "http://baseurl/rest/cristal/wikis/xwiki/spaces/Sandbox/pages/TestPage1?format=jsonld";

function createStorage(): XWikiStorage {
  const storage = new XWikiStorage(
    new DefaultLogger(),
    { get: () => undefined } as AuthenticationManagerProvider,
    mock<AlertsServiceProvider>(),
  );
  storage.setWikiConfig({ baseURL: "http://baseurl" } as WikiConfig);
  return storage;
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  } as Response;
}

// A page as returned by XWiki < 18.1: no rights and no rendered content.
function oldPage() {
  return {
    syntax: "xwiki/2.1",
    content: "= Title =",
    hierarchy: { items: [{ name: "Sandbox" }, { name: "TestPage1" }] },
  };
}

function mockFetch(legacy: Response) {
  global.fetch = vi.fn((url: string | URL) =>
    Promise.resolve(
      url.toString().includes("/rest/cristal/")
        ? legacy
        : jsonResponse(oldPage()),
    ),
  );
}

describe("legacy XWiki REST fallback", () => {
  const xwikiStorage = createStorage();

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does nothing when the flag is not set", async () => {
    mockFetch(jsonResponse({ canEdit: true, html: "<h1>Title</h1>" }));
    const page = await xwikiStorage.getPageContent("Sandbox.TestPage1", "html");
    expect(global.fetch).toHaveBeenCalledOnce();
    expect(page?.canEdit).toBe(false);
    expect(page?.html).toBeUndefined();
  });

  it("reads the edit right and the html from the legacy endpoint", async () => {
    vi.stubEnv("VITE_CRISTAL_XWIKI_LEGACY_REST", "true");
    mockFetch(jsonResponse({ canEdit: true, html: "<h1>Title</h1>" }));
    const page = await xwikiStorage.getPageContent("Sandbox.TestPage1", "html");
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(legacyUrl, anyObject());
    expect(page?.canEdit).toBe(true);
    expect(page?.html).toBe("<h1>Title</h1>");
  });

  it("skips the legacy endpoint when the backend returns everything", async () => {
    vi.stubEnv("VITE_CRISTAL_XWIKI_LEGACY_REST", "true");
    global.fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({
          ...oldPage(),
          rights: [{ name: "edit", value: true }],
          renderedContent: "<h1>Title</h1>",
        }),
      ),
    );
    const page = await xwikiStorage.getPageContent("Sandbox.TestPage1", "html");
    expect(global.fetch).toHaveBeenCalledOnce();
    expect(page?.canEdit).toBe(true);
  });

  it("keeps the default values when the legacy endpoint fails", async () => {
    vi.stubEnv("VITE_CRISTAL_XWIKI_LEGACY_REST", "true");
    mockFetch(jsonResponse({}, false));
    const page = await xwikiStorage.getPageContent("Sandbox.TestPage1", "html");
    expect(page?.canEdit).toBe(false);
    expect(page?.html).toBeUndefined();
  });

  it("only fetches the html for revisions", async () => {
    vi.stubEnv("VITE_CRISTAL_XWIKI_LEGACY_REST", "true");
    mockFetch(jsonResponse({ canEdit: true, html: "<h1>Old</h1>" }));
    const page = await xwikiStorage.getPageContent(
      "Sandbox.TestPage1",
      "html",
      "1.1",
    );
    expect(global.fetch).toHaveBeenLastCalledWith(
      `${legacyUrl}&revision=1.1`,
      anyObject(),
    );
    expect(page?.canEdit).toBe(false);
    expect(page?.html).toBe("<h1>Old</h1>");
  });
});
