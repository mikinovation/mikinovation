# Vue

https://vuejs.org/

## Volarの設定

Neovimでcoc-volarを使う際には[watchman](https://facebook.github.io/watchman/)が推奨されているのでインストール

## コーディング規約

- [Vueのtemplate、上から書くか?下から書くか?](https://zenn.dev/mikinovation/articles/20221008-template-upper-lower)
  - 自分の記事
  - Vueのファイルはscript、template、styleの順で書くのを推奨したいという主張

## Nuxt

https://nuxt.com/

### useFetchとuseAsyncData

- [Nuxt3で個人的にuseFetchよりuseAsyncDataを推したい理由](https://zenn.dev/mikinovation/articles/20221226-nuxt3-use-fetch-async-data)
  - 自分の記事
  - Nuxt3でuseFetchとuseAsyncDataが両方使えるが、useAsyncDataの方が使いたい理由
  - fetchを抽象化する

### lintの設定

- [Nuxt ESLint](https://eslint.nuxt.com/)
  - Nuxtの公式ドキュメント
  - NuxtのプロジェクトでESLintを使う際の設定方法
- [Nuxt3で「eslintrcとprettier」から「flat configとeslint stylistic」へ移行した話](https://zenn.dev/gerunda/articles/20240430-nuxt-eslint-flat-config-migration)
  - 自分の記事
  - 可能な限りノーコンフィグで設定する設定したい
  - プロジェクトの状況に合わせて調整
  - prettierではなく、eslint stylisticを採用した

### 気になる

- [NuxtHub](https://hub.nuxt.com/)
  - Edgeで動かす際に利用したい
  - 2024年5月26日時点ではalpha版
