import {
  type AuthenticationManager,
  UserDetails,
} from "@xwiki/cristal-authentication-api";
import { injectable } from "inversify";

// TODO: find out how to move the type declaration to a separate location.
// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module window {
  interface authenticationXWiki {
    login: () => void;

    isLoggedIn(): Promise<boolean>;

    getUserDetails(): UserDetails;

    getAuthorizationValue(): { tokenType: string; accessToken: string };
  }

  export const authenticationXWiki: authenticationXWiki;
}

@injectable()
export class XWikiAuthenticationManager implements AuthenticationManager {
  start(): void {
    window.authenticationXWiki.login();
  }

  callback(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getAuthorizationHeader(): Promise<string | undefined> {
    const authenticated = await this.isAuthenticated();
    if (authenticated) {
      const { tokenType, accessToken } =
        window.authenticationXWiki.getAuthorizationValue();
      return `${tokenType} ${accessToken}`;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return window.authenticationXWiki.isLoggedIn();
  }

  async getUserDetails(): Promise<UserDetails> {
    return window.authenticationXWiki.getUserDetails();
  }

  logout(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
