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

import { Link, LinkType, name } from "@xwiki/cristal-link-suggest-api";
import { Container, inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { LinkSuggestService } from "@xwiki/cristal-link-suggest-api";
import type { ModelReferenceParserProvider } from "@xwiki/cristal-model-reference-api";
import type { RemoteURLSerializerProvider } from "@xwiki/cristal-model-remote-url-api";

/**
 * Default implementation of the link suggestion service, for XWiki.
 * Currently limited to guests, and to XWiki instances that have explicitly
 * allowed CORS, see https://cristal.xwiki.org/xwiki/bin/view/Backends/XWiki/
 * @since 0.8
 */
@injectable()
class XWikiLinkSuggestService implements LinkSuggestService {
  constructor(
    @inject<CristalApp>("CristalApp") private readonly cristalApp: CristalApp,
    @inject<RemoteURLSerializerProvider>("RemoteURLSerializerProvider")
    private readonly remoteURLSerializerProvider: RemoteURLSerializerProvider,
    @inject<ModelReferenceParserProvider>("ModelReferenceParserProvider")
    private readonly modelReferenceParserProvider: ModelReferenceParserProvider,
  ) {}

  async getLinks(
    query: string,
    type?: LinkType,
    mimetype?: string,
  ): Promise<Link[]> {
    // TODO: currently only proposing links available to guest
    const json = await this.executeQuery(type, mimetype, query);

    return json
      .filter(({ filename }: { filename?: string[] }) => {
        return filename;
      })
      .map(this.mapToLink)
      .filter(this.filterLinks(type, mimetype));
  }

  private async executeQuery(
    type: LinkType | undefined | LinkType.PAGE | LinkType.ATTACHMENT,
    mimetype: string | undefined,
    query: string,
  ) {
    const baseURL = this.cristalApp.getWikiConfig().baseURL;
    const fqs = this.initializeSolrQueryParameters(type, mimetype);
    const params: Record<string, string> = {
      query: fqs.map((it) => `fq=${it}`).join("\n"),
      nb: "20",
      media: "json",
      input: `*${query}*`,
    };

    const getParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${baseURL}/bin/get/XWiki/SuggestSolrService?${getParams}`,
    );

    return await response.json();
  }

  private initializeSolrQueryParameters(
    type: LinkType | LinkType.PAGE | LinkType.ATTACHMENT | undefined,
    mimetype: string | undefined,
  ) {
    const fqs = ["locale:*", "wiki:xwiki"];

    if (type) {
      if (type == LinkType.ATTACHMENT) {
        fqs.push("type:ATTACHMENT");
      } else {
        fqs.push("type:PAGE");
      }
    }

    if (mimetype) {
      fqs.push(`mimetype:((${mimetype}))`);
    }
    return fqs;
  }

  private filterLinks(
    type: LinkType | undefined | LinkType.PAGE | LinkType.ATTACHMENT,
    mimetype: string | undefined,
  ) {
    return (link: Link) => {
      if (type == undefined) {
        return true;
      } else {
        const expectedType = link.type == type;
        if (!expectedType) {
          return false;
        }
        if (mimetype) {
          // TODO...
          return expectedType;
        } else {
          return true;
        }
      }
    };
  }

  private mapToLink({
    id,
    filename,
    type,
  }: {
    id: string;
    filename: string[];
    type: string;
  }) {
    const xwikiURL =
      this.remoteURLSerializerProvider
        .get()
        ?.serialize(this.modelReferenceParserProvider.get()?.parse(id)) ?? "";

    return {
      type: type == "ATTACHMENT" ? LinkType.ATTACHMENT : LinkType.PAGE,
      id,
      url: xwikiURL,
      reference: id,
      label: filename[0],
      hint: filename[0],
    };
  }
}

export class ComponentInit {
  constructor(container: Container) {
    container
      .bind<LinkSuggestService>(name)
      .to(XWikiLinkSuggestService)
      .inSingletonScope()
      .whenTargetNamed("XWiki");
  }
}
