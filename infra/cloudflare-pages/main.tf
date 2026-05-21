provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_pages_project" "research" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch
  build_config      = var.build_config

  source = {
    type = "github"
    config = {
      owner                          = var.github_owner
      owner_id                       = var.github_owner_id
      repo_name                      = var.github_repo_name
      repo_id                        = var.github_repo_id
      production_branch              = var.production_branch
      production_deployments_enabled = false
      pr_comments_enabled            = false
      preview_deployment_setting     = "none"
      path_includes                  = var.path_includes
      path_excludes                  = var.path_excludes
    }
  }
}

resource "cloudflare_pages_domain" "custom_domain" {
  account_id   = var.account_id
  project_name = cloudflare_pages_project.research.name
  name         = var.custom_domain_name
}

resource "cloudflare_dns_record" "pages_custom_domain" {
  zone_id = var.custom_domain_zone_id
  name    = var.custom_domain_name
  type    = "CNAME"
  content = cloudflare_pages_project.research.subdomain
  proxied = true
  ttl     = 1
  comment = "Managed by Terraform for Cloudflare Pages project ${cloudflare_pages_project.research.name}."

  depends_on = [cloudflare_pages_domain.custom_domain]
}
