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

import { DefaultCristalApp } from "./DefaultCristalApp";
import { CristalLoader } from "@xwiki/cristal-extension-manager";
import { Container } from "inversify";
import { Primitive } from "utility-types";
import type { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

/**
 *
 * @param input - the input string
 * @since 0.8
 */
function loadConfig(input: string) {
  return async (): Promise<Record<string, Primitive>> => {
    const response = await fetch(input);
    return await response.json();
  };
}

async function handleCallback(container: Container): Promise<void> {
  if (window.location.pathname.startsWith("/callback")) {
    const type = window.localStorage.getItem("currentConfigType")!;
    const authenticationManager = container
      // Resolve the authentication manager for the current configuration type
      .get<AuthenticationManagerProvider>("AuthenticationManagerProvider");
    // We need to pass the type explicitly as we can't resolve it from the URL
    // at this point.
    await authenticationManager.get(type)?.callback();
  }
}

class CristalAppLoader extends CristalLoader {
  // @ts-expect-error cristal is temporarily undefined during class
  // initialization
  public cristal: DefaultCristalApp;

  public constructor(extensionList: Array<string>) {
    super(extensionList);
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  public async loadApp<T>(
    config: { [s: string]: T },
    isElectron: boolean,
    configName: string,
  ): Promise<void> {
    const defaultConfig = configName;
    const configMap = new Map<string, T>(Object.entries(config));
    this.cristal.setAvailableConfigurations(configMap);

    await handleCallback(this.cristal.getContainer());

    if (isElectron) {
      const localConfigName = window.localStorage.getItem("currentApp");
      if (
        localConfigName != null &&
        this.cristal.getAvailableConfigurations().has(localConfigName)
      ) {
        configName = localConfigName;
      } else {
        configName = "FileSystemSL";
      }
    } else {
      configName = this.getConfigFromPathName(window.location.pathname);
    }

    let wikiConfig = this.cristal.getAvailableConfigurations().get(configName);
    if (wikiConfig == null) {
      wikiConfig = this.cristal.getAvailableConfigurations().get(defaultConfig);
    }
    if (wikiConfig == null) {
      if (!isElectron) {
        window.location.href = "/XWiki/#";
      }
      this.logger?.error("Could not start cristal module");
      return;
    }

    this.cristal.setWikiConfig(wikiConfig);
    // setting design system
    if (wikiConfig.designSystem != "") {
      this.cristal.skinManager.setDesignSystem(wikiConfig.designSystem);
    }

    // Make sure we have initialized this config
    // This is necessary for offline mode
    wikiConfig.initialize();

    this.logger.debug("Wiki Config is:", wikiConfig);

    if (this.cristal != null) {
      this.cristal.run();
    } else {
      this.logger?.error("Could not start cristal module");
    }
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  public async launchApp(
    forceStaticMode: boolean,
    loadConfig: () => Promise<Record<string, Primitive>>,
    isElectron: boolean,
    configName: string,
    additionalComponents?: (container: Container) => void,
  ): Promise<void> {
    let staticMode = forceStaticMode;
    if (import.meta.env.MODE == "development" || staticMode) {
      staticMode = true;
      const StaticBuild = await import("../staticBuild");
      StaticBuild.StaticBuild.init(
        this.container,
        staticMode,
        additionalComponents,
      );
    }

    await this.loadExtensions(true, staticMode);
    this.container
      .bind<CristalApp>("CristalApp")
      .to(DefaultCristalApp)
      .inSingletonScope();
    this.cristal = this.container.get<CristalApp>(
      "CristalApp",
    ) as DefaultCristalApp;
    this.cristal.isElectron = isElectron;
    this.cristal.setContainer(this.container);

    const config = await loadConfig();
    await this.loadApp(config, isElectron, configName);
  }

  public static init(
    extensionList: Array<string>,
    loadConfig: () => Promise<Record<string, Primitive>>,
    staticBuild: boolean,
    isElectron: boolean,
    configName: string,
    additionalComponents: (container: Container) => void,
  ): void {
    const cristalLoader = new CristalAppLoader(extensionList);
    cristalLoader.initializeContainer();
    cristalLoader.launchApp(
      staticBuild,
      loadConfig,
      isElectron,
      configName,
      additionalComponents,
    );
  }
}

export { CristalAppLoader, loadConfig };
