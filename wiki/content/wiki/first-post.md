---
title: 'Nuxt 4 でブログを始める'
description: 'Nuxt Content v3 を使用したブログ構築の第一歩。静的サイト生成とMarkdownによるコンテンツ管理について解説します。'
date: '2025-11-03'
draft: false
---

# Nuxt 4 でブログを始める

Nuxt 4 と Nuxt Content v3 を使用して、モダンなブログプラットフォームを構築する方法を紹介します。

## Nuxt Content の特徴

Nuxt Content は、ファイルベースのCMSとして機能し、以下の特徴があります：

- **Markdown サポート**: シンプルな記法で記事を作成
- **TypeScript 型安全**: コレクション機能による型の自動生成
- **SQLite ストレージ**: 高速なコンテンツ取得
- **Vue コンポーネント**: Markdown 内で Vue コンポーネントが使用可能

## セットアップ手順

### 1. プロジェクト作成

```bash
npx nuxi@latest init my-blog
cd my-blog
```

### 2. Nuxt Content のインストール

```bash
pnpm add @nuxt/content
```

### 3. コレクションの定義

`content.config.ts` でコンテンツのスキーマを定義します：

```typescript
import { defineCollection, z } from '@nuxt/content'

export const collections = {
  blog: defineCollection({
    source: 'content/blog/**',
    type: 'page',
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.string().or(z.date()),
      draft: z.boolean().optional().default(false),
    })
  })
}
```

## まとめ

Nuxt 4 と Nuxt Content v3 を使うことで、型安全で保守性の高いブログプラットフォームを構築できます。
静的サイト生成により、高速なページ配信も実現できます。

次回は、より高度な機能について解説します。
