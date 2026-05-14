# Cloudflare Pages Terraform

This module creates the Cloudflare Pages project for `daylight55/research`.

The Pages project is intentionally build-method agnostic. `build_config` defaults to `null`, so this infrastructure branch can be reviewed independently from whichever Astro design branch is selected.

Cloudflare's current Astro guide documents `npm run build` and `dist` as the standard dashboard values, but this module exposes those as optional variables instead of hard-coding them.

## Usage

```sh
cd infra/cloudflare-pages
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Set `CLOUDFLARE_API_TOKEN` in the environment or pass `cloudflare_api_token` through a secure tfvars mechanism.

The Cloudflare account must already have the GitHub repository connected. Cloudflare's Terraform resource uses the connected provider's numeric `repo_id` and `owner_id`.
