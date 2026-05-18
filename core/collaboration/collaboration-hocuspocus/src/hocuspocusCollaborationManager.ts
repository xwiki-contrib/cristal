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
import { HocuspocusProvider, WebSocketStatus } from "@hocuspocus/provider";
import {
  AbstractCollaborationManager,
  ConnectionStatus,
} from "@xwiki/platform-collaboration-api";
import { name as documentServiceName } from "@xwiki/platform-document-api";
import { inject, injectable } from "inversify";
import { ref } from "vue";
import type {
  onAwarenessChangeParameters,
  onStatusParameters,
} from "@hocuspocus/provider";
import type { CristalApp } from "@xwiki/platform-api";
import type { AuthenticationManagerProvider } from "@xwiki/platform-authentication-api";
import type {
  Collaboration,
  Collaborator,
} from "@xwiki/platform-collaboration-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type { DocumentReference } from "@xwiki/platform-model-api";
import type { ModelReferenceSerializerProvider } from "@xwiki/platform-model-reference-api";

/**
 * Collaboration provider for Hocus Pocus.
 * This is the default provider.
 * @since 0.20
 * @beta
 */
@injectable()
export class HocuspocusCollaborationManager extends AbstractCollaborationManager {
  constructor(
    @inject("AuthenticationManagerProvider")
    authenticationManagerProvider: AuthenticationManagerProvider,

    @inject(documentServiceName)
    documentService: DocumentService,

    @inject("ModelReferenceSerializerProvider")
    modelReferenceSerializerProvider: ModelReferenceSerializerProvider,

    @inject("CristalApp") private readonly cristalApp: CristalApp,
  ) {
    super(
      authenticationManagerProvider,
      documentService,
      modelReferenceSerializerProvider.get()!,
    );
  }

  protected override async createProvider(
    documentReference: DocumentReference,
  ): Promise<HocuspocusProvider> {
    const name = `${this.modelReferenceSerializer.serialize(documentReference)}:${
      this.cristalApp.getWikiConfig().editor ?? "blocknote"
    }`;
    console.debug(`Connecting the the collaboration session [${name}].`);
    return new HocuspocusProvider({
      url: this.cristalApp.getWikiConfig().realtimeURL!,
      // we distinguish from sessions from other editors by suffixing the session with the editor id
      name,
    });
  }

  protected override async createCollaboration(
    provider: HocuspocusProvider,
    collaborator: Collaborator,
  ): Promise<Collaboration> {
    collaborator.id = `${provider.document.clientID}`;
    const collaboration: Collaboration = {
      connectionStatus: ref(ConnectionStatus.Connecting),
      collaborators: ref([]),
      collaborator,
      provider,
      doc: provider.document,
    };
    this.watchAwarenessChange(collaboration);
    this.watchConnectionStatus(collaboration);
    await this.sync(collaboration);
    return collaboration;
  }

  private watchAwarenessChange(collaboration: Collaboration): void {
    const provider: HocuspocusProvider = collaboration.provider;
    provider.on("awarenessChange", (event: onAwarenessChangeParameters) => {
      const collaborators: Collaborator[] = [];
      event.states.forEach(
        ({ collaborator: { user, color } = {} }, clientId) => {
          if (user && color) {
            collaborators.push({
              id: `${clientId}`,
              user,
              color,
            });
          }
        },
      );
      collaboration.collaborators.value = collaborators;
    });
  }

  private watchConnectionStatus(collaboration: Collaboration): void {
    const provider: HocuspocusProvider = collaboration.provider;
    provider.on("status", (event: onStatusParameters) => {
      console.debug("Collaboration connection status:", event.status);
      switch (event.status) {
        case WebSocketStatus.Connecting:
          collaboration.connectionStatus.value = ConnectionStatus.Connecting;
          break;
        case WebSocketStatus.Connected:
          collaboration.connectionStatus.value = ConnectionStatus.Connected;
          break;
        case WebSocketStatus.Disconnected:
          collaboration.connectionStatus.value = ConnectionStatus.Disconnected;
          break;
      }
    });
  }

  private sync(collaboration: Collaboration): Promise<void> {
    return new Promise((resolve) => {
      const provider: HocuspocusProvider = collaboration.provider;
      provider.on("synced", () => {
        console.debug("Collaboration synchronized.");
        resolve();
      });
    });
  }

  protected override disconnect(collaboration: Collaboration): void {
    const provider: HocuspocusProvider = collaboration.provider;
    provider.destroy();
  }
}
