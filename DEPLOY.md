# Deploy

Thumb Brake 3s is a Next.js app with one static UI route and one dynamic API route:

```text
/                              Static app shell
/api/hook-generator/one-shot   Dynamic script-generation API
```

The API requires an OpenAI-compatible LLM endpoint at runtime. The app can boot without LLM variables, but generation requests fail with `LLM_CONFIG_REQUIRED` until configuration is complete.

## Required environment variables

Set these variables in local, preview, and production environments:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

Optional:

```bash
LLM_VISION_MODEL=
```

`LLM_API_KEY` must be a real server-side key in the deployment environment. Do not commit it and do not expose it with `NEXT_PUBLIC_`.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Production build on a Node server

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

By default, `pnpm start` serves the app at:

```text
http://localhost:3000
```

Use Node.js 24 where possible.

## Vercel deployment

Vercel is the recommended deployment path.

### Import from GitHub

1. Import the repository:

```text
https://github.com/NBrangerF/thumb-brake-3s.git
```

2. Use the default Next.js framework preset.
3. Set the required LLM environment variables in Project Settings.
4. Deploy.

Recommended install command:

```bash
pnpm install --frozen-lockfile
```

Recommended build command:

```bash
pnpm build
```

### Deploy with Vercel CLI

```bash
pnpm dlx vercel link
pnpm dlx vercel env add LLM_PROVIDER production
pnpm dlx vercel env add LLM_BASE_URL production
pnpm dlx vercel env add LLM_MODEL production
pnpm dlx vercel env add LLM_API_KEY production --sensitive
pnpm dlx vercel deploy --prod
```

Repeat the env setup for `preview` if pull request or branch previews should generate scripts.

## Current hosted demo

[https://thumb-brake-3s.vercel.app](https://thumb-brake-3s.vercel.app)

Project name:

```text
thumb-brake-3s
```

## Other hosting providers

Any host that supports standard Next.js server routes can run this project.

The host must support:

- Node.js runtime
- server-side environment variables
- dynamic API routes
- outbound HTTPS requests to the configured LLM endpoint

Static-only hosting such as GitHub Pages is not enough because the app needs a server-side API route to protect the LLM key.

## Release verification

Run before every deploy:

```bash
pnpm install
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

Expected result:

- no `.DS_Store`
- no real secrets
- no private platform imports
- tests, lint, typecheck, and build all pass

## Common failures

### `LLM_CONFIG_REQUIRED`

The app is missing one or more of:

```text
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

Fix by setting the variables locally or in your hosting provider.

### `LLM request failed`

Check that:

- `LLM_BASE_URL` points to an OpenAI-compatible `/v1` endpoint
- the selected model exists
- the key has access to the model
- the host can make outbound HTTPS requests

### `LLM returned empty content`

The provider returned an empty assistant message. Try another model or inspect provider-side logs.

### Build fails on Node version

Use Node.js 24, then reinstall dependencies:

```bash
rm -rf node_modules
pnpm install
pnpm build
```

### GitHub Pages does not work

GitHub Pages is static hosting. It cannot safely run `/api/hook-generator/one-shot` or protect server-side keys. Use Vercel or another server-capable host.
