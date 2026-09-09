import {
  BrowserCacheLocation,
  LogLevel,
  type Configuration,
} from '@azure/msal-browser'
import type { MsalGuardConfiguration } from '@azure/msal-angular'
import { InteractionType } from '@azure/msal-browser'
import { environment } from '../environments/environment'
import { API_SCOPES } from './apiScopes'

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.clientId,
    authority: `https://login.microsoftonline.com/${environment.tenantId}`,
    redirectUri: environment.redirectUri,
    postLogoutRedirectUri: environment.postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      },
    },
  },
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: API_SCOPES },
  }
}