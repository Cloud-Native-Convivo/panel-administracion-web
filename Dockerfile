# ============================================
# Etapa 1: Instalar dependencias
# ============================================
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate && \
    pnpm install --frozen-lockfile


# ============================================
# Etapa 2: Compilar la aplicación
# ============================================
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate && \
    pnpm exec ng build


# ============================================
# Etapa 3: Imagen final (nginx sirviendo estáticos)
# ============================================
FROM nginx:1.29-alpine@sha256:5616878291a2eed594aee8db4dade5878cf7edcb475e59193904b198d9b830de AS runtime

RUN apk upgrade --no-cache libcrypto3 libssl3

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/panel-admin/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
