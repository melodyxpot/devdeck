# DevDeck

A desktop command center for local development. One place to see projects, terminals, Git, ports, processes, Docker, environment files, clipboard history, snippets, deployments, and a privacy-first debugger.

DevDeck is a **Tauri 2** app with a **React + TypeScript** UI. Local features work offline. GitHub, AI, and deploy providers are optional.

## Architecture

```text
src/                  React UI
  components/         Design system and shell
  features/           Feature-specific widgets
  pages/              One view per sidebar route
  hooks/              Workspace, hotkeys, media
  stores/             Zustand (navigation + settings)
  services/           Typed workspace + integrations
  lib/                Platform, formatting, errors
  types/              Shared domain types
  utils/              Pure parsers (tested)

src-tauri/            Rust host
  commands/           Validated Tauri commands
  services/           Project + env detection
  git/ docker/        Optional tool adapters
  processes/          Developer process + port scan
  filesystem/         Path sanitization
  database/           Local SQLite
```

The UI never talks to the OS directly. React calls typed services. In the browser (or when sample data is on), those services use an in-memory workspace. In the desktop build they can invoke Rust commands. Mock data is separated from live system calls — DevDeck will not pretend a kill, push, or compose command succeeded if the host did not run it.

## Run locally

### UI preview (any OS)

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:14280`. This is the full product shell with a realistic sample workspace (`momoreis`, `melodyxpot`, `example-next-app`, `api-server`).

### Desktop app (Windows first)

Prerequisites: Rust, Node 22+, WebView2 (Windows), and the [Tauri Linux packages](https://tauri.app/start/prerequisites/) if you build on Linux.

```bash
pnpm install
pnpm tauri dev
```

Release installers:

```bash
pnpm tauri build
```

Windows targets are `msi` and `nsis`. The app can live in the tray and open folders, URLs, and editors through the host.

### Cloud Windows installer (GitHub Actions)

Origin CI and this Cursor cloud environment are Linux-only, so they cannot produce a Windows `setup.exe`. Push the repo to GitHub and run **Actions → Windows installer → Run workflow**. When it finishes, download the `DevDeck-windows-setup` artifact (`*-setup.exe` and `.msi`).

## Tests

```bash
pnpm test
pnpm lint
cd src-tauri && cargo test
```

Covered: project detection, Git porcelain parsing, ports, command ranking, env comparison, clipboard classification, AI context exclusion, path traversal rejection, and confirmation-gated process kills.

## Privacy

- `.env` and credential-looking files are excluded from AI context by default.
- Secret values are never shown unless you reveal one temporarily.
- Telemetry, clipboard history, and activity history are off or obvious toggles.
- Destructive Git, Docker, and process actions always confirm.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ K` | Command palette |
| `Ctrl/⌘ Shift P` | Project switcher |
| `Ctrl/⌘ Shift V` | Developer clipboard |
| `Ctrl/⌘ Shift D` | Dashboard |

Shortcuts are configurable in Settings.
