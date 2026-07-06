# CLAUDE.md

## Taking screenshots / visually verifying UI changes

This is a Docusaurus site. To verify a frontend change visually (not just `tsc --noEmit`),
drive a headless Chromium against the dev server with Playwright.

**Only `@playwright/cli@latest` is installed globally in this image** — there is no separate
top-level `playwright` package. `@playwright/cli` vendors its own `playwright`/`playwright-core`
under `@playwright/cli/node_modules/`, and its browser (`playwright-cli install-browser
chromium`, already run) is cached under `~/.cache/ms-playwright`. Don't install a second,
separate `playwright` package — its Chromium build has a different revision number than the
one `@playwright/cli` vendors, so you'd end up with two ~380MB Chromium copies cached side by
side instead of one. Neither package is a project dependency; don't add either to
`package.json`.

```bash
npm ls -g --depth=0        # confirm: @playwright/cli (no separate `playwright`)
ls ~/.cache/ms-playwright   # confirm: chromium-*, chromium_headless_shell-*
```

If a fresh image ever doesn't have these, re-run `playwright-cli install-browser chromium` (see
the Fedora dependency note below first — it doesn't officially support Fedora).

### One-time environment setup (Fedora), if Chromium won't launch

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

### Start the dev server

```bash
npm run start -- --port 3005 --no-open > /tmp/docusaurus-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:3005/mp23-digital-plan-testing/ >/dev/null; do sleep 1; done'
```

### Interactive checks (preferred): `playwright-cli`

This project has already run `playwright-cli install --skills`, which created two project
files (not gitignored, safe to commit): `.playwright/cli.config.json` (defaults the CLI to the
`chromium` channel — without it, `playwright-cli open` tries to launch a branded Google Chrome
that isn't installed and fails) and `.claude/skills/playwright-cli/` (registers it as a proper
Claude Code skill — it may already show up in your available-skills list).

It keeps a persistent browser session across commands, so multi-step flows (navigate, scroll,
click, screenshot, read console) are one command each instead of one throwaway script:

```bash
playwright-cli open http://localhost:3005/mp23-digital-plan-testing/
playwright-cli eval "() => window.scrollBy(0, 900)"
playwright-cli screenshot
playwright-cli console       # check for errors
playwright-cli close          # always close when done
```

`playwright-cli screenshot` prints the output path — it's under `.playwright-cli/` in
whatever directory you ran it from. **Run it from the repo root** (that's what's gitignored);
running it from `/tmp` would need its own gitignore. Read the printed path with the Read tool.

### Scripted / repeatable checks: write a `.cjs` script

For anything with loops or logic that's awkward as a sequence of CLI calls (e.g. capturing
screenshots at N scroll depths), write a throwaway Node script instead. Put it in `/tmp` (not
the repo).

Use **`.cjs` + `require`**, not `.mjs` + `import` — Node's ESM resolver doesn't honor
`NODE_PATH`, so an `import "playwright"` from `/tmp` can't find the global install. `require`
does honor `NODE_PATH`, so run it with
`NODE_PATH="$(npm root -g)/@playwright/cli/node_modules"` — that's `@playwright/cli`'s own
vendored copy of `playwright` (there's no separate top-level `playwright` package to point at
anymore, see above), and it shares the same Chromium revision the CLI already uses.

`/tmp/pw-check/check.cjs`:

```js
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push(String(err)));

  // Use waitUntil: "load", NOT "networkidle" — Docusaurus's dev server keeps a
  // websocket open for HMR, so networkidle never resolves and times out.
  await page.goto("http://localhost:3005/mp23-digital-plan-testing/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "/tmp/pw-check/initial-load.png" });

  // e.g. scroll to check a scroll-driven transition
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/pw-check/scrolled-1.png" });

  console.log("Console/page errors:", errors);
  await browser.close();
})();
```

```bash
mkdir -p /tmp/pw-check
NODE_PATH="$(npm root -g)/@playwright/cli/node_modules" node /tmp/pw-check/check.cjs
```

Then use the Read tool on the resulting PNGs to actually look at them.

### Cleanup

Playwright + Chromium live in the image now (global npm install, `~/.cache/ms-playwright`) —
don't delete those. Just clean up your own scratch output:

```bash
rm -rf /tmp/pw-check
```
