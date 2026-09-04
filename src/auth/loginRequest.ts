import type { RedirectRequest } from '@azure/msal-browser'
import { API_SCOPES } from './apiScopes'

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'User.Read', ...API_SCOPES],
}