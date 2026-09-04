import {
  BrowserCacheLocation,
  type Configuration,
} from '@azure/msal-browser'
import { environment } from '../environments/environment'

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.clientId,
    authority: `https://login.microsoftonline.com/${environment.tenantId}`,
    redirectUri: environment.redirectUri,
    postLogoutRedirectUri: environment.redirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
}