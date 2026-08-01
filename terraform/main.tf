provider "cloudflare" {}

resource "cloudflare_r2_bucket" "next_inc_cache" {
  account_id    = var.cloudflare_account_id
  name          = "${var.worker_name}-cache"
  location      = var.r2_location
  storage_class = "Standard"
}
