variable "cloudflare_account_id" {
  description = "Cloudflare のアカウント ID。.envrc の TF_VAR_cloudflare_account_id から渡る"
  type        = string
  sensitive   = true
}

variable "worker_name" {
  description = "Worker 名。apps/web/wrangler.jsonc の name と一致させること"
  type        = string
  default     = "mikinovation-web"
}

variable "r2_location" {
  description = "R2 バケットのロケーション。バケット作成後は変更できない"
  type        = string
  default     = "apac"

  validation {
    condition     = contains(["apac", "eeur", "enam", "weur", "wnam", "oc"], var.r2_location)
    error_message = "r2_location は apac, eeur, enam, weur, wnam, oc のいずれかである必要があります。"
  }
}
