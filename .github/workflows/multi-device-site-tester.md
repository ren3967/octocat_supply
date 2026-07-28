---
name: Multi-Device Site Tester
description: Test the frontend website across common device resolutions and report regressions.
on:
  schedule: weekly on monday around 9:00
  workflow_dispatch:
    inputs:
      devices:
        description: "Comma-separated device groups: mobile,tablet,desktop"
        required: false
        default: "mobile,tablet,desktop"
      base_url:
        description: "Base URL to test (used when provided)"
        required: false
        default: "http://localhost:5137"
permissions:
  contents: read
  issues: read
  pull-requests: read

sandbox:
  agent:
    sudo: false

engine:
  id: pi
strict: true
model: copilot/gpt-5.4
timeout-minutes: 40
max-turns: 80

runtimes:
  node:
    version: "24"

tools:
  cli-proxy: true
  github:
    mode: gh-proxy
  playwright:
    mode: cli
  timeout: 120
  bash:
    - "make install"
    - "make build*"
    - "make build-frontend"
    - "npm run preview*"
    - "playwright-cli*"
    - "curl*"
    - "kill*"
    - "lsof*"
    - "ls*"
    - "pwd*"
    - "cd*"
    - "nohup*"
    - "cat*"
    - "echo*"
    - "sleep*"
    - "mkdir*"
    - "rm*"

safe-outputs:
  upload-artifact:
    max-uploads: 6
    retention-days: 14
    skip-archive: true
    defaults:
      if-no-files: ignore
  create-issue:
    title-prefix: "[multi-device-site] "
    labels: [bug]
  noop:

network:
  allowed:
    - node
    - chrome
    - playwright

pre-agent-steps:
  - name: Configure Playwright CLI launch options
    env:
      EXPR_GITHUB_WORKSPACE: ${{ github.workspace }}
    run: |
      mkdir -p "$EXPR_GITHUB_WORKSPACE/.playwright"
      cat > "$EXPR_GITHUB_WORKSPACE/.playwright/cli.config.json" <<'EOF'
      {
        "browser": {
          "launchOptions": {
            "chromiumSandbox": false,
            "args": ["--no-sandbox", "--disable-setuid-sandbox"]
          }
        }
      }
      EOF
  - name: Install dependencies and build app (docs/build.md)
    env:
      EXPR_GITHUB_WORKSPACE: ${{ github.workspace }}
    run: |
      cd "$EXPR_GITHUB_WORKSPACE"
      make install
      make build

features:
  gh-aw-detection: true
---

# Multi-Device Frontend Site Tester

You are validating the frontend website for responsive regressions.

Context:
- Repository: ${{ github.repository }}
- Trigger actor: @${{ github.actor }}
- Devices input: `${{ inputs.devices }}`
- Base URL input: `${{ inputs.base_url }}`

Hard requirements:
1. Test the website using the frontend preview server.
2. Run checks across mobile, tablet, and desktop resolutions from the requested device groups.
3. Capture screenshots for each device tested.
4. If issues are found, create exactly one issue with clear reproduction details.
5. If no issues are found, emit `noop`.
6. Always emit one safe output (`create-issue` or `noop`) before exiting.

## Step 1: Start preview server

Use the built frontend and start preview mode:

```bash
cd "${{ github.workspace }}/frontend"
LOG_FILE="/tmp/gh-aw/agent/frontend-preview.log"
nohup npm run preview -- --host 0.0.0.0 --port 5137 > "$LOG_FILE" 2>&1 &
echo "Server PID: $!, log: $LOG_FILE"
```

Wait for readiness:

```bash
BASE_URL="${{ inputs.base_url }}"
LOG_FILE="/tmp/gh-aw/agent/frontend-preview.log"
MAX_WAIT=120
WAITED=0
until curl -sf "$BASE_URL" > /dev/null 2>&1; do
  WAITED=$((WAITED + 3))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "Server log:" && cat "$LOG_FILE"
    echo "ERROR: frontend preview did not start after ${MAX_WAIT}s"
    exit 1
  fi
  sleep 3
done
echo "Frontend preview ready at $BASE_URL"
```

## Step 2: Device matrix

Use these viewport targets:
- Mobile: iPhone 12 (390x844), iPhone 12 Pro Max (428x926), Pixel 5 (393x851), Galaxy S21 (360x800)
- Tablet: iPad (768x1024), iPad Pro 11 (834x1194), iPad Pro 12.9 (1024x1366)
- Desktop: HD (1366x768), FHD (1920x1080), 4K-ish (2560x1440)

Only test groups requested in `${{ inputs.devices }}`.

## Step 3: Test strategy

For each selected device:
1. Set viewport.
2. Navigate to `${{ inputs.base_url }}` with `waitUntil: 'domcontentloaded'`.
3. Confirm page title is non-empty.
4. Check for obvious runtime failures:
   - unhandled error overlays
   - blank page/body with zero meaningful text
   - severe layout clipping/overflow of primary content
5. Take screenshot and save under:
   - `${{ github.workspace }}/artifacts/multi-device/<device-name>.png`

Use `playwright-cli run-code` for scripted checks and `playwright-cli screenshot` when helpful.
Always use config: `${{ github.workspace }}/.playwright/cli.config.json`.

## Step 4: Result policy

- If one or more problems are found:
  - Call `create-issue` once.
  - Include:
    - tested URL
    - affected devices
    - concise failure summary
    - reproduction steps
    - expected vs actual
    - references to screenshot artifact filenames
- If no problems are found:
  - Call `noop` with a concise summary of tested devices and pass result.

Be concise and deterministic. Do not create pull requests in this workflow.