// Entorno local: todos los endpoints apuntan a servicios corriendo en localhost.
// Usar con: pnpm start:local  (ng serve --configuration local)
// El dev-server de Angular proxea /api/* a localhost:3000 via proxy.conf.json,
// así que no hay problemas de CORS en desarrollo.
export const environment = {
  clientId: '8c375036-6298-414a-bc3f-eb0f8fbdf26c',
  tenantId: '936612c7-66b8-41ba-a9dd-83f50365f818',
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200/login',
  // En local el "API Gateway" es simplemente el BFF corriendo en :3000.
  apiUrl: 'http://localhost:3000',
  apiEspaciosUrl: 'http://localhost:3000/api/v1/espacios-comunes',
  bffBaseUrl: 'http://localhost:3000/api',
};
