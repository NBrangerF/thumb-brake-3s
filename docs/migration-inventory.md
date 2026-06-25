# Migration Inventory

## Copied

```text
data/hook-studio/**
lib/hook-generator-v2/**
lib/culture-motif-resources/**
lib/hook-one-shot.ts
lib/hook-generator.ts
lib/hook-library.ts
lib/video-generation/model-capabilities.ts
tests/lib/hook-generator-v2/**
```

## Adapted

```text
components/hook-generator/HookGeneratorOneShotClient.tsx
app/api/hook-generator/one-shot/route.ts
lib/hook-generator-v2/graph/run-hook-one-shot-graph.ts
lib/hook-generator-v2/traces/persist-hook-trace.ts
lib/hook-generator.ts
lib/hook-one-shot.ts
```

## Replaced

```text
lib/llm-client.ts
lib/llm-config.ts
lib/utils.ts
```

## Excluded

```text
VideoSa auth/session code
VideoSa billing/credit code
Prisma schema and migrations
OSS upload signing
Seedance pipeline submission
Model workbench image/video routes
.env.local
.env.server
.env.server.bak-*
.next
node_modules
private generated media
```

## Safety Check

Before publishing:

```bash
rg -n "sk-|api[_-]?key\\s*[:=]|secret\\s*[:=]|password\\s*[:=]" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```
