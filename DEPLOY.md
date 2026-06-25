# Deploy

Fantastic Hook is a Next.js app that requires an OpenAI-compatible LLM endpoint at runtime.

## Environment Variables

Set these variables in every local, preview, and production environment:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

`LLM_API_KEY` must be a real key in the deployment environment. Do not commit it to the repository.

## Local Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

If the LLM variables are missing, the app starts but generation requests return `LLM_CONFIG_REQUIRED`.

## Production Build

```bash
pnpm install
pnpm build
pnpm start
```

By default, `pnpm start` serves the app at `http://localhost:3000`.

## Vercel

1. Import `https://github.com/NBrangerF/thumb-brake-3s.git`.
2. Use the default Next.js framework preset.
3. Set the required LLM environment variables in Project Settings.
4. Deploy.

Recommended build command:

```bash
pnpm build
```

Recommended install command:

```bash
pnpm install --frozen-lockfile
```

## Node Server

Use Node.js 24 where possible.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

## Common Failures

`LLM_CONFIG_REQUIRED`

The app is missing one or more of `LLM_BASE_URL`, `LLM_API_KEY`, or `LLM_MODEL`.

`LLM request failed`

Check that `LLM_BASE_URL` points to an OpenAI-compatible `/v1` endpoint and that the key has access to the selected model.

`LLM returned empty content`

The provider returned an empty assistant message. Try another model or inspect provider-side logs.

Build fails on Node version

Use Node.js 24, then reinstall dependencies:

```bash
rm -rf node_modules
pnpm install
pnpm build
```

## Release Verification

Run before every deploy:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Run before publishing the repository:

```bash
find . -name .DS_Store -print
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
```
