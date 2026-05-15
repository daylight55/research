variable "cloudflare_api_token" {
  description = "Cloudflare API token with Pages Read and Pages Write permissions."
  type        = string
  sensitive   = true
  default     = null
}

variable "account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "project_name" {
  description = "Cloudflare Pages project name. This becomes the default *.pages.dev subdomain."
  type        = string
  default     = "daylight-research"
}

variable "custom_domain_name" {
  description = "Custom production domain attached to the Cloudflare Pages project."
  type        = string
  default     = "research.daylight55.dev"
}

variable "custom_domain_zone_id" {
  description = "Cloudflare DNS zone ID for the custom production domain."
  type        = string
  default     = null
}

variable "production_branch" {
  description = "Branch used for production deployments."
  type        = string
  default     = "main"
}

variable "github_owner" {
  description = "GitHub repository owner connected to Cloudflare Pages."
  type        = string
  default     = "daylight55"
}

variable "github_repo_name" {
  description = "GitHub repository name connected to Cloudflare Pages."
  type        = string
  default     = "research"
}

variable "github_repo_id" {
  description = "GitHub numeric repository ID. Cloudflare Pages source config expects the connected provider's repo ID."
  type        = string
}

variable "github_owner_id" {
  description = "GitHub numeric owner ID for the connected Cloudflare Pages source provider."
  type        = string
}

variable "preview_branch_includes" {
  description = "Preview deployment branch allowlist. Null means Cloudflare default behavior."
  type        = list(string)
  default     = null
}

variable "preview_branch_excludes" {
  description = "Preview deployment branch denylist. Null means Cloudflare default behavior."
  type        = list(string)
  default     = null
}

variable "path_includes" {
  description = "Optional repository path include filters for Pages builds."
  type        = list(string)
  default     = null
}

variable "path_excludes" {
  description = "Optional repository path exclude filters for Pages builds."
  type        = list(string)
  default     = null
}

variable "build_config" {
  description = "Cloudflare Pages build config for the Astro production site."
  type = object({
    build_command   = optional(string)
    destination_dir = optional(string)
    root_dir        = optional(string)
    build_caching   = optional(bool)
  })
  default = {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = "/"
    build_caching   = true
  }
}
