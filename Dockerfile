# ============================================
# Etapa 1: Instalar dependencias
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate && \
    pnpm install --frozen-lockfile


# ============================================
# Etapa 2: Compilar la aplicación
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable && corepack prepare pnpm@12.3.4 --activate && \
    pnpm exec ng build


# ============================================
# Etapa 3: Imagen final (nginx sirviendo estáticos)
# ============================================
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/panel-admin/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK CMD-SHELL wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
