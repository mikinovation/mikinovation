# Javascript

## バージョン管理

[volta](https://volta.sh/)を使っている

```bash
volta install node
volta install pnpm
```

## package.json

### privateの設定

業務用のプロジェクトであれば基本的にtrueでOK

```json
{
  "private": true
}
```

### パッケージ管理ツールの固定

npmの場合

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=7.0.0",
    "pnpm": "use npm",
    "yarn": "use npm"
  }
}
```
