# AI Usage Guide

Use this guide when asking Codex, Cursor, Claude Code, or another coding agent to install, run, or modify Fantastic Hook.

## Pasteable Install Prompt

```text
Please set up this Fantastic Hook repository locally.

Requirements:
- Use pnpm.
- Do not print, inspect, or commit plaintext API keys.
- Copy .env.example to .env.local if needed.
- Help me configure my own OpenAI-compatible LLM values in .env.local.
- Run pnpm install, pnpm test, pnpm lint, pnpm typecheck, and pnpm build.
- Start pnpm dev and tell me the local URL.
- If LLM config is missing, explain that generation requires LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL.
- Do not add fallback generation, auth, billing, database, upload signing, or video job submission.
```

## Agent Checklist

1. Inspect the package manager and scripts in `package.json`.
2. Install dependencies with `pnpm install`.
3. Create `.env.local` from `.env.example` only if it does not exist.
4. Help the user configure:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

5. Never print or summarize the API key value.
6. Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

7. Start the dev server:

```bash
pnpm dev
```

8. Confirm the app opens at `http://localhost:3000`.

## Safe Key Handling

- Do not ask the user to paste keys into chat.
- Do not run commands that print `.env.local`.
- Do not commit `.env.local`, `.env`, `.env.server`, or backup env files.
- Do not add keys to README, issues, screenshots, logs, or test fixtures.
- Prefer secure platform-specific key setup flows when available.

## Required LLM Behavior

The public app requires a configured LLM. If configuration is missing, generation must fail with a clear setup error.

Agents must not reintroduce local fallback script generation as a substitute for user configuration.

## Forbidden Additions

Do not add:

- VideoSa auth/session code
- VideoSa billing/credit code
- Prisma persistence
- Upload signing
- Seedance, Sora, or Veo job submission
- Real provider credentials
- Generated `.next`, `node_modules`, media output, or `.DS_Store`

## Useful Verification Commands

```bash
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```
