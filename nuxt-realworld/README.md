# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

packageのインストール

```bash
npm install
```

## 開発サーバーの立ち上げ

```bash
npm run dev
```

## 技術選定

- バック
  - DB
    - Postgres
  - ORM
    - drizzle
- フロント
  - Vue
    - Composition API
    - script setup
  - Graphql
    - urql(@urql/vue)
      - https://github.com/urql-graphql/urql
      - キャッシュをうまく利用したい
  - CSSは基本的にありものを使わせてもらう
    - CSSファイルから読みこみ
    - 実際のプロダクトではスコープドもしくは、TailwindCSS等のライブラリを利用する
- バック、フロント共通
  - Nuxt3(Nuxt4にアップデート予定)
    - APIサーバーを利用
    - サーバーコンポーネント
  - TypeScript
  - neverthrow
    - https://github.com/supermacro/neverthrow
    - 関数型プログラミングの考え方を取り入れてエラーハンドリングを行う
    - 基本的にフロント、バックエンドともに例外を投げないようにしたい