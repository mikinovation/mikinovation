output "inc_cache_bucket_name" {
  description = "インクリメンタルキャッシュ用 R2 バケット名。apps/web/wrangler.jsonc と一致している必要がある"
  value       = cloudflare_r2_bucket.next_inc_cache.name
}
