# Fantastic Hook Architecture

Fantastic Hook is a standalone extraction of the one-shot hook generation capability.

## Layers

```text
UI
  components/hook-generator/HookGeneratorOneShotClient.tsx

API
  app/api/hook-generator/one-shot/route.ts

Application/Core
  lib/hook-generator-v2/graph/run-hook-one-shot-graph.ts
  lib/hook-one-shot.ts
  lib/hook-generator.ts

Resources
  data/hook-studio/**
  lib/culture-motif-resources/**

Adapters
  lib/llm-client.ts
  lib/llm-config.ts
```

## Version 1 Flow

1. User enters product title, optional product image URL, product hints, and hook intent.
2. UI posts to `/api/hook-generator/one-shot`.
3. API validates request with Zod.
4. Core draws three differentiated hook narratives.
5. Resource injector attaches Hook Library and culture motif resources.
6. Required LLM configuration generates hook scripts.
7. Deterministic validator repairs structural issues.
8. Prompt compiler prepares a future video prompt.
9. API returns script cards and prompt artifacts.

## Deliberate Boundaries

The standalone core must not import:

```text
@/lib/auth
@/lib/db
@/lib/company-scope
@/lib/platform-pricing
@/lib/cost-feature-gates
@/app/api/seedance-pipeline
@/app/api/model-workbench
```

Version 1 never submits video generation jobs. Provider integration should be added later through explicit adapters.
