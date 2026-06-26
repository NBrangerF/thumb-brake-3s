# Thumb Brake 3s Project Guide

This guide explains every major module, public path, runtime resource, and supported usage mode in the repository.

## Product Scope

Thumb Brake 3s is a script-first Hook generator for short-form ecommerce videos.

It creates three alternative opening concepts for a product and prepares prompt artifacts that can later be copied into a video generation workflow.

It does not create final videos by itself. It also does not include user accounts, billing, cloud storage, or database persistence.

## Public Documentation And Media Surface

These files shape what users see first on GitHub:

```text
README.md                 English product overview and developer entrypoint
README.zh-CN.md           Chinese product overview
README.es.md              Spanish product overview
DEPLOY.md                 Deployment guide
AI_USAGE.md               AI-agent install/review/deploy guide
docs/project-guide.md     Full module and path guide
docs/architecture.md      Layered architecture summary
docs/hook-theory.md       English theory and creative framework
docs/hook-theory.zh-CN.md Chinese theory and creative framework
docs/hook-theory.es.md    Spanish theory and creative framework
docs/video-cases.md       Public video case gallery
docs/readme-media-kit.md  README media asset guidance
```

The README media assets live under:

```text
public/readme/hero.png
public/readme/banner-en.png
public/readme/banner-zh.png
public/readme/videos/*.mp4
public/readme/video-posters/*.png
```

The six videos in `public/readme/videos/` are public-facing case examples. They are used to show first-second stop signals, scene evidence, product-action bridges, and proof moments. They are not treated as generated-output guarantees.

## Supported Usage Modes

### Hosted Demo

Use the public Vercel deployment:

[https://thumb-brake-3s.vercel.app](https://thumb-brake-3s.vercel.app)

The demo is backed by server-side environment variables. No API key is exposed to the browser.

### Local Web App

Use this when you want to run the complete UI and API locally.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then open:

```text
http://localhost:3000
```

### Self-Hosted Web App

Deploy to Vercel, Netlify with a Next.js adapter, or a Node server that can run `next start`.

The required runtime variables are:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

### API Integration

Call the built-in API route:

```text
POST /api/hook-generator/one-shot
```

This is the easiest way to integrate the generator into another frontend.

### Code Integration

Import the core graph in a server-side TypeScript environment:

```ts
import { runHookOneShotGraph } from "@/lib/hook-generator-v2/graph/run-hook-one-shot-graph"
```

This is useful if you want to embed the generator in another Next.js app or service.

## User-Facing Web App

### `app/page.tsx`

Renders the single workspace screen by mounting:

```ts
HookGeneratorOneShotClient
```

### `app/layout.tsx`

Defines the root HTML layout, metadata, and global CSS import.

### `app/globals.css`

Contains the visual system for the app: dark/purple interface, liquid glass surfaces, inputs, buttons, result cards, and responsive layout behavior.

### `components/hook-generator/HookGeneratorOneShotClient.tsx`

The main client UI. It manages:

- Product title input
- Product category input
- Local image upload preview
- Intent selection
- Duration settings
- Request submission
- Error and success states
- Result card rendering
- Copying the full future video prompt

The uploaded product image is converted into a local reference string for prompt identity handling. The current app does not upload the file to a storage provider and does not write it to the repository or local filesystem.

## API Surface

### Route

```text
app/api/hook-generator/one-shot/route.ts
```

### Method

```text
POST /api/hook-generator/one-shot
```

### Request Shape

```ts
{
  productImage?: string
  productTitle: string
  intent: "audience_first" | "pain_first" | "creative_first" | "offer_first"
  intentText?: string
  analysisHints?: {
    productCategory?: string | null
    coreSellingPoints?: string[]
    targetAudience?: string[]
    painPoints?: string[]
    visualFacts?: string[]
    proofPoints?: string[]
  }
  videoDuration?: number
  videoRatio?: "9:16" | "16:9"
  generateAudio?: boolean
}
```

Current UI sends `productTitle`, `productImage`, `intent`, `intentText`, `analysisHints.productCategory`, `videoDuration`, `videoRatio`, and `generateAudio`.

### Response Shape

The route returns:

```ts
{
  batchId: string
  runs: Array<{
    clientVideoId: string
    status: string
    currentStage: string
    progress: number
    card: {
      title: string
      description: string
      strategyLabel: string
      summary?: string
      hookMechanism?: string
    }
    script: {
      hookSummary: string
      visualDescription: string
      visualStyle: string
      script: string
      soundDesign: string
      textOverlay: string[]
      shotTiming: Array<{
        timeRange: string
        visual: string
        script?: string
        textOverlay?: string
      }>
      productBridge: string
      videoPrompt: string
      firstFramePrompt: string
    }
    selectedHook: object
    selectedCultureBorrowing: object | null
    futureVideoPrompt: string
    firstFramePrompt?: string
    source: "llm" | "fallback"
  }>
  trace: object | null
}
```

`source` is currently expected to be `llm` in normal production use. The project intentionally does not provide a no-key fallback generation mode.

### Common API Errors

`INVALID_JSON`

The request body is not valid JSON.

`INVALID_PARAMS`

The request body failed validation.

`LLM_CONFIG_REQUIRED`

The runtime is missing one or more of `LLM_BASE_URL`, `LLM_API_KEY`, or `LLM_MODEL`.

`HOOK_SCRIPT_GENERATION_FAILED`

The generation graph failed during LLM generation, validation, repair, or prompt compilation.

## Core Runtime Pipeline

### `lib/hook-generator-v2/graph/run-hook-one-shot-graph.ts`

Main orchestration function.

Responsibilities:

- Resolve script-only video settings
- Validate LLM configuration
- Normalize local image references
- Build product brief
- Draw three Hook narratives
- Inject resource bundles
- Expand user intent with the LLM
- Generate Hook scripts with the LLM
- Convert legacy script output into structured script assets
- Run deterministic validation and repair
- Compile future video prompts
- Build trace output

### `lib/hook-generator-v2/graph/build-hook-run-state.ts`

Builds the initial `HookRunState`, including request IDs, batch IDs, product brief, video settings, selected narratives, and variant shells.

### `lib/hook-generator-v2/graph/types.ts`

Defines the runtime graph types:

- `HookOneShotRequest`
- `HookOneShotVideoSettings`
- `HookRunPolicy`
- `HookRunState`
- `VariantState`
- validation, repair, trace, and video job state types

### `lib/hook-generator-v2/graph/feature-flags.ts`

Controls optional experimental paths. The current public app runs the stable script-first path.

### `lib/hook-generator-v2/graph/primary-prompt-pipeline.ts`

Contains prompt-pipeline helpers used by tests and optional feature-flagged paths.

## Hook Selection And Product Understanding

### `lib/hook-one-shot.ts`

Handles one-shot Hook selection.

Important concepts:

- `HookOneShotIntent`: `audience_first`, `pain_first`, `creative_first`, `offer_first`
- `HookNarrativeRole`: `intent-direct`, `contrast`, `culture-fused`
- weighted pattern-card selection by intent
- diversity control across Hook types and subtypes
- special weighting for audience/scene callout patterns
- culture borrowing selection for culture-fused variants

### `lib/hook-generator.ts`

Generates the LLM script and enforces product identity.

Responsibilities:

- Product identity lock
- Category-specific product hints
- Visual identity and forbidden substitution rules
- Product bridge text
- Voiceover preference handling
- LLM prompt construction for script generation
- Legacy `HookScriptResult` output shape

### `lib/hook-library.ts`

Loads and recommends Hook Studio resources from `data/hook-studio`.

It provides:

- pattern-card loading
- category playbook access
- Hook recommendation cards
- mood definitions
- coverage/review helpers
- culture borrowing resource types

## Resource Injection

### `lib/hook-generator-v2/resources/p0-resource-library.ts`

In-code P0 resource library used during generation. It includes:

- audience/situation patterns
- attention micro-patterns
- event primitives
- product bridge roles
- proof visualization cards
- shot cards
- constraint rules
- failure modes
- gold Hook examples

### `lib/hook-generator-v2/resources/resource-injector.ts`

Attaches bounded resource bundles to each selected Hook variant.

The generated bundle includes:

- runtime product contract
- audience situations
- attention micro-pattern
- event candidates
- bridge candidates
- proof candidates
- culture motif
- shot candidates
- constraints
- failure warnings
- examples
- resource IDs and library references

### `lib/hook-generator-v2/resources/resource-graph.ts`

Defines relationships between resource types and supports resource lookup.

### `lib/hook-generator-v2/resources/resource-review.ts`

Provides review utilities for checking resource coverage and integrity.

### `lib/hook-generator-v2/resources/culture-motif-library.ts`

Connects runtime generation resources with the culture motif system.

### `lib/hook-generator-v2/resources/types.ts`

Defines the data structures used by resource injection.

## Script Asset Layer

### `lib/hook-generator-v2/script-asset/build-script-creative-spec.ts`

Turns selected resources, user intent, product contract, and Hook pattern into a structured creative spec.

The creative spec becomes the contract that script generation and prompt compilation must obey.

### `lib/hook-generator-v2/script-asset/hook-script-asset-schema.ts`

Schema for structured Hook script assets.

### `lib/hook-generator-v2/script-asset/legacy-adapter.ts`

Converts the older `HookScriptResult` format into the newer `HookScriptAsset` format, then converts back for API compatibility.

### `lib/hook-generator-v2/script-asset/native-creative-director.ts`

Experimental/native script asset direction path.

### `lib/hook-generator-v2/script-asset/types.ts`

Types for structured script assets and creative specs.

## Quality And Repair

### `lib/hook-generator-v2/quality/deterministic-validator.ts`

Checks generated Hook assets for structural and creative rule violations.

### `lib/hook-generator-v2/quality/targeted-repair.ts`

Applies deterministic repairs and returns:

- repaired script asset
- quality gate status
- repair history
- validation issues

This keeps output structured even when LLM text is uneven.

## Prompt Compilation

### `lib/hook-generator-v2/compiler/compile-hook-video-prompt.ts`

Compiles the final future video prompt.

Current production path uses a Seedance-style prompt shape by default, but the compiler has branches for model-family-specific formats:

- Seedance
- Sora
- Veo

The app does not submit to those providers. It only prepares prompt text.

### `lib/hook-generator-v2/compiler/types.ts`

Defines compiled prompt output, sections, input image references, model family, and provider metadata.

## Intent Expansion

### `lib/hook-generator-v2/intent-expansion/user-intent-expansion.ts`

Uses the LLM to turn a short user intent into a richer semantic contract.

It extracts:

- user frame summary
- key concepts
- event relation
- observable evidence
- action primitives
- conflict source
- opening action
- open loop
- product exposure policy

This is why short inputs such as "武侠画风，穿上这个鞋，轻功都变好了" can become concrete shot logic instead of being copied as plain text.

## Evaluation And Trace

### `lib/hook-generator-v2/eval/*`

Evaluation utilities and test fixtures for judging generated Hook traces, creative tension, culture use, and failure types.

Important files:

- `evaluate-hook-generation-trace.ts`
- `failure-taxonomy.ts`
- `golden-cases.ts`
- `tension-culture-evaluator.ts`
- `types.ts`

### `lib/hook-generator-v2/traces/*`

Trace builders and persistence hooks.

Important files:

- `build-hook-trace-draft.ts`
- `build-hook-trace-review-packet.ts`
- `persist-hook-trace.ts`
- `types.ts`

The public app returns trace draft data but does not persist traces unless future feature flags and storage are added.

## LLM Adapter

### `lib/llm-config.ts`

Reads server-side LLM configuration from environment variables.

Supported variables:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
LLM_VISION_MODEL=
```

`LLM_VISION_MODEL` is optional and not required by the current UI path.

### `lib/llm-client.ts`

Small OpenAI-compatible chat completions client.

It calls:

```text
{LLM_BASE_URL}/chat/completions
```

It supports:

- system/user/assistant messages
- model override
- temperature
- max token control
- timeout
- retry count
- token usage reading when the provider returns usage data

## Culture Motif Resources

### `lib/culture-motif-resources/index.ts`

Exports public culture motif functions and types.

### `lib/culture-motif-resources/library.ts`

Defines the in-code culture motif library.

### `lib/culture-motif-resources/motif-system.ts`

Ranks and selects culture borrowing templates for selected Hook patterns.

### `lib/culture-motif-resources/types.ts`

Types for motif families, visual render profiles, concrete motifs, and culture borrowing logic.

## Video Model Capability Types

### `lib/video-generation/model-capabilities.ts`

Defines model/provider capability types. The current repo uses these types to shape prompt compilation and future extensibility.

It does not submit real video generation jobs.

## Hook Studio Data Resources

### `data/hook-studio/HOOK_RESOURCE_CATALOG.json`

Public inventory of the resource package.

It records:

- package version
- generated date
- resource file list
- category playbooks
- coverage targets
- research/source metadata
- storage policy

This file is useful for humans and tests. Runtime modules primarily read the actual JSON/JSONL resources.

### `data/hook-studio/resources/pattern_cards/v0_pattern_cards.jsonl`

Original Hook pattern-card library.

### `data/hook-studio/resources/pattern_cards/v1_2026_pattern_expansion.balanced.jsonl`

Balanced 2026 expansion across H1-H7 Hook types.

### `data/hook-studio/resources/pattern_cards/product_independent_pattern_cards.jsonl`

Product-independent patterns for attention-first openings that do not need immediate product display.

### `data/hook-studio/resources/few_shots/hook-generation-few-shots.v1-balanced.json`

Balanced few-shot references across H1-H7.

### `data/hook-studio/resources/category_playbooks/*.json`

Category playbooks for product verticals:

- ai_tools
- beauty
- cleaning
- education
- food_beverage
- kitchen_tools
- mother_baby
- personal_care
- pet
- sports_fitness
- storage_home
- womenswear

### `data/hook-studio/resources/hook_mood_library.json`

Defines Hook moods, commerce roles, arousal profiles, product bridge logic, preferred generation modes, variants, and boundaries.

### `data/hook-studio/resources/reference_tag_dictionary.json`

Shared tag dictionary for resource classification.

### `data/hook-studio/resources/trend_observations/v0_trend_observations.jsonl`

Distilled observations from short-video creative patterns.

### `data/hook-studio/culture_symbol_entries.jsonl`

Reusable cultural symbol entries. These support culture borrowing without copying exact IP, exact creator lines, raw transcripts, usernames, or downloaded ad assets.

### `data/hook-studio/culture_hook_templates.jsonl`

Culture borrowing templates that connect symbol entries to Hook structures.

## Tests

Tests live in:

```text
tests/
```

Important coverage areas:

- API route validation
- one-shot runner
- graph state
- feature flags
- resource graph
- resource injector
- resource review
- audience scene callout behavior
- balanced resource library
- user intent expansion
- deterministic validation
- targeted repair
- script asset schema and adapter
- prompt compiler
- culture motif system
- trace draft/eval/persistence

Run:

```bash
pnpm test
```

## Config Files

### `package.json`

Defines scripts, package metadata, Node/pnpm engine requirements, and dependencies.

### `pnpm-lock.yaml`

Dependency lockfile. Keep it committed.

### `tsconfig.json`

TypeScript configuration.

### `eslint.config.mjs`

ESLint configuration.

### `vitest.config.ts`

Vitest configuration.

### `next.config.ts`

Next.js configuration.

### `postcss.config.mjs`

PostCSS/Tailwind configuration.

### `public/readme/*`

Static assets used by the GitHub README and documentation:

- hero screenshot
- English and Chinese README banners
- six example MP4 clips
- generated poster images for those clips

### `.env.example`

Public template for required environment variables. It must not contain real secrets.

### `.gitignore`

Excludes dependencies, build output, env files, Vercel local project metadata, `.DS_Store`, and TypeScript build info.

### `.vercelignore`

Prevents local env files, caches, and dependency folders from being uploaded by Vercel CLI deployments.

## Deployment Paths

### Vercel

Recommended.

1. Import the GitHub repo.
2. Use the default Next.js preset.
3. Set LLM environment variables.
4. Deploy.

### Node Server

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

### Local Development

```bash
pnpm install
pnpm dev
```

## Security Boundaries

The public repo must not contain:

- real LLM keys
- `.env.local`
- `.env`
- `.DS_Store`
- `.next`
- `node_modules`
- private auth/session code
- billing/credit code
- database credentials
- platform-private imports

Safe verification:

```bash
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```

## Current Limits

- Requires an LLM key.
- Does not generate final videos.
- Does not store user projects.
- Does not upload product images to cloud storage.
- Does not authenticate users.
- Does not meter usage.
- Does not provide admin tools.
- Does not include custom domains beyond the Vercel deployment.

## Recommended Release Checklist

Before sharing or publishing:

```bash
pnpm install
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Then confirm no unwanted local artifacts:

```bash
find . -name .DS_Store -print
git status --short
```
