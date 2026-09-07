import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchAll } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_SCOPES } from '../../auth/apiScopes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msal = inject(MsalService, { optional: true });

  const isApiUrl =
    req.url.startsWith(environment.apiUrl) ||
    (environment.apiEspaciosUrl ? req.url.startsWith(environment.apiEspaciosUrl) : false);

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

  if (!active) {
    return next(
      req.clone({
        setHeaders: {
          'X-Usuario-Roles': roles,
          'X-Usuario-Sub': sub,
        },
      }),
    );
  }

  const request = msal!.instance
    .acquireTokenSilent({
      scopes: API_SCOPES,
      account: active,
    })
    .then((result) =>
      next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${result.accessToken}`,
            'X-Usuario-Roles': roles,
            'X-Usuario-Sub': sub,
          },
        }),
      ),
    )
    .catch(() =>
      next(
        req.clone({
          setHeaders: {
            'X-Usuario-Roles': roles,
            'X-Usuario-Sub': sub,
          },
        }),
      ),
    );

  return from(request).pipe(switchAll());
};
