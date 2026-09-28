import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

// El Bearer token lo adjunta MsalInterceptor (protectedResourceMap en
// msalConfig.ts, registrado en app.config.ts). Este interceptor solo agrega
// la identidad del usuario para que el bff la propague al microservicio.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msal = inject(MsalService, { optional: true });

  const matchesApiBase = (reqUrl: string, baseUrl?: string): boolean => {
    if (!baseUrl || baseUrl.trim().length === 0) return false;
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const parsedBase = new URL(baseUrl, origin);
      const parsedReq = new URL(reqUrl, origin);

      if (parsedBase.origin !== parsedReq.origin) {
        return false;
      }

      const basePath = parsedBase.pathname.replace(/\/+$/, '');
      const reqPath = parsedReq.pathname.replace(/\/+$/, '');

      return reqPath === basePath || parsedReq.pathname.startsWith(`${basePath}/`);
    } catch {
      return false;
    }
  };

  const isApiUrl =
    matchesApiBase(req.url, environment.apiUrl) ||
    matchesApiBase(req.url, environment.apiEspaciosUrl) ||
    matchesApiBase(req.url, environment.bffBaseUrl);

  if (!isApiUrl) {
    return next(req);
  }

  let active: any = null;
  let roles = '';

  try {
    const accounts = msal?.instance.getAllAccounts() ?? [];
    active = msal?.instance.getActiveAccount() ?? accounts[0];
    const claims = active?.idTokenClaims as { roles?: string[] } | undefined;
    if (claims?.roles && Array.isArray(claims.roles) && claims.roles.length > 0) {
      roles = claims.roles.map((r) => (r === 'admin' ? 'administrador' : r)).join(',');
    } else if (active) {
      // Fallback para entornos donde Azure Entra ID aún no tiene App Roles configurados
      roles = 'administrador';
    }
  } catch {
    active = null;
    roles = '';
  }

  const sub = active?.localAccountId ?? '';
  const headersToAdd: Record<string, string> = {};
  if (roles) {
    headersToAdd['X-Usuario-Roles'] = roles;
  }
  if (sub) {
    headersToAdd['X-Usuario-Sub'] = sub;
  }

  return next(
    req.clone({
      setHeaders: headersToAdd,
    }),
  );
};
