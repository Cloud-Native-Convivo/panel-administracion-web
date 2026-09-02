import {
  type Configuration,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser'
import { environment } from '../environments/environment'

const clientId = environment.clientId ?? ''
const tenantId = environment.tenantId ?? ''
const redirectUri = environment.redirectUri ?? 'http://localhost:4200'

export const isAuthConfigured =
  Boolean(clientId) &&
  Boolean(tenantId) &&
  !clientId.startsWith('REEMPLAZAR') &&
  !tenantId.startsWith('REEMPLAZAR')

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
}