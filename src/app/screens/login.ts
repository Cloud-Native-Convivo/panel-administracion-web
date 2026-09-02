import { Component, inject, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { Building2, Shield, Eye, EyeOff } from 'lucide-angular';
import { loginRequest } from '../../auth/loginRequest';

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly msal = inject(MsalService);

  protected readonly email = signal('');
  protected readonly pw = signal('');
  protected readonly showPw = signal(false);
  protected readonly mode = signal<'sso' | 'email'>('sso');
  protected readonly token = signal('');

  // Iconos del template
  protected readonly icBuilding = Building2;
  protected readonly icShield = Shield;
  protected readonly icEye = Eye;
  protected readonly icEyeOff = EyeOff;

  protected readonly year = new Date().getFullYear();

  protected login(): void {
    this.msal.loginRedirect(loginRequest).subscribe();
  }

  protected async getToken(): Promise<void> {
    try {
      const res = await firstValueFrom(this.msal.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/.default'],
      }));
      this.token.set(res.accessToken);
    } catch {
      const res = await firstValueFrom(this.msal.acquireTokenPopup({
        scopes: ['https://graph.microsoft.com/.default'],
      }));
      this.token.set(res.accessToken);
    }
  }
}
