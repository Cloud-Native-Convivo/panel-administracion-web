import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  type IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser'
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MsalService,
} from '@azure/msal-angular'

import { routes } from './app.routes'
import { msalConfig, MSALGuardConfigFactory } from '../auth/msalConfig'
import { authInterceptor } from './interceptors/auth.interceptor'

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig)
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    // msal-browser v3+ exige initialize() antes de cualquier otro metodo de
    // PublicClientApplication. Sin esto, App.ngOnInit() llama a
    // handleRedirectObservable() sobre una instancia sin inicializar en cada
    // carga -- se manifiesta como BrowserAuthError: timed_out en producción.
    provideAppInitializer(() => inject(MSAL_INSTANCE).initialize()),
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
}