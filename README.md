# WebHardware

A browser-based hardware lab: build circuits, write Arduino / Pico / ESP32 / STM32
firmware, and simulate it, all in the browser.

This repository bundles the four parts of the platform:

| Folder | What it is |
|---|---|
| `OpenHW-studio-frontend/` | React + Vite web app (simulator, classrooms, dashboards) |
| `openhw-studio-backend/` | Node API: auth, compile service, ESP32 (QEMU) and STM32 (Renode) workers, network gateway |
| `openhw-studio-emulator/` | Simulation engine and component library, shared by frontend and backend |
| `openhw-studio-examples/` | Example circuits and guided projects |

The folder names keep their original upstream names because the code refers to
them by path (for example `"@openhw/emulator": "file:../openhw-studio-emulator"`).

## Run it with Docker (macOS, Linux or Windows)

Requirements: [Docker Desktop](https://www.docker.com/products/docker-desktop/) with
about 8 GB of memory allocated.

On an **Apple Silicon Mac**, open Docker Desktop → Settings → General and turn on
**"Use Rosetta for x86_64/amd64 emulation on Apple Silicon"**. The backend images bundle
x86-only tools (Espressif QEMU, Renode), so they run under Rosetta.

```bash
git clone https://github.com/lightning-sagar/major-project.git
cd major-project
cp .env.example .env        # optional, the defaults work locally
docker compose up --build
```

Then open **http://localhost:8080**.

The first build takes a while (roughly 15–30 minutes) because it downloads the
Arduino cores, the ESP32 and STM32 toolchains, QEMU and Renode. Later starts are fast.

| Service | What it does | Port |
|---|---|---|
| `frontend` | nginx serving the web app; proxies `/api` and `/auth` to the backend | 8080 |
| `backend` | Main API, AVR and RP2040 compiles | 5000 |
| `esp32-worker` | ESP32 compile and QEMU simulation | internal |
| `stm32-worker` | STM32 compile and Renode simulation | internal |
| `network-gateway` | Virtual Wi-Fi / network bridge for simulated boards | internal |
| `mongodb` | Database for accounts, classrooms and saved projects | 27017 |

Useful commands:

```bash
docker compose logs -f backend      # follow one service's logs
docker compose down                 # stop everything
docker compose down -v              # stop and wipe the database and caches
```

## Run it without Docker (development)

You need Node 20+, MongoDB, and `arduino-cli` with the `arduino:avr`,
`rp2040:rp2040`, `esp32:esp32` and `STMicroelectronics:stm32` cores. ESP32
simulation also needs `esptool`, and STM32 simulation needs Renode.

```bash
# backend
cd openhw-studio-backend
cp .env.example .env
npm install
npm start                 # http://localhost:5000

# frontend, in a second terminal
cd OpenHW-studio-frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```

## Credits

Built on OpenHW Studio by the FOSSEE project, IIT Bombay
([github.com/OpenHW-Studio](https://github.com/OpenHW-Studio)).
