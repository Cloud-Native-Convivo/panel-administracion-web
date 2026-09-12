import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http'
import {
  type IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser'
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalService,
} from '@azure/msal-angular'

import { routes } from './app.routes'
import { msalConfig, MSALGuardConfigFactory, MSALInterceptorConfigFactory } from '../auth/msalConfig'
import { authInterceptor } from './interceptors/auth.interceptor'

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig)
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // authInterceptor agrega identidad (X-Usuario-Roles/X-Usuario-Sub);
    // MsalInterceptor (withInterceptorsFromDi) adjunta el Bearer token según
    // protectedResourceMap (ver msalConfig.ts).
    provideHttpClient(withInterceptors([authInterceptor]), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
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