# Fantastic Hook

Fantastic Hook is a local-first, LLM-powered short-video product Hook script generator.

It turns product context, audience signals, pain points, and a creative intent into three differentiated Hook script cards for ecommerce short video ideation.

Version 0.1 generates script cards and future video prompt drafts only. It does not submit video generation jobs, charge credits, require login, or persist project data to a database.

## Requirements

- Node.js 24 recommended
- pnpm 10+
- An OpenAI-compatible chat completions endpoint

The app requires LLM configuration. It does not generate fallback scripts when no key is configured.

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

Configure `.env.local` before generating scripts:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=your-chat-model
```

Never commit `.env.local` or any real API key.

## What It Generates

- Stop-scroll Hook concept
- First-second visual idea
- Short script or dialogue
- Shot timing
- Sound direction
- Product bridge
- Future video prompt draft

## Commands

```bash
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

## Verification Gate

Before publishing or deploying, run:

```bash
pnpm install
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Also confirm:

```bash
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```

Expected result: no `.DS_Store`, no real secrets, and no private platform imports.

## Project Structure

```text
app/                         Next.js app and API routes
components/hook-generator/   One-shot Hook Generator UI
data/hook-studio/            Hook Library resources
lib/hook-generator-v2/       Hook graph, resources, validators, compiler
lib/culture-motif-resources/ Culture motif ranking resources
lib/llm-client.ts            OpenAI-compatible LLM client
lib/llm-config.ts            Env-backed LLM config
tests/lib/hook-generator-v2/ Core tests
docs/                        Architecture and release planning notes
```

## Runtime Flow

1. User enters product title, optional product image URL, product hints, and Hook intent.
2. UI posts to `/api/hook-generator/one-shot`.
3. API validates request and LLM configuration.
4. Core draws three differentiated Hook narratives.
5. Resource injector attaches Hook Library and culture motif resources.
6. LLM generates Hook scripts.
7. Deterministic validator repairs structural issues.
8. Prompt compiler prepares a future video prompt draft.
9. API returns script cards and prompt artifacts.

## Included

- Standalone one-shot Hook script generation
- Hook Library resources
- Culture motif resources
- Required OpenAI-compatible LLM script generation
- Future video prompt compilation
- Local development and production build support

## Excluded

- Built-in fallback generation
- VideoSa billing or credits
- Login or accounts
- Prisma persistence
- OSS upload signing
- Seedance, Sora, or Veo job submission
- Production env files

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](DEPLOY.md)
- [AI usage guide](AI_USAGE.md)
- [Public release build plan](docs/public-release-build-plan.md)

## Repository

GitHub: `https://github.com/NBrangerF/thumb-brake-3s.git`

## License

MIT
