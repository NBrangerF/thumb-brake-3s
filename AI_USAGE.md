# AI Usage Guide

Use this guide when asking Codex, Cursor, Claude Code, or another coding agent to install, run, deploy, or modify Thumb Brake 3s.

The repository is intentionally public-safe: no real keys, no private platform dependencies, and no generated build output should be committed.

## Pasteable install prompt

```text
Please set up this Thumb Brake 3s repository locally.

Requirements:
- Use pnpm.
- Do not print, inspect, or commit plaintext API keys.
- Copy .env.example to .env.local only if .env.local does not exist.
- Help me configure my own OpenAI-compatible LLM values in .env.local.
- Run pnpm install, pnpm test, pnpm lint, pnpm typecheck, and pnpm build.
- Start pnpm dev and tell me the local URL.
- If LLM config is missing, explain that generation requires LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL.
- Do not add fallback generation, auth, billing, database, upload signing, or video job submission.
```

## Pasteable deployment prompt

```text
Please deploy this Thumb Brake 3s Next.js app.

Requirements:
- Use a host that supports Next.js API routes, preferably Vercel.
- Configure LLM_PROVIDER, LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL as server-side environment variables.
- Never expose the API key with NEXT_PUBLIC_.
- Run pnpm test, pnpm lint, pnpm typecheck, and pnpm build before deployment.
- Verify the production deployment is Ready.
- Do not print the API key.
```

## Pasteable project review prompt

```text
Please review this Thumb Brake 3s repository.

Focus on:
- Whether pnpm install && pnpm dev works locally.
- Whether pnpm test, pnpm lint, pnpm typecheck, and pnpm build pass.
- Whether README.md, README.zh-CN.md, README.es.md, DEPLOY.md, AI_USAGE.md, and docs/project-guide.md match the actual code.
- Whether .env.local, real API keys, .DS_Store, node_modules, and .next are excluded.
- Whether the app still requires an LLM and does not silently fallback without a key.
- Whether no auth, billing, database, upload signing, or video job submission code was reintroduced.
```

## Agent checklist

1. Inspect `package.json`.
2. Confirm package manager is `pnpm`.
3. Inspect `.env.example` without printing secrets from local env files.
4. Create `.env.local` from `.env.example` only if needed.
5. Help the user configure:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

6. Never print or summarize the API key value.
7. Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

8. Start the dev server:

```bash
pnpm dev
```

9. Confirm the app opens at:

```text
http://localhost:3000
```

## Important paths for agents

```text
README.md                                      User-facing project overview
README.zh-CN.md                                Chinese overview
README.es.md                                   Spanish overview
DEPLOY.md                                      Deployment guide
AI_USAGE.md                                    Agent install/review/deploy guide
docs/project-guide.md                          Full module and path guide
app/api/hook-generator/one-shot/route.ts       API route
components/hook-generator/HookGeneratorOneShotClient.tsx
                                                Main UI
lib/hook-generator-v2/graph/run-hook-one-shot-graph.ts
                                                Main orchestration function
lib/hook-one-shot.ts                            Hook narrative selection
lib/hook-generator.ts                           LLM script generation
lib/hook-library.ts                             Resource loader/recommender
lib/llm-client.ts                               OpenAI-compatible LLM client
lib/llm-config.ts                               Env-backed LLM config
data/hook-studio/                               Runtime resource library
tests/                                          Vitest suite
```

## Safe key handling

- Do not ask the user to paste keys into chat if a secure setup flow is available.
- Do not run commands that print `.env.local`.
- Do not commit `.env.local`, `.env`, `.env.server`, backup env files, or shell history.
- Do not add keys to README, issues, screenshots, logs, test fixtures, or examples.
- Keep LLM keys server-side only.
- Never use `NEXT_PUBLIC_` for secrets.

## Required LLM behavior

The public app requires a configured LLM.

If configuration is missing, generation must fail with a clear setup error:

```text
LLM_CONFIG_REQUIRED
```

Agents must not reintroduce local fallback script generation as a substitute for user configuration.

## Supported user workflows

### Local user

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then open `http://localhost:3000`.

### Hosted demo user

Open the Vercel deployment and use the web UI.

### API integrator

Call:

```text
POST /api/hook-generator/one-shot
```

### Core integrator

Import:

```ts
import { runHookOneShotGraph } from "@/lib/hook-generator-v2/graph/run-hook-one-shot-graph"
```

## Forbidden additions

Do not add:

- fallback generation without LLM configuration
- VideoSa auth/session code
- VideoSa billing/credit code
- Prisma persistence
- upload signing
- Seedance, Sora, or Veo job submission
- real provider credentials
- generated `.next`
- `node_modules`
- media output generated during local tests
- `.DS_Store`

## Useful verification commands

```bash
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```

## Documentation consistency rule

When code changes affect app behavior, update the matching docs in the same change:

- UI/API behavior: update `README.md`, `README.zh-CN.md`, `README.es.md`, and `docs/project-guide.md`
- deployment or env vars: update `DEPLOY.md`
- agent workflow or safety rules: update `AI_USAGE.md`
- architecture: update `docs/architecture.md`
- README screenshots/videos: update `docs/readme-media-kit.md`
