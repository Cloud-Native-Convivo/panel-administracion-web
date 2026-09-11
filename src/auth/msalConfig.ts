import {
  BrowserCacheLocation,
  LogLevel,
  type Configuration,
} from '@azure/msal-browser'
import type { MsalGuardConfiguration } from '@azure/msal-angular'
import { InteractionType } from '@azure/msal-browser'
import { environment } from '../environments/environment'
import { API_SCOPES } from './apiScopes'

// document.baseURI resuelve el <base href> del index.html a una URL absoluta:
// http://localhost:4200/ en dev, https://cloud-native-convivo.github.io/panel-administracion-web/
// en GitHub Pages -- sin esto, redirectUri quedaba fijo en localhost y rompía
// el login redirect en cualquier despliegue real (environment.redirectUri
// nunca se actualiza por entorno, no hay environment.prod.ts).
const baseUri = document.baseURI;

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.clientId,
    authority: `https://login.microsoftonline.com/${environment.tenantId}`,
    redirectUri: baseUri,
    postLogoutRedirectUri: `${baseUri}login`,
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