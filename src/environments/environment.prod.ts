const apiUrl = 'https://x4p5y5i900.execute-api.us-east-1.amazonaws.com';

export const environment = {
  clientId: '8c375036-6298-414a-bc3f-eb0f8fbdf26c',
  tenantId: '936612c7-66b8-41ba-a9dd-83f50365f818',
  redirectUri: 'https://cloud-native-convivo.github.io/panel-administracion-web/',
  postLogoutRedirectUri: 'https://cloud-native-convivo.github.io/panel-administracion-web/login',
  apiUrl,
  // Mismo sufijo que en local (ver environment.ts), solo cambia el host: el
  // controller del BFF vive en /api/v1/espacios-comunes tal cual.
  apiEspaciosUrl: `${apiUrl}/api/v1/espacios-comunes`,
  // El BFF corre detrás del API Gateway en vez de localhost:3000.
  bffBaseUrl: `${apiUrl}/api`,
};
