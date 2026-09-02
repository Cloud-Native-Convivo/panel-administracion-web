import type { RedirectRequest } from '@azure/msal-browser'

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
}