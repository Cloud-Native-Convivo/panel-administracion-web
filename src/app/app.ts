import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly msal = inject(MsalService, { optional: true });
  private readonly broadcast = inject(MsalBroadcastService, { optional: true });

  protected readonly loggedIn = signal(false);

  ngOnInit(): void {
    if (!this.msal || !this.broadcast) return;

    this.msal
      .handleRedirectObservable({ navigateToLoginRequestUrl: false })
      .subscribe({
        next: (result) => {
          if (result?.account) {
            this.msal!.instance.setActiveAccount(result.account);
          }
        },
      });

    this.broadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const accounts = this.msal!.instance.getAllAccounts() ?? [];
        if (accounts.length > 0 && !this.msal!.instance.getActiveAccount()) {
          this.msal!.instance.setActiveAccount(accounts[0]);
        }
        this.loggedIn.set(accounts.length > 0);
      });
  }
}
