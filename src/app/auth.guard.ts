import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const msal = inject(MsalService);
  const broadcast = inject(MsalBroadcastService);
  const router = inject(Router);

  await firstValueFrom(
    broadcast.inProgress$.pipe(
      filter((status) => status === InteractionStatus.None),
    ),
  );

  const hasAccount = msal.instance.getAllAccounts().length > 0;
  return hasAccount ? true : router.createUrlTree(['/login']);
};