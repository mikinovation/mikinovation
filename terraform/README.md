# terraform

`apps/web` を Cloudflare Workers で動かすための Cloudflare 側リソースを管理する。

Worker スクリプト本体は Terraform 管理外で、`apps/web` から wrangler がデプロイする。OpenNext の `.open-next/worker.js` は `.open-next/server-functions/**` を import した未完結のエントリで、最終バンドルを wrangler が行うため、`cloudflare_workers_script.content_file` には渡せない。

現在の管理対象は R2 バケット 1 個のみ。

| リソース | 用途 |
| --- | --- |
| `cloudflare_r2_bucket.next_inc_cache` | OpenNext のインクリメンタルキャッシュ（`mikinovation-web-cache`） |

## 前提

### 手動で用意するもの

1. state 用 R2 バケット `mikinovation-tfstate`。Terraform は自分の state 置き場を作れないため手動で作る
2. R2 の S3 互換 API トークン（Access Key ID / Secret Access Key）
3. Cloudflare API トークン。必要な権限は次のとおり
   - Workers Scripts:Edit（wrangler のデプロイ用）
   - Workers R2 Storage:Edit（バケットの作成・管理用）
   - Account Settings:Read

### 1Password のアイテム構成

リポジトリルートの `.envrc` が以下を参照する。アイテム名やフィールド名を変える場合は `.envrc` も合わせて変更する。

アイテム名を `Personal Cloudflare` としているのは、仕事用の Cloudflare アカウントと取り違えないようにするため。ここで管理するのは個人アカウントの資格情報のみ。

| 参照 | 内容 |
| --- | --- |
| `op://Private/Personal Cloudflare/account id` | 個人アカウントの Cloudflare アカウント ID |
| `op://Private/Personal Cloudflare/api token` | 個人アカウントの Cloudflare API トークン |
| `op://Private/Personal Cloudflare R2/access key id` | R2 の S3 互換 Access Key ID |
| `op://Private/Personal Cloudflare R2/secret access key` | R2 の S3 互換 Secret Access Key |

## 使い方

リポジトリルートで `direnv allow` を一度実行し、環境変数が入っていることを確認する。

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

`backend "s3"` の `endpoints.s3` は `.envrc` の `AWS_ENDPOINT_URL_S3` から渡るため、`-backend-config` は不要。

## 注意点

- `cloudflare_r2_bucket.location` はバケットを作り直さない限り変更できない。プロバイダのドキュメントに「location はそのバケット名で最初に作成したときのみ有効」と明記されている
- バケット名は `apps/web/wrangler.jsonc` の `r2_buckets[].bucket_name` と一致させること。片方だけ変えると Worker 実行時に落ちる
- `use_lockfile` は R2 の条件付き書き込みに依存する。動作しない場合は `versions.tf` から外す
