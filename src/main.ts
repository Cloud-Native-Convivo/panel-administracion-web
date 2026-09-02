import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig, msalAppConfig } from './app/app.config'
import { App } from './app/app'
import { isAuthConfigured } from './auth/msalConfig'

bootstrapApplication(App, isAuthConfigured ? msalAppConfig : appConfig).catch(
  (err) => console.error(err),
)