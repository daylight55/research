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
      production_deployments_enabled = true
      pr_comments_enabled            = true
      preview_deployment_setting     = "all"
      preview_branch_includes        = var.preview_branch_includes
      preview_branch_excludes        = var.preview_branch_excludes
      path_includes                  = var.path_includes
      path_excludes                  = var.path_excludes
    }
  }
}
