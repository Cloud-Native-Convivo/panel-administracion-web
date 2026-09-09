import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Building2, Shield, Eye, EyeOff } from 'lucide-angular';
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

  ngOnInit(): void {
    if (this.msalService.instance.getActiveAccount()) {
      this.router.navigate(['/dashboard']);
    }
  }

  protected readonly email = signal('');
  protected readonly pw = signal('');
  protected readonly showPw = signal(false);
  protected readonly mode = signal<'sso' | 'email'>('sso');

  // Iconos del template
  protected readonly icBuilding = Building2;
  protected readonly icShield = Shield;
  protected readonly icEye = Eye;
  protected readonly icEyeOff = EyeOff;

  protected readonly year = new Date().getFullYear();

  protected loginSso(): void {
    this.msalService.instance.initialize().then(() =>
      this.msalService.loginRedirect(loginRequest)
    );
  }

  protected login(): void {
    this.router.navigate(['/dashboard']);
  }
}
