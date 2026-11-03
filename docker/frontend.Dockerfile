# WebHardware frontend: Vite build served by nginx.
# Build context: repository root (needs the emulator next to the frontend).
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

COPY OpenHW-studio-frontend/package*.json ./
COPY openhw-studio-emulator ./src/emulator
RUN rm -rf ./src/emulator/node_modules ./src/emulator/dist
RUN sed -i 's|"@openhw/emulator": "file:../openhw-studio-emulator"|"@openhw/emulator": "file:./src/emulator"|' package.json

RUN npm install --legacy-peer-deps --no-audit --no-fund

# The lockfile was generated on Windows, so npm can skip the Linux native
# binaries. Install them explicitly for the architecture being built
# (arm64 on Apple Silicon, x64 on Intel).
ARG TARGETARCH
RUN case "$TARGETARCH" in arm64) A=arm64 ;; *) A=x64 ;; esac && \
    npm install --no-save --legacy-peer-deps --no-audit --no-fund \
      @rollup/rollup-linux-$A-gnu lightningcss-linux-$A-gnu @tailwindcss/oxide-linux-$A-gnu

COPY OpenHW-studio-frontend/ .
# package.json was overwritten by the COPY above; re-point the emulator again
RUN sed -i 's|"@openhw/emulator": "file:../openhw-studio-emulator"|"@openhw/emulator": "file:./src/emulator"|' package.json

ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_ADMIN_EMAILS=""
ARG VITE_DOCS_URL=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_ADMIN_EMAILS=$VITE_ADMIN_EMAILS \
    VITE_DOCS_URL=$VITE_DOCS_URL

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM nginx:stable-alpine
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY OpenHW-studio-frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
