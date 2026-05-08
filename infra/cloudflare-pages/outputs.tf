output "pages_project_name" {
  description = "Cloudflare Pages project name."
  value       = cloudflare_pages_project.research.name
}

output "pages_subdomain" {
  description = "Default Cloudflare Pages subdomain."
  value       = cloudflare_pages_project.research.subdomain
}

output "pages_domains" {
  description = "Custom domains attached to the Pages project."
  value       = cloudflare_pages_project.research.domains
}

