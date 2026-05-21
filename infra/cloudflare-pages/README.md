# Cloudflare Pages Terraform

This module creates the Cloudflare Pages project for `daylight55/research`.

Production deploys are run by the `Cloudflare Pages Deploy` GitHub Actions workflow using Wrangler direct upload. Cloudflare's automatic Git production deploys are disabled to avoid competing deploy paths.

Automatic preview deployments and PR comments are disabled. Re-enable `preview_deployment_setting` only when PR preview URLs are explicitly needed again.

## Usage

```sh
cd infra/cloudflare-pages
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Set `CLOUDFLARE_API_TOKEN` in the environment or pass `cloudflare_api_token` through a secure tfvars mechanism.

The Cloudflare account must already have the GitHub repository connected. Cloudflare's Terraform resource uses the connected provider's numeric `repo_id` and `owner_id`.
