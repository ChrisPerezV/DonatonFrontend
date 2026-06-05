FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos los manifiestos de dependencias para aprovechar la caché de Docker
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Construcción del proyecto
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar la telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Etapa 3: Imagen de Producción (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos el directorio public
COPY --from=builder /app/public ./public

# Creamos la carpeta .next con los permisos adecuados
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiamos la salida standalone y los archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]