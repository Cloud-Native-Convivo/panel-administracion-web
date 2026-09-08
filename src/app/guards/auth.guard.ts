import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const authGuard: CanActivateFn = () => {
  const msal = inject(MsalService);
  const router = inject(Router);

  if (msal.instance.getActiveAccount() || msal.instance.getAllAccounts().length > 0) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
