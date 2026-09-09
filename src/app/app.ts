import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  private readonly msalService = inject(MsalService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe((result) => {
      if (result?.account) {
        this.msalService.instance.setActiveAccount(result.account);
        this.router.navigateByUrl('/dashboard');
        return;
      }
      if (!this.msalService.instance.getActiveAccount()) {
        const cuentas = this.msalService.instance.getAllAccounts();
        if (cuentas.length > 0) {
          this.msalService.instance.setActiveAccount(cuentas[0]);
        }
      }
    });
  }
}
