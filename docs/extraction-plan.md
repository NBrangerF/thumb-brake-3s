# Spec: Fantastic Hook Extraction

## Assumptions

1. `fantastic-hook` is an extra standalone project, not a submodule or feature branch of `videosa`.
2. The first implementation step is to collect all needed files into one folder inside the current workspace, so the folder can later be moved out and initialized/pushed independently.
3. The target GitHub remote is `https://github.com/NBrangerF/thumb-brake-3s.git`.
4. Version 1 prioritizes the current official one-shot Hook Generator experience, especially `HookGeneratorOneShotClient`.
5. Version 1 does not include billing, credits, login-gated product workspace, database persistence, upload billing, or video generation APIs.
6. Version 1 uses LLM only to generate hook scripts and hook creative outputs. Video generation is planned for a later adapter-based version where users can connect their own API keys.

## Objective

Create a standalone, shareable Hook Generator project named `fantastic-hook`.

The goal is to extract the latest official one-shot Hook Generator capability from the current workspace into a clean folder that can become an independent GitHub repository. The public project should let users input product/context information, choose a hook intent, and generate useful hook scripts / creative directions through an LLM. It should preserve the core Hook Generator thinking, resources, and one-shot UX, while removing VideoSa platform-specific dependencies.

Success means:

- The extracted folder can stand alone as its own project.
- The first screen is the real Hook Generator experience, not a marketing page.
- The UI is based on the official `HookGeneratorOneShotClient` path.
- The core output is LLM-generated hook scripts and structured hook creative cards.
- No VideoSa billing, auth, Prisma persistence, OSS production config, Seedance pipeline, or private env files are included.
- The folder is safe to initialize with `git remote add origin https://github.com/NBrangerF/thumb-brake-3s.git`.

## Source Of Truth

Use the latest official implementation from:

```text
videosa/
```

Primary source files:

```text
videosa/app/(v2)/dashboard-v2/hook-generator/_components/HookGeneratorOneShotClient.tsx
videosa/app/(v2)/dashboard-v2/hook-generator/page.tsx
videosa/app/api/hook-generator/one-shot/route.ts
videosa/lib/hook-generator-v2/**
videosa/lib/hook-one-shot.ts
videosa/lib/hook-generator.ts
videosa/lib/hook-library.ts
videosa/lib/culture-motif-resources/**
videosa/data/hook-studio/**
videosa/tests/lib/hook-generator-v2/**
```

Do not use `videosa-hook-generator-20260608` as the source of truth because it is older than the current formal implementation.

Use `hook-studio-standalone-package` only as reference material for resource packaging ideas; it does not contain the current one-shot generator core.

## Version 1 Scope

### Include

- One-shot Hook Generator UI adapted from `HookGeneratorOneShotClient`.
- Product title / product context input.
- Optional product image URL or local image preview as creative context.
- Hook intent modes:
  - pain first
  - audience first
  - creative first
  - offer first
- LLM-generated hook scripts / creative cards.
- Hook Library and culture motif resources needed for recommendations and prompt construction.
- Dry-run style structured outputs:
  - hook title
  - stop-scroll mechanism
  - first second visual idea
  - short script / dialogue
  - shot timing
  - sound direction
  - product bridge
  - final prompt draft for future video generation
- Tests for core hook selection, resource injection, script asset validation, prompt compilation, and LLM output parsing.
- Documentation and `.env.example`.

### Exclude

- Billing and credits.
- Login/session requirements.
- Prisma database persistence.
- Hook trace database writes.
- Product workspace/version history.
- OSS upload signing and production storage.
- Seedance/Sora/Veo video generation API submission.
- Polling real video run status.
- Private env files, deployment notes, production IPs, internal provider credentials, and generated build artifacts.

## Tech Stack

Recommended first version:

```text
Next.js App Router
React
TypeScript
Tailwind CSS
Lucide React
Zod
Vitest
```

Keep the stack close to the source UI so migration is low-risk. Avoid adding a database in version 1.

## Target Folder

Create a folder in the current workspace:

```text
fantastic-hook/
```

Suggested structure:

```text
fantastic-hook/
  app/
    page.tsx
    api/
      hook-generator/
        one-shot/
          route.ts
  components/
    hook-generator/
      HookGeneratorOneShotClient.tsx
    ui/
  data/
    hook-studio/
  docs/
    architecture.md
    migration-notes.md
  lib/
    hook-core/
    hook-generator-v2/
    hook-library/
    llm/
    utils/
  tests/
    hook-generator-v2/
  .env.example
  .gitignore
  README.md
  package.json
  tsconfig.json
  vitest.config.ts
```

The exact structure can be adjusted during implementation, but the first extraction should keep a clear separation between UI, core hook logic, resources, and provider adapters.

## Architecture

Version 1 should split the current implementation into four layers:

```text
UI layer
  HookGeneratorOneShotClient adapted for standalone usage

API layer
  /api/hook-generator/one-shot
  validates input and calls hook application service

Core layer
  hook selection
  culture motif ranking
  resource injection
  script asset generation/repair
  prompt/script compilation

Adapter layer
  LLM provider abstraction
  optional local/no-op persistence
  no video provider in v1
```

The core layer should not directly import billing, auth, Prisma, OSS, or Seedance route handlers.

## Runtime Behavior

### Version 1 Flow

1. User enters product title, optional context, and hook intent.
2. UI calls `/api/hook-generator/one-shot`.
3. API validates the request.
4. Core selects three hook directions using Hook Library resources.
5. Core builds product brief, resource bundle, and script creative spec.
6. LLM adapter generates or refines hook scripts.
7. Deterministic validator repairs obvious structural issues.
8. API returns structured hook cards and prompt/script artifacts.
9. UI displays generated hook options.

### No Video Generation In Version 1

The response may include a `futureVideoPrompt` field, but the app must not submit to Seedance/Sora/Veo. Any button or label implying real video generation should be renamed or removed in v1.

## Environment Variables

Only include placeholders in `.env.example`:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

Optional:

```bash
HOOK_ASSET_PIPELINE_PRIMARY_ENABLED=false
HOOK_NATIVE_ASSET_SHADOW_ENABLED=false
HOOK_TENSION_CULTURE_EVALUATOR_ENABLED=false
```

Never copy real `.env.local`, `.env.server`, or backup env files.

## Commands

Expected commands for the standalone project:

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

If the extracted project uses a different package manager, update this spec before implementation.

## Code Style

Use strict TypeScript, small typed request/response boundaries, and adapter injection for external services.

Example style:

```ts
export type HookScriptGenerationInput = {
  productTitle: string
  intent: HookIntent
  intentText: string
  analysisHints?: HookAnalysisHints
}

export type HookRuntimeAdapters = {
  llm: HookLlmAdapter
  now?: () => Date
  randomId?: () => string
}

export async function generateHookScripts(
  input: HookScriptGenerationInput,
  adapters: HookRuntimeAdapters,
) {
  const request = normalizeHookInput(input)
  const narratives = drawHookNarrativesForIntent(request)
  return buildHookScriptCards({ request, narratives, adapters })
}
```

Avoid route handlers importing platform services directly. Route handlers should validate, call application services, and return JSON.

## Testing Strategy

Keep and adapt the existing Vitest coverage around:

- hook narrative drawing
- culture motif ranking
- resource graph and resource injection
- script creative spec construction
- deterministic validation and repair
- prompt/script compilation
- one-shot API behavior with mocked LLM

Add tests for:

- no auth required in standalone API
- no billing preflight in standalone API
- no video provider submission in v1
- missing LLM config returns a clear user-facing setup error
- migrated UI response shape is stable

## Security And Publication Boundaries

Always:

- Exclude `.env.local`, `.env.server`, `.env.server.bak-*`, `.next`, `node_modules`, build outputs, private media, and production deployment files.
- Run a secret scan before the folder is pushed to GitHub.
- Keep only public-safe resource data and distilled creative grammar.
- Replace internal VideoSa labels with `Fantastic Hook` naming where appropriate.
- Use `.env.example` with placeholders only.

Ask first:

- Adding real video provider support.
- Adding database persistence.
- Adding upload/storage integration.
- Publishing under a specific license.
- Changing the public repository name.

Never:

- Commit real API keys or provider credentials.
- Commit production env files.
- Commit internal billing, credit, or account logic.
- Commit unrelated VideoSa platform code.
- Include generated `.next` artifacts or `node_modules`.

## Implementation Plan

### Phase 1: Create Planning And Extraction Inventory

Build an exact file inventory for the first extraction.

Acceptance:

- A list of files to copy is documented.
- Each file is tagged as `copy`, `adapt`, `replace`, or `exclude`.
- Platform-coupled imports are listed before copying.

Verify:

```bash
rg -n "@/lib/(auth|db|platform-pricing|company-scope|upload|seedance|cost-feature)" fantastic-hook
```

Expected result after implementation: no direct platform-coupled imports in standalone core.

### Phase 2: Create `fantastic-hook/` Skeleton

Create the standalone project folder and minimal Next.js/TypeScript/Vitest setup.

Acceptance:

- `fantastic-hook/package.json` exists.
- `pnpm install` can install dependencies.
- `pnpm dev` starts the app.
- The first page is the Hook Generator surface.

Verify:

```bash
cd fantastic-hook
pnpm install
pnpm dev
```

### Phase 3: Migrate Core Resources

Copy and adapt Hook Library resources and culture motif resources.

Acceptance:

- `data/hook-studio/**` exists in the new folder.
- `lib/hook-library/**` or equivalent loads resources from the standalone project root.
- Culture motif tests pass.

Verify:

```bash
cd fantastic-hook
pnpm test -- tests/hook-generator-v2/culture-motif-system.test.ts
```

### Phase 4: Migrate Hook Core

Copy and adapt `hook-generator-v2`, `hook-one-shot`, and `hook-generator` logic.

Acceptance:

- Core code compiles without VideoSa platform imports.
- LLM calls go through a standalone `HookLlmAdapter`.
- No billing, Prisma, auth, or video submission remains in core v1 path.

Verify:

```bash
cd fantastic-hook
pnpm exec tsc --noEmit
pnpm test -- tests/hook-generator-v2
```

### Phase 5: Migrate One-Shot UI

Adapt `HookGeneratorOneShotClient` for the standalone project.

Acceptance:

- UI no longer asks for login.
- UI no longer uploads through VideoSa OSS signing.
- UI does not display real video generation progress.
- UI displays generated hook script cards from the v1 API.
- Text and buttons describe script/hook generation, not video rendering.

Verify:

```bash
cd fantastic-hook
pnpm dev
```

Manual check:

- Enter product title and intent.
- Generate hook scripts.
- Confirm three useful hook cards are shown.

### Phase 6: Implement Standalone One-Shot API

Create `/api/hook-generator/one-shot` for script generation only.

Acceptance:

- Request validates with Zod.
- API calls standalone hook application service.
- API returns structured cards and script artifacts.
- API never calls Seedance/Sora/Veo.

Verify:

```bash
cd fantastic-hook
pnpm test -- tests/api
```

### Phase 7: Documentation And GitHub Readiness

Write public-facing docs.

Acceptance:

- `README.md` explains what the project does.
- `docs/architecture.md` explains the adapter boundary.
- `.env.example` includes only placeholders.
- `.gitignore` excludes env files and build artifacts.
- Git remote command is documented but not necessarily executed until user confirms.

Verify:

```bash
cd fantastic-hook
git status --short
```

### Phase 8: Final Verification

Run the complete local verification suite.

Acceptance:

- TypeScript passes.
- Tests pass.
- Lint passes.
- Build passes.
- Secret scan passes.

Verify:

```bash
cd fantastic-hook
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
rg -n "sk-|api[_-]?key\\s*[:=]|secret\\s*[:=]|password\\s*[:=]" .
```

## Task Breakdown

- [ ] Task: Build extraction inventory
  - Acceptance: source files are categorized as copy/adapt/replace/exclude
  - Verify: inventory document exists under `fantastic-hook/docs/`
  - Files: planning docs only

- [ ] Task: Create standalone project skeleton
  - Acceptance: `fantastic-hook/` has minimal Next.js app and package scripts
  - Verify: `pnpm dev`
  - Files: project config, app shell

- [ ] Task: Migrate Hook Library data and loader
  - Acceptance: resources load from standalone `data/hook-studio`
  - Verify: resource tests
  - Files: `data/hook-studio`, hook library loader

- [ ] Task: Migrate culture motif system
  - Acceptance: ranking and selection work without VideoSa imports
  - Verify: culture motif tests
  - Files: culture motif resource modules

- [ ] Task: Migrate hook generator v2 core
  - Acceptance: core compiles with standalone imports
  - Verify: hook-generator-v2 tests
  - Files: core modules and tests

- [ ] Task: Replace platform services with adapters
  - Acceptance: no auth/billing/Prisma/video route imports in v1 core path
  - Verify: `rg` platform-coupled import scan
  - Files: runtime adapters, one-shot service

- [ ] Task: Adapt one-shot UI
  - Acceptance: UI generates and displays hook scripts/cards
  - Verify: manual browser check
  - Files: `HookGeneratorOneShotClient`, app page

- [ ] Task: Add standalone API tests
  - Acceptance: API returns script cards and never submits video
  - Verify: Vitest API tests
  - Files: tests and API route

- [ ] Task: Prepare GitHub docs
  - Acceptance: README, architecture docs, env example, gitignore are public-safe
  - Verify: final review and secret scan
  - Files: docs and repo metadata

## Open Questions

1. Should version 1 require a real LLM API key, or should it include a demo/mock mode when no key is configured?
2. Which license should the GitHub repository use?
3. Should product image input in version 1 be URL-only, local preview-only, or omitted until video generation support exists?
4. Should the first release brand be `Fantastic Hook`, `Fantastic Hook Generator`, or keep a neutral `Hook Generator` name?

## GitHub Setup Later

After the folder is reviewed and separated:

```bash
cd fantastic-hook
git init
git remote add origin https://github.com/NBrangerF/thumb-brake-3s.git
git add .
git commit -m "Initial standalone hook generator"
git push -u origin main
```

Do not run these commands until the folder has passed verification and publication review.
