# Private Research Queue GitHub App

`daylight55/research` reads research topics from the private
`daylight55/research-queue` repository.

## Queue repository

- Repository: `daylight55/research-queue`
- Visibility: private
- Issues: enabled
- Wiki and Projects: disabled

Queue issues are processed only when they have the `daily-research` label.
Add `daily-research-auto-merge` only when the generated PR may be merged
automatically.

## GitHub App permissions

Create a private GitHub App owned by `daylight55` and install it only on
`daylight55/research-queue`.

Required repository permissions:

- Metadata: read
- Issues: read and write

No webhook is required.

The reusable manifest is stored at
`.github/codex/research-queue-github-app-manifest.json`. To recreate the app,
run:

```bash
node .github/codex/scripts/register-research-queue-github-app.mjs
```

The script opens the GitHub App manifest flow in the default browser, exchanges
the returned manifest `code`, and sets the required `daylight55/research`
repository secrets. After the app is created, install it only on
`daylight55/research-queue`.

## Secrets in `daylight55/research`

Store the GitHub App credentials as repository secrets in `daylight55/research`:

- `RESEARCH_QUEUE_APP_ID`
- `RESEARCH_QUEUE_APP_PRIVATE_KEY`

The Daily Issue Research workflow skips queue processing until both secrets are
configured.
