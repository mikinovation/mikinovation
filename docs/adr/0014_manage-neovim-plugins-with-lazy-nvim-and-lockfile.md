# ADR: Neovim のプラグインを lazy.nvim で管理し、版をリポジトリの lazy-lock.json で固定する

Neovim のプラグインの取得と読み込みを lazy.nvim に任せ、各プラグインの版をリポジトリに置く `lazy-lock.json` で固定するという決定を記録する。

- 読者: 開発者
- 状態: 採用
- 決定日: 2026-10-04

用語は PRD 0008 と同じ意味で使う。
エディターは、ADR 0002 で既定エディターにした Neovim を指す。

## 背景

PRD 0008 は2つの問題を挙げる。
プラグインの版がマシンごとにずれると、同じ設定でもマシンによって挙動が変わり、エラーが出るマシンが生じる。
プラグインをマシンごとに手作業で揃えるには手間がかかる。

ADR 0002 は、プラグインを lazy.nvim で管理し、版を `lazy-lock.json` で固定すると決めた。
ただし、その決定はエディターの選定の一部として書かれており、プラグイン管理の制約、代替案、引き受けることを記録していない。
この ADR は、ADR 0002 のうちプラグイン管理の部分を、PRD 0008 の要求に照らして記録し直す。

## 制約

PRD 0008 の要求から、選べる案は次の条件を満たす必要がある。

- 初回起動時に、所有者が操作せずに全プラグインが揃う。
- どのマシンでも、版の記録どおりの版のプラグインが入る。
- 所有者がプラグインの版を更新し、その結果を版の記録としてリポジトリに残せる。
- 所有者が更新の操作をしない限り、プラグインの版が変わらない。
- プラグインを、使うときに読み込む。
- 取得時に組み立てが必要なプラグインも、所有者が道具を手作業で導入せずに使える。
- プラグインの設定の誤りを、変更のたびに自動で見つける。

PRD 0008 は、次のことを対象外とする。

- プラグインの新しい版を自動で確かめ、所有者に知らせること。
- 開発環境の導入で設定される環境変数がない状態で起動したときに、版を固定すること。
- あるマシンで更新した版の記録を、プラグインを取得済みの既存のマシンへ反映すること。

ADR 0001 と ADR 0002 から、次の条件も満たす必要がある。

- 設定は Lua で書き、Home Manager が `~/.config/nvim` に配置する。
- 組み立てに使う道具は Nix で導入する。

## 決定

Neovim のプラグインは lazy.nvim で取得し、読み込む。
版の記録は、リポジトリの `packages/dotfiles/nix/programs/neovim/nvim/lazy-lock.json` とする。

- lazy.nvim 自体は、初回起動時に `plugins.lua` が GitHub の `stable` ブランチから取得する。取得後の lazy.nvim の版も `lazy-lock.json` で固定する。
- `lazy.setup` の `lockfile` には、環境変数 `DOTFILES_DIR` から組み立てたリポジトリ内の `lazy-lock.json` の絶対パスを渡す。`DOTFILES_DIR` は zsh のモジュールが設定する。
- Home Manager が `~/.config/nvim` を配置するとき、`lazy-lock.json` を除く。Nix のストアに置かれた読み取り専用の複製ではなく、リポジトリのファイルを lazy.nvim が直接読み書きするためである。
- 版の更新は、所有者が `:Lazy update` を実行して行う。lazy.nvim がリポジトリの `lazy-lock.json` を書き換え、所有者がその変更をコミットする。
- lazy.nvim の新しい版の確認（`checker`）は有効にしない。
- 各プラグインの定義は `plugins/<名前>/init.lua` に置き、`event`、`cmd`、`keys`、`ft` のいずれかで読み込む契機を指定する。Neovim に組み込まれた使わない runtime プラグインは、`performance.rtp.disabled_plugins` で読み込まない。
- 取得時に組み立てが必要なプラグインは、lazy.nvim の `build` で組み立てる。組み立てに使う cargo、make、yarn、npm、tree-sitter、C コンパイラー、luarocks は、Neovim の追加パッケージと、Rust と Node.js の Home Manager モジュールで Nix から導入する。
- 設定の誤りは、dotfiles の CI で変更のたびに確かめる。busted でプラグインの定義の形式を検証し、Neovim をヘッドレスで起動して、起動時のエラーがないことを確かめる。

## 決定理由

- lazy.nvim は、初回起動時に足りないプラグインを自動で取得するため、所有者が操作せずに全プラグインが揃う。
- lazy.nvim は、取得するときに `lazy-lock.json` に書かれたコミットを使う。この記録をリポジトリに置けば、新規のマシンでも記録どおりの版が入る。
- `:Lazy update` が `lazy-lock.json` を書き換えるため、更新の結果をそのままリポジトリに残せる。`checker` を有効にしなければ、更新の操作をしない限り版は変わらない。
- `lockfile` を `DOTFILES_DIR` から組み立てると、リポジトリの置き場所が変わっても、Nix の設定にある `dotfilesDir` だけを直せばよい。
- `lazy-lock.json` を Home Manager の配置から除くのは、Nix のストアのファイルは読み取り専用で、`:Lazy update` が書き換えられないためである。
- lazy.nvim は、プラグインごとに読み込む契機を宣言できるため、使わないプラグインを起動時に読み込まない。
- `build` に必要な道具を Nix で導入すれば、所有者が道具を手作業で導入せずに、組み立てが必要なプラグインを使える。
- 設定を Lua で書いているため、プラグインの定義を busted で検証できる。ヘッドレスでの起動は、Lua の検証では見つからない、モジュールの欠けや `init.lua` の誤りを見つける。

## 代替案

次の案は、それぞれの理由で採らない。

- Home Manager の `programs.neovim.plugins` で nixpkgs のプラグインを導入する案: `flake.lock` で版を固定でき、初回起動にネットワークもいらない。ただし、nixpkgs にないプラグインは自前でパッケージを定義して保守する必要があり、プラグインの版を上げる時期が nixpkgs の更新に縛られる。また、プラグインごとに読み込む契機を宣言する仕組みを、別に用意する必要がある。
- nixvim などの Nix で Neovim の設定を書く仕組み: 版の固定と遅延読み込みを Nix で書けるが、設定を Nix で書き直す必要があり、ADR 0002 が決めた、設定を Lua で書いて luacheck と busted で検証する方針と合わない。
- Neovim 本体のプラグイン管理（`vim.pack`）: Neovim 0.12 で加わったもので、CI で起動を確かめている Neovim 0.11 では使えない。また、読み込む契機の宣言を自前で書く必要がある。
- packer.nvim: 開発が止まっている。
- `lazy-lock.json` を Home Manager で `~/.config/nvim` に配置する案: Nix のストアのファイルは読み取り専用のため、`:Lazy update` が版の記録を書き換えられない。
- lazy.nvim の既定の場所（`~/.config/nvim/lazy-lock.json`）に置く案: 版の記録がリポジトリの外に置かれるため、マシン間で揃わない。
- 各プラグインの定義に `commit` や `tag` を書いて固定する案: 版を上げるたびに定義を手で書き換える必要があり、`:Lazy update` で更新の結果を記録できない。

## 結果

- 初回起動では、lazy.nvim とプラグインを GitHub から取得するため、ネットワークへの接続が必要になる。
- 所有者が `:Lazy update` を実行するまで、新しい版は入らない。新しい版が出たことも知らされない。
- `DOTFILES_DIR` がない状態で起動すると、lazy.nvim は既定の場所の `lazy-lock.json` を使うため、版はリポジトリの記録どおりにならない。
- リポジトリを Nix の設定にある `dotfilesDir` の場所に置く必要がある。ADR 0002 は `~/dotfiles` 配下の絶対パスと書くが、現在の参照先は `DOTFILES_DIR` が指す場所である。
- あるマシンで更新した `lazy-lock.json` を取り込んでも、プラグインを取得済みの既存のマシンでは版が変わらない。揃えるには、所有者がそのマシンで `:Lazy restore` を実行するか、プラグインを取得し直す必要がある。
- lazy.nvim 自体は初回に `stable` ブランチの最新を取得し、その後に `lazy-lock.json` の版へ揃える。取得の時点では、記録と異なる版の lazy.nvim が一度動く。
- 組み立てが必要なプラグインは、組み立てに使う道具が導入範囲「すべて」の Rust と Node.js のモジュールにあることを前提とする。これらのモジュールから道具を外すと、そのプラグインが使えなくなる。
- CI のヘッドレス起動は `:Lazy! sync` でプラグインを揃えるため、`lazy-lock.json` の版ではなく各プラグインの最新の版で起動を確かめる。版の記録どおりの組み合わせでのエラーは、CI では見つからない。
- プラグインの組み立ては lazy.nvim が初回起動時に行うため、Nix のビルドとは異なり、何度導入しても同じ成果物になるとは限らない。

## 出典

- docs/prd/0008_editor-plugin-management.md
- docs/prd/0002_editor-setup.md
- docs/adr/0001_manage-environment-with-nix-flakes.md
- docs/adr/0002_use-neovim-as-default-editor.md
- packages/dotfiles/nix/programs/neovim/default.nix
- packages/dotfiles/nix/programs/neovim/nvim/plugins.lua
- packages/dotfiles/scripts/nvim-smoke-test.sh
- .github/workflows/dotfiles-ci.yml
