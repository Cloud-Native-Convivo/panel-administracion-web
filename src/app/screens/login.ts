import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Building2, Shield, Loader2 } from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from '../../auth/loginRequest';

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly msalService = inject(MsalService);

  // INP: Estado visual inmediato
  protected readonly isLoggingIn = signal(false);

  ngOnInit(): void {
    if (this.msalService.instance.getActiveAccount()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Iconos del template
  protected readonly icBuilding = Building2;
  protected readonly icShield = Shield;
  protected readonly icLoader = Loader2;

  protected readonly year = new Date().getFullYear();

  protected async loginSso(): Promise<void> {
    // Feedback visual inmediato para INP
    this.isLoggingIn.set(true);
    
    // Yield al navegador para que pinte el estado de carga antes de bloquear
    await new Promise(r => setTimeout(r, 0));

    this.msalService.instance.initialize().then(() =>
      this.msalService.loginRedirect(loginRequest)
    ).catch(() => {
      this.isLoggingIn.set(false);
    });
  }
}
