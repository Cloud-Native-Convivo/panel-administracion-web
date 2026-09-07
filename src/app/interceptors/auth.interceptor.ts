import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchAll } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_SCOPES } from '../../auth/apiScopes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msal = inject(MsalService, { optional: true });

  const isApiUrl =
    req.url === environment.apiUrl ||
    req.url.startsWith(environment.apiUrl + '/');

  if (!isApiUrl) {
    return next(req);
  }

  const accounts = msal?.instance.getAllAccounts() ?? [];
  const active = msal?.instance.getActiveAccount() ?? accounts[0];

  if (!active) {
    return next(req);
  }

  const request = msal!.instance
    .acquireTokenSilent({
      scopes: API_SCOPES,
      account: active,
    })
    .then((result) =>
      next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${result.accessToken}` },
        }),
      ),
    )
    .catch(() => next(req));

  return from(request).pipe(switchAll());
};
