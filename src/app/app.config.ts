import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import {
  type IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser'
import {
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalService,
} from '@azure/msal-angular'
import { routes } from './app.routes'
import { msalConfig } from '../auth/msalConfig'

const browserProviders = [
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes),
]

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig)
}

export const appConfig: ApplicationConfig = {
  providers: [...browserProviders],
}

export const msalAppConfig: ApplicationConfig = {
  providers: [
    ...browserProviders,
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
    MsalBroadcastService,
  ],
}