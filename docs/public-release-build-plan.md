# Public Release Build Plan

## Goal

Prepare this project as a shareable GitHub repository that other users can clone, configure with their own LLM endpoint, and run locally.

Target repository:

```bash
https://github.com/NBrangerF/thumb-brake-3s.git
```

The first public version is a local-first Hook script generator. It should provide a lightweight frontend page for generating short-video product Hook scripts through a required LLM configuration.

## Product Scope

Included in the public release:

- Local Next.js app runnable with `pnpm install && pnpm dev`.
- Lightweight frontend Hook Generator page as the first screen.
- OpenAI-compatible LLM configuration through environment variables.
- Script card output for product Hook ideas, shot timing, sound direction, product bridge, and future video prompt draft.
- Public-safe docs for local install, deployment, and AI-assisted setup.
- Core test, lint, typecheck, and production build verification.

Excluded from the public release:

- Example prompt packs or template folders.
- Built-in fallback script generation.
- Real video generation job submission.
- Login, account, billing, credit, or database persistence.
- Private VideoSa platform services or provider credentials.
- Internal deployment files, private env files, generated media, `.next`, `node_modules`, or `.DS_Store`.

## Release Acceptance Criteria

The release is ready only when all of these are true:

- `pnpm install` succeeds from a clean checkout.
- `pnpm dev` starts the app locally.
- `pnpm test` passes.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm build` passes.
- `README.md` is complete and points to `thumb-brake-3s.git`.
- `DEPLOY.md` is complete.
- `AI_USAGE.md` is complete.
- `.env.example` contains placeholders only.
- No real API keys or secrets are present.
- No private platform imports remain in the public runtime path.
- No `.DS_Store` files remain in the repository.
- Missing LLM configuration produces a clear setup error instead of generating fallback output.

## Required LLM Behavior

The public release must require an LLM.

Earlier extraction builds could generate local fallback scripts when no key was configured. Public release behavior must keep that path disabled.

Expected behavior:

1. App reads `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`.
2. API validates that all required LLM settings are present.
3. If configuration is missing, API returns a clear `LLM_CONFIG_REQUIRED` error.
4. UI shows a concise setup message and does not present generated fallback content.
5. When configuration is present, script generation uses the OpenAI-compatible chat completions endpoint.

Suggested env contract:

```bash
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=
```

Do not commit `.env.local` or any real key. AI tools may help users create or configure their own key, but plaintext secrets must never be printed in docs, logs, commits, or issue templates.

## Phase 1: Repository Cleanup

Tasks:

- Initialize git if the directory is still not a repository.
- Set origin to `https://github.com/NBrangerF/thumb-brake-3s.git`.
- Delete `.DS_Store` files from the working tree.
- Keep `.gitignore` covering env files, build outputs, dependency folders, and OS metadata.
- Update package metadata for public repository use.
- Add a Node version policy through `engines` and/or `.nvmrc`.
- Decide and add a license.

Verification:

```bash
find . -name .DS_Store -print
git status --short
```

Expected result:

- No `.DS_Store` output.
- Only intentional project files appear in git status.

## Phase 2: Remove Fallback Runtime Path

Tasks:

- Change the one-shot API path so missing LLM config fails fast.
- Remove user-facing labels that imply local fallback output is acceptable.
- Keep deterministic validators and repair logic, because they validate LLM output.
- Keep tests that cover core deterministic behavior where useful, but add/update tests for required LLM configuration.
- Ensure API errors are clear enough for frontend and AI-assisted install flows.

Verification:

```bash
pnpm test
pnpm typecheck
```

Required test coverage:

- Missing `LLM_API_KEY` returns `LLM_CONFIG_REQUIRED`.
- Missing `LLM_BASE_URL` returns `LLM_CONFIG_REQUIRED`.
- Missing `LLM_MODEL` returns `LLM_CONFIG_REQUIRED`.
- Configured LLM path can be tested with a mocked client.
- API does not generate fallback script cards when config is missing.

## Phase 3: Public Documentation

### README.md

README should cover:

- What the project does.
- What it does not do.
- Requirements: Node, pnpm, LLM endpoint.
- Quick start:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

- Required LLM env variables.
- Available commands.
- Project structure.
- Verification checklist.
- GitHub repository URL.

Remove claims that deterministic fallback is a supported public feature.

### DEPLOY.md

DEPLOY should cover:

- Local development.
- Production build and start:

```bash
pnpm build
pnpm start
```

- Vercel deployment notes.
- Netlify or Node server notes if applicable.
- Required environment variables.
- Common deployment failures:
  - missing LLM key
  - wrong base URL
  - unsupported model
  - Node version mismatch

### AI_USAGE.md

AI_USAGE should cover how Codex, Cursor, Claude Code, or another coding agent should help a user install and run the project.

It should include:

- A short AI installation prompt users can paste into their coding agent.
- Required checks before running:
  - inspect package manager
  - install dependencies
  - create ignored `.env.local` from `.env.example`
  - help user configure their own LLM key without exposing it
  - run test/lint/typecheck/build
  - start dev server
- Safety rules:
  - never print API keys
  - never commit `.env.local`
  - never add fallback generation as a substitute for LLM setup
  - never add VideoSa billing/auth/database/provider internals

## Phase 4: Platform Boundary Review

Tasks:

- Scan for private platform imports.
- Confirm no auth, database, billing, upload signing, or video submission code is in the public runtime path.
- Review remaining `seedance`, `sora`, and `veo` names.
- Keep future video prompt compilation only if docs clearly describe it as prompt text, not provider submission.
- Rename or document remaining provider-specific compiler internals if they cause public confusion.

Verification:

```bash
rg -n "@/lib/(auth|db|company-scope|platform-pricing|cost-feature)|@/app/api/(seedance|model-workbench)" .
rg -n "billing|credit|Prisma|prisma|login|session" app components lib
```

Expected result:

- No private platform imports.
- Any remaining provider words are compiler terminology only, not API submission paths.

## Phase 5: Secret And Publication Safety

Tasks:

- Ensure `.env.example` uses placeholders only.
- Ensure no `.env.local`, `.env`, `.env.server`, or backup env files are tracked.
- Run a secret scan.
- Confirm docs never show real keys.
- Confirm generated files are not tracked.

Verification:

```bash
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
git status --short
```

Expected result:

- Only safe placeholder references appear.
- No generated build output or dependency folder is staged.

## Phase 6: Final Verification Gate

Run the complete release gate from a clean install state:

```bash
pnpm install
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Then start the app:

```bash
pnpm dev
```

Manual checks:

- App opens at `http://localhost:3000`.
- Missing LLM config shows setup guidance, not generated fallback scripts.
- Valid LLM config generates three Hook script cards.
- Copy action works.
- Error messages are readable and do not leak secrets.

## Phase 7: GitHub Publish

After all gates pass:

```bash
git init
git remote add origin https://github.com/NBrangerF/thumb-brake-3s.git
git add .
git commit -m "docs: prepare public release plan"
git branch -M main
git push -u origin main
```

If git is already initialized, skip `git init` and only correct the remote if needed.

Before pushing, confirm:

- No `.DS_Store`.
- No secrets.
- No `.env.local`.
- No `node_modules`.
- No `.next`.
- No unsupported fallback behavior.

## Suggested Work Order

1. Clean repository metadata and remove `.DS_Store`.
2. Update LLM config behavior to require a configured provider.
3. Add or update tests for required LLM configuration.
4. Rewrite README.
5. Add DEPLOY.
6. Add AI_USAGE.
7. Run full verification.
8. Initialize git and push to `thumb-brake-3s.git`.

## Execution Status

- README points to `thumb-brake-3s.git`.
- Runtime requires LLM configuration before generating Hook scripts.
- `DEPLOY.md` exists.
- `AI_USAGE.md` exists.
- MIT license exists.
- `.DS_Store` files have been removed from the working tree.
- Git initialization and first commit remain the final publishing step.
