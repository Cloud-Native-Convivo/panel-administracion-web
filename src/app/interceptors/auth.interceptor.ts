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

  const accounts = msal?.instance.getAllAccounts() ?? [];
  const active = msal?.instance.getActiveAccount() ?? accounts[0];

  const getRolesHeader = (): string => {
    const claims = active?.idTokenClaims as { roles?: string[] } | undefined;
    if (claims?.roles && Array.isArray(claims.roles) && claims.roles.length > 0) {
      return claims.roles.join(',');
    }
    return 'admin';
  };

  const roles = getRolesHeader();

  if (!active) {
    return next(
      req.clone({
        setHeaders: {
          'X-Usuario-Roles': roles,
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
          },
        }),
      ),
    )
    .catch(() =>
      next(
        req.clone({
          setHeaders: {
            'X-Usuario-Roles': roles,
          },
        }),
      ),
    );

  return from(request).pipe(switchAll());
};
