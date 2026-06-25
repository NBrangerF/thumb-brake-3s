# Security

## Secrets

Do not commit API keys, provider tokens, `.env.local`, `.env`, `.env.server`, or backup env files.

The app requires an OpenAI-compatible LLM endpoint. Configure credentials only in local or deployment environment variables.

## Supported Checks

Before publishing, run:

```bash
rg -n "sk-|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|BEGIN [A-Z ]*PRIVATE KEY" .
find . -name .DS_Store -print
```

Expected result: no real secrets and no `.DS_Store` files.

## Platform Boundaries

The public runtime must not include private auth, billing, database, upload signing, or video job submission services.

Report security issues privately to the repository owner.
