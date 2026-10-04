# ADR: Neovim のプラグインを lazy.nvim で管理し、版を各プラグインの定義の commit で固定する

Neovim のプラグインの取得と読み込みを lazy.nvim に任せ、各プラグインの版を定義の `commit` で固定し、定義を版の記録とするという決定を記録する。

- 読者: 開発者
- 状態: 採用
- 決定日: 2026-10-04

用語は PRD 0008 と同じ意味で使う。
エディターは、ADR 0002 で既定エディターにした Neovim を指す。
プラグインの定義は、`packages/dotfiles/nix/programs/neovim/nvim/plugins/<名前>/init.lua` が返す lazy.nvim の spec を指す。

## 背景

PRD 0008 は2つの問題を挙げる。
プラグインの版がマシンごとにずれると、同じ設定でもマシンによって挙動が変わり、エラーが出るマシンが生じる。
プラグインをマシンごとに手作業で揃えるには手間がかかる。

ADR 0002 は、プラグインを lazy.nvim で管理し、版をリポジトリの `lazy-lock.json` で固定すると決めた。
ところが、その `lazy-lock.json` は定義と食い違っていた。
削除した nvim-cmp 系のプラグインが残り、使っている blink.cmp が載っていなかった。
nvim-treesitter は旧 `master` ブランチのコミットのままで、今の定義が呼ぶ API がなかった。
CI の起動確認は `:Lazy! sync` で各プラグインの最新版を使うため、この食い違いを見つけられなかった。

`:Lazy update` は、定義に版の指定がないプラグインを最新版へ進め、`lazy-lock.json` を書き換える。
版の記録が定義と別のファイルにあるため、更新の操作一つで記録と定義が離れていく。

## 制約

PRD 0008 の要求から、選べる案は次の条件を満たす必要がある。

- 初回起動時に、所有者が操作せずに全プラグインが揃う。
- どのマシンでも、版の記録どおりの版のプラグインが入る。
- 所有者がプラグインの版を更新し、その結果を版の記録としてリポジトリに残せる。
- 所有者が更新の操作をしない限り、プラグインの版が変わらない。
- プラグインを、使うときに読み込む。
- 取得時に組み立てが必要なプラグインも、所有者が道具を手作業で導入せずに使える。
- プラグインの設定の誤りを、変更のたびに自動で見つける。

所有者は、次のことも求める。

- `:Lazy update` で版が変わらない。
- 版の記録は定義そのものとし、別のファイルとの食い違いを生まない。

ADR 0001 と ADR 0002 から、次の条件も満たす必要がある。

- 設定は Lua で書き、Home Manager が `~/.config/nvim` に配置する。
- 組み立てに使う道具は Nix で導入する。

## 決定

Neovim のプラグインは lazy.nvim で取得し、読み込む。
版の記録は、各プラグインの定義の `commit` とする。

- すべてのプラグインの定義に、40文字のコミットハッシュで `commit` を書く。`version`、`tag`、`branch` は書かない。
- 別の定義の `dependencies` に `"作者/リポジトリ"` の文字列だけで書いたプラグインは、そのプラグイン自身の定義の `commit` で固定する。
- lazy.nvim 自体は、`plugins.lua` の `LAZY_COMMIT` で固定する。初回起動時の取得ではこのコミットを checkout し、`lazy.setup` にも同じコミットの spec を渡す。
- `lazy.setup` の `lockfile` は `stdpath("state")` 配下に置く。lazy.nvim はロックファイルを必ず書くが、リポジトリでは管理しない。
- 版の更新は、所有者が定義の `commit` を書き換えてコミットする。各マシンには `:Lazy sync` で反映する。
- lazy.nvim の新しい版の確認（`checker`）は有効にしない。
- 各プラグインの定義は `plugins/<名前>/init.lua` に置き、`event`、`cmd`、`keys`、`ft` のいずれかで読み込む契機を指定する。Neovim に組み込まれた使わない runtime プラグインは、`performance.rtp.disabled_plugins` で読み込まない。
- 取得時に組み立てが必要なプラグインは、lazy.nvim の `build` で組み立てる。組み立てに使う cargo、make、yarn、npm、tree-sitter、C コンパイラー、luarocks は、Neovim の追加パッケージと、Rust と Node.js の Home Manager モジュールで Nix から導入する。
- 設定の誤りは、dotfiles の CI で変更のたびに確かめる。busted で、定義の形式と、全定義に `commit` があること、文字列だけの依存がいずれかの定義で固定されていることを検証する。Neovim をヘッドレスで起動して、起動時のエラーがないことも確かめる。

## 決定理由

- lazy.nvim は、checkout の対象を定義の `commit`、`tag`、`version` の順に決める。`commit` があれば `:Lazy update` も `:Lazy sync` もそのコミットを checkout するため、更新の操作で版が変わらない。
- `:Lazy restore` だけは、ロックファイルの版を定義より優先する。ロックファイルをリポジトリから外し、各マシンの state に置けば、リポジトリに定義と食い違う版の記録が残らない。
- 版が定義と同じファイルにあるため、プラグインを足すときも外すときも、版の記録が一緒に変わる。食い違いは busted で見つかる。
- 定義の `commit` を書き換えたあと `:Lazy sync` を実行すれば、取得済みの既存のマシンでも定義どおりの版になる。
- ロックファイルのパスを `DOTFILES_DIR` から組み立てる必要がなくなるため、環境変数がない状態で起動しても版は定義どおりになる。
- lazy.nvim を `LAZY_COMMIT` で固定すると、初回の取得から定義どおりの版で動く。
- CI の `:Lazy! sync` も定義の `commit` を checkout するため、版の記録どおりの組み合わせで起動を確かめられる。
- lazy.nvim は、プラグインごとに読み込む契機を宣言できるため、使わないプラグインを起動時に読み込まない。
- `build` に必要な道具を Nix で導入すれば、所有者が道具を手作業で導入せずに、組み立てが必要なプラグインを使える。

## 代替案

次の案は、それぞれの理由で採らない。

- リポジトリの `lazy-lock.json` で固定する案（ADR 0002 の決定）: `:Lazy update` が版を進めてロックファイルを書き換える。版の記録が定義と別のファイルにあるため、食い違っても気付きにくく、実際に食い違っていた。
- `pin = true` で更新を止める案: 取得済みのプラグインは定義の `commit` を書き換えても checkout されないため、版の更新を既存のマシンへ反映できない。
- `:Lazy update` のコマンドを上書きして無効にする案: lazy.nvim の画面のキー操作や `:Lazy sync` からの更新は止められず、版の記録が別のファイルにある問題も残る。
- Home Manager の `programs.neovim.plugins` で nixpkgs のプラグインを導入する案: `flake.lock` で版を固定でき、初回起動にネットワークもいらない。ただし、nixpkgs にないプラグインは自前でパッケージを定義して保守する必要があり、プラグインの版を上げる時期が nixpkgs の更新に縛られる。また、プラグインごとに読み込む契機を宣言する仕組みを、別に用意する必要がある。
- nixvim などの Nix で Neovim の設定を書く仕組み: 版の固定と遅延読み込みを Nix で書けるが、設定を Nix で書き直す必要があり、ADR 0002 が決めた、設定を Lua で書いて luacheck と busted で検証する方針と合わない。
- Neovim 本体のプラグイン管理（`vim.pack`）: Neovim 0.12 で加わったもので、CI で起動を確かめている Neovim 0.11 では使えない。また、読み込む契機の宣言を自前で書く必要がある。

## 結果

- 初回起動では、lazy.nvim とプラグインを GitHub から取得するため、ネットワークへの接続が必要になる。
- 版を上げるには、所有者が新しいコミットを調べ、定義の `commit` を手で書き換える。`:Lazy update` は版を上げる手段ではなくなり、新しい版が出たことも知らされない。
- 定義の `commit` を書き換えて取り込んだあとも、既存のマシンでは `:Lazy sync` を実行するまで版が変わらない。`:Lazy restore` はそのマシンの古いロックファイルへ戻すため、使わない。
- 版の条件で選んでいた blink.cmp（`1.*`）、git-conflict.nvim（`2.0.0`）、toggleterm.nvim（`*`）は、そのとき選ばれていたタグのコミットで固定する。新しいタグへは自動で移らない。
- annotated tag のハッシュではなく、タグが指すコミットのハッシュを書く必要がある。busted は40文字の16進数であることだけを確かめ、どちらのハッシュかは区別しない。
- 文字列だけで書いた依存を固定する定義が `lazy.setup` に渡されていないと、その依存は固定されない。busted は定義の存在を確かめるが、`lazy.setup` に渡されているかは確かめない。
- リポジトリの `lazy-lock.json` はどこからも参照されなくなる。ADR 0006 は org-roam.nvim の版を `lazy-lock.json` で固定すると書くが、現在は org-roam.nvim の定義の `commit` で固定している。
- 組み立てが必要なプラグインは、組み立てに使う道具が導入範囲「すべて」の Rust と Node.js のモジュールにあることを前提とする。これらのモジュールから道具を外すと、そのプラグインが使えなくなる。
- プラグインの組み立ては lazy.nvim が初回起動時に行うため、Nix のビルドとは異なり、何度導入しても同じ成果物になるとは限らない。

## 出典

- docs/prd/0008_editor-plugin-management.md
- docs/prd/0002_editor-setup.md
- docs/adr/0001_manage-environment-with-nix-flakes.md
- docs/adr/0002_use-neovim-as-default-editor.md
- docs/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks.md
- packages/dotfiles/nix/programs/neovim/default.nix
- packages/dotfiles/nix/programs/neovim/nvim/plugins.lua
- packages/dotfiles/nix/programs/neovim/nvim/plugins/plugin_spec_spec.lua
- packages/dotfiles/scripts/nvim-smoke-test.sh
- .github/workflows/dotfiles-ci.yml
- lazy.nvim のソース（`lua/lazy/manage/git.lua` の `get_target`、`lua/lazy/manage/task/git.lua` の `checkout`）
- 所有者の依頼（2026-10-04、`:Lazy update` を防ぎ定義を正とする）
