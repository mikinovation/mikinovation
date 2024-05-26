# Git

## 便利コマンド

ローカルで特定のブランチ(mainとdevelop)以外を消したいとき

```bash
git branch| egrep -v "\*|main|develop" | xargs git branch -D
```

mainブランチを優先してマージ

```bash
git merge -Xtheirs main
```

## CUIクライアント

### Lazygit(普段使っている)

[lazygit](https://github.com/jesseduffield/lazygit)

### Gitui

Rust製のCUIクライアント。機能的にはlazygitの方が便利だった

Neovim上で使ってみたかったので以下のライブラリを自作

[nvim-gitui](https://github.com/mikinovation/nvim-gitui)

## Github

### Repositoryを作成したら最初にやること

- 環境構築
  - .gitignore
  - README.md
  - LICENSE
- プルリクエストのテンプレート作成
- CIの設定
  - Github ActionsであればActionsタブから設定
  - 最初はcheckoutだけでもOK
- CDの設定
- ブランチの保護
  - CIが通ったらマージできるようにする
  - mainブランチには直接pushできないようにする
- CodeRabbitの設定
- Dependabotの設定
- Renovateの設定
  - [Github App](https://github.com/apps/renovate)からインストール
  - リポジトリを許可したらプルリクが作成されるのでマージする
- lintとformatterの設定(各言語のnoteを参照)
- テストの設定(各言語のnoteを参照)

### ssh接続の設定

Github CLIを使ってssh接続の設定を行う

[俺たちはもう GitHub のために ssh-keygen しなくていい](https://zenn.dev/lovegraph/articles/529fe37caa3f19)
