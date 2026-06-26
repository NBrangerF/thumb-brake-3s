# Architecture

Thumb Brake 3s is a standalone, script-first extraction of a short-video product hook generator.

The architecture is intentionally small: one web workspace, one API route, one generation graph, one resource library, and one OpenAI-compatible LLM adapter. Version 1 prepares hook scripts and future video prompts; it does not submit video jobs.

For the full file-by-file guide, see [project-guide.md](./project-guide.md).

## Design goals

- **Script-first**: generate hook scripts and prompt artifacts before adding video providers.
- **Public-repo safe**: no auth, billing, database, cloud upload signing, or production credentials.
- **Adapter-ready**: keep provider-specific behavior behind explicit adapters.
- **Resource-backed**: use Hook Studio resources, pattern cards, few-shots, constraints, and validators instead of plain prompt-only generation.
- **3s-oriented**: structure outputs around 0–1s stop, 1–3s relevance, and 3–7s product bridge.

## Layers

```text
UI
  app/page.tsx
  components/hook-generator/HookGeneratorOneShotClient.tsx

API
  app/api/hook-generator/one-shot/route.ts

Application / Core
  lib/hook-generator-v2/graph/run-hook-one-shot-graph.ts
  lib/hook-one-shot.ts
  lib/hook-generator.ts

Resources
  data/hook-studio/**
  lib/hook-generator-v2/resources/**
  lib/culture-motif-resources/**

Quality / Compilation
  lib/hook-generator-v2/quality/**
  lib/hook-generator-v2/script-asset/**
  lib/hook-generator-v2/compiler/**

Adapters
  lib/llm-client.ts
  lib/llm-config.ts
```

## Runtime flow

1. User enters product title, optional local image, category, creative intent, and duration.
2. The UI posts to `/api/hook-generator/one-shot`.
3. The API validates the request with Zod.
4. The graph resolves LLM configuration.
5. The graph builds a product contract and script-only video settings.
6. Hook narrative selection draws three differentiated variants.
7. Resource injection attaches pattern cards, P0 resources, culture motifs, constraints, and examples.
8. The LLM expands the user intent into a richer shooting contract.
9. The LLM generates structured hook scripts.
10. Deterministic validation and repair normalize structure.
11. The compiler prepares a future video prompt.
12. The API returns hook cards, script assets, prompt artifacts, and trace draft data.

## Deliberate boundaries

The standalone app must not import:

```text
@/lib/auth
@/lib/db
@/lib/company-scope
@/lib/platform-pricing
@/lib/cost-feature-gates
@/app/api/seedance-pipeline
@/app/api/model-workbench
```

Version 1 must not submit Seedance, Sora, Veo, or other video-generation jobs. Future provider support should be added through explicit adapters.

## Runtime requirements

Generation requires server-side LLM configuration:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

There is no no-key fallback generator. Missing configuration should produce `LLM_CONFIG_REQUIRED`.

## Public safety checklist

Before publishing:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```
