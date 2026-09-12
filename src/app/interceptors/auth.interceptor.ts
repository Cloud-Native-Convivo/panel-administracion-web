import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

// El Bearer token lo adjunta MsalInterceptor (protectedResourceMap en
// msalConfig.ts, registrado en app.config.ts). Este interceptor solo agrega
// la identidad del usuario para que el bff la propague al microservicio.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msal = inject(MsalService, { optional: true });

  const isApiUrl =
    req.url.startsWith(environment.apiUrl) ||
    (environment.apiEspaciosUrl ? req.url.startsWith(environment.apiEspaciosUrl) : false) ||
    (environment.bffBaseUrl ? req.url.startsWith(environment.bffBaseUrl) : false);

  if (!isApiUrl) {
    return next(req);
  }

  let active: any = null;
  let roles = 'admin';

  try {
    const accounts = msal?.instance.getAllAccounts() ?? [];
    active = msal?.instance.getActiveAccount() ?? accounts[0];
    const claims = active?.idTokenClaims as { roles?: string[] } | undefined;
    if (claims?.roles && Array.isArray(claims.roles) && claims.roles.length > 0) {
      roles = claims.roles.join(',');
    }
  } catch {
    active = null;
    roles = 'admin';
  }

  const sub = active?.localAccountId ?? 'admin-sub-local';

  return next(
    req.clone({
      setHeaders: {
        'X-Usuario-Roles': roles,
        'X-Usuario-Sub': sub,
      },
    }),
  );
};
