# Private Research Queue GitHub App

`daylight55/research` uses a private GitHub App for two automated surfaces:

- reading and updating research topics from the private
  `daylight55/research-queue` repository
- creating, commenting on, dispatching previews for, and optionally merging
  generated PRs in `daylight55/research`

## Queue repository

- Repository: `daylight55/research-queue`
- Visibility: private
- Issues: enabled
- Wiki and Projects: disabled

Queue issues are processed only when they have the `daily-research` label.
Add `daily-research-auto-merge` only when the generated PR may be merged
automatically.

## GitHub App permissions

Create a private GitHub App owned by `daylight55` and install it on:

- `daylight55/research`
- `daylight55/research-queue`

Required repository permissions:

- Metadata: read
- Contents: read and write
- Pull requests: read and write
- Actions: read and write
- Issues: read and write

No webhook is required.

## Secrets in `daylight55/research`

Store the GitHub App credentials as repository secrets in `daylight55/research`:

- `RESEARCH_QUEUE_APP_ID`
- `RESEARCH_QUEUE_APP_PRIVATE_KEY`

The Daily Issue Research workflow skips queue processing until both secrets are
configured.
