# CLAUDE.md

## Taking screenshots / visually verifying UI changes

This is a Docusaurus site. To verify a frontend change visually (not just `tsc --noEmit`),
drive a headless Chromium against the dev server with Playwright.

Playwright isn't a project dependency — install it as a scratch tool in `/tmp`, don't add it
to `package.json`.

### One-time environment setup (Fedora)

Playwright doesn't officially support Fedora, so `playwright install --with-deps` fails
(it targets Ubuntu/Debian and needs sudo anyway). Instead install the shared libs directly:

```bash
sudo dnf install -y nss nspr atk at-spi2-atk at-spi2-core cups-libs dbus-libs \
  libX11 libXcomposite libXdamage libXext libXfixes libXrandr \
  mesa-libgbm alsa-lib cairo pango libxkbcommon
```

If Chromium still fails to launch after this, run `ldd` against the downloaded binary to find
what's still missing, then map each `.so` name to its Fedora package with `dnf info <pkg>`:

```bash
BIN=$(find ~/.cache/ms-playwright -iname "chrome" -o -iname "chrome-headless-shell" | head -1)
ldd "$BIN" 2>&1 | grep "not found"
```

### Per-session workflow

```bash
# 1. Start the dev server (poll instead of sleeping)
npm run start -- --port 3005 --no-open > /tmp/docusaurus-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:3005/mp23-digital-plan-testing/ >/dev/null; do sleep 1; done'

# 2. Install Playwright + Chromium as a scratch tool (not in this repo)
mkdir -p /tmp/pw-check && cd /tmp/pw-check
npm init -y >/dev/null 2>&1
npm install playwright@latest >/dev/null 2>&1
npx playwright install chromium
```

Then drive it with a small script, e.g. `/tmp/pw-check/check.mjs`:

```js
import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

// Use waitUntil: "load", NOT "networkidle" — Docusaurus's dev server keeps a
// websocket open for HMR, so networkidle never resolves and times out.
await page.goto("http://localhost:3005/mp23-digital-plan-testing/", { waitUntil: "load" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/tmp/pw-check/initial-load.png" });

// e.g. scroll to check a scroll-driven transition
await page.mouse.wheel(0, 900);
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/pw-check/scrolled-1.png" });

console.log("Console/page errors:", errors);
await browser.close();
```

```bash
node /tmp/pw-check/check.mjs
```

Then use the Read tool on the resulting PNGs to actually look at them.

### Cleanup

Playwright's Chromium download is ~300MB. Remove it after verifying:

```bash
rm -rf /tmp/pw-check ~/.cache/ms-playwright
```
