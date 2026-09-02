import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { LucideAngularModule } from 'lucide-angular';
import { Building2, Shield } from 'lucide-angular';
import { loginRequest } from '../../auth/loginRequest';

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly msal = inject(MsalService);

  // Iconos del template
  protected readonly icBuilding = Building2;
  protected readonly icShield = Shield;

  protected readonly year = new Date().getFullYear();

  protected login(): void {
    this.msal.loginRedirect(loginRequest).subscribe();
  }
}
