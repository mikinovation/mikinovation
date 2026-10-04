# ADR: 導入範囲「最小限」に、メモとタスクの管理に絞った Neovim を含める

導入範囲「最小限」にも Neovim を入れて既定エディターにし、プラグインは nvim-orgmode と org-roam.nvim だけを「すべて」と同じ定義で読み込むという決定を記録する。

- 読者: 開発者
- 状態: 採用
- 決定日: 2026-10-04

用語は PRD 0002 と同じ意味で使う。
「すべて」「最小限」は、PRD 0001 が定める導入範囲を指す。
エディターは、ADR 0002 で既定エディターにした Neovim を指す。
プラグインの定義は、ADR 0014 と同じく `plugins/<名前>/init.lua` が返す lazy.nvim の spec を指す。

## 背景

ADR 0002 は、Neovim を導入範囲「すべて」にだけ含め、「最小限」には含めないと決めた。
そのため、「最小限」を導入したマシンでは Neovim が入らず、`EDITOR` も設定されない。
「最小限」は、壊れた環境でもすぐに作業を始めるための範囲である。
ところが、Git のコミットメッセージの入力や設定ファイルの修正など、壊れた環境の復旧でもエディターは要る。
メモとタスクも、ADR 0006 で Neovim の nvim-orgmode と org-roam.nvim に置いているため、Neovim がないと扱えない。

所有者は、「最小限」でもエディターを使い、Orgmode と org-roam でメモとタスクを扱えるようにすることを求めた。
これを受けて、PRD 0001 は「最小限」にメモとタスクの管理に絞ったエディターを含め、PRD 0002 は要求21を加えた。
PRD 0006 は、「最小限」で使える要求を定めた。

## 制約

PRD 0002 の要求21 と、PRD 0001 の「最小限」の目的から、選べる案は次の条件を満たす必要がある。

- 「最小限」でも、既定のエディターを開く操作でエディターが起動する。
- 「最小限」でも、PRD 0006 の要求1と要求4から要求9を満たす。
- 「最小限」を軽く保つ。言語サーバーや、メモとタスクに関係のないプラグインと道具を入れない。
- 「最小限」でも、PRD 0002 の要求3（起動時にエラーが出ない）、要求19（クリップボードの共有）、要求20（同じキーに複数の操作を割り当てない）を満たす。

PRD 0008、ADR 0001、ADR 0002、ADR 0014 から、次の条件も満たす必要がある。

- 両方の導入範囲で、同じ Home Manager のモジュールから導入する。
- 設定は Lua で書き、Home Manager が `~/.config/nvim` に配置する。
- プラグインの版は、各プラグインの定義の `commit` で固定し、Renovate で更新を知らせる。

## 決定

`packages/dotfiles/nix/programs/neovim` のモジュールを、導入範囲「すべて」と「最小限」の両方に含める。
「最小限」では、プラグインに頼らない設定と、nvim-orgmode と org-roam.nvim の定義だけを配置する。

- 既定エディターの設定（`EDITOR`、`VISUAL`、`vi`、`vim`、`vimdiff` の別名）は、両方の導入範囲で同じにする。
- 両方の導入範囲で共通の設定を `core.lua` と `core_keymaps.lua` に分ける。`core.lua` は leader、オプション、クリップボードを設定する。`core_keymaps.lua` は、Neovim に組み込まれた機能だけを使うキーマップを設定する。
- `plugins.lua` は、lazy.nvim を取得して起動する `setup(specs)` と、「すべて」の定義の一覧を返す `full_specs()` を持つモジュールにする。`LAZY_COMMIT` は `plugins.lua` に残す。
- 「すべて」の入口 `init.lua` は、`core.lua` を読み込んだあと、`full_specs()` の定義で `setup` を呼び、言語サーバーと全キーマップを読み込む。全キーマップの `keymaps.lua` は `core_keymaps.lua` を読み込む。
- 「最小限」の入口は `minimal.lua` とし、`core.lua` と `core_keymaps.lua` を読み込んだあと、nvim-orgmode と org-roam.nvim の定義だけで `setup` を呼ぶ。定義は「すべて」と同じファイルを使う。
- org-roam.nvim のタグのないノートの一覧（`<leader>su`）は telescope に頼るため、telescope の定義が lazy.nvim にあるときだけキーマップを設定する。
- nvim-orgmode は初回起動時に tree-sitter-org を取得して組み立てるため、C コンパイラー（Linux は gcc、macOS は clang）は両方の導入範囲で Neovim の追加パッケージに入れる。それ以外の追加パッケージは「すべて」にだけ入れる。
- 「最小限」では、`minimal.lua` を `init.lua` として、`minimal-config-files` に挙げたファイルと一緒に、1つのディレクトリーとして `~/.config/nvim` に配置する。
- 起動確認のスクリプトは、同じ `minimal-config-files` から「最小限」の配置を組み立て、空のデータのディレクトリーでプラグインを取得したあと、エラーなく起動することを確かめる。

## 決定理由

- 共通の設定を同じファイルから読み込むため、両方の導入範囲でオプションと基本のキーマップがずれない。
- nvim-orgmode と org-roam.nvim の定義を「すべて」と共有するため、版の固定、Renovate による更新の通知、メモとタスクの設定が両方の導入範囲で同じになる。
- プラグインを2つに絞り、言語サーバーや組み立ての道具を入れないため、「最小限」が軽いまま保たれる。
- Home Manager の Neovim モジュールは、プロバイダーを無効にする `init.lua` を自動で生成する。「すべて」ではディレクトリーごと配置するため、この生成物はリポジトリの `init.lua` に隠れる。「最小限」もディレクトリーごと配置すれば、同じ仕組みで隠れ、配置先の衝突が起きない。
- 配置するファイルの一覧を1つのファイルにまとめるため、Nix の配置と起動確認が同じ一覧を使い、一覧の漏れを CI で見つけられる。起動確認は空のデータのディレクトリーで動くため、「すべて」で取得済みのプラグインに隠れて漏れを見逃すこともない。

## 代替案

次の案は、それぞれの理由で採らない。

- 「最小限」をプラグインなしにする案: ネットワークなしで起動できるが、メモとタスクを扱えない。
- 「最小限」にも「すべて」と同じ設定を配置する案: 70を超えるプラグインと、その組み立てに使う Rust、Node.js、luarocks などの道具が要り、「最小限」が重くなる。
- nixpkgs の `vimPlugins` と Home Manager の `programs.neovim.plugins` で nvim-orgmode と org-roam.nvim を入れる案: 構文解析器も組み立て済みで、初回起動にネットワークがいらない。ただし、版が「すべて」の定義の `commit` ではなく nixpkgs に従うため、両方の導入範囲で版がずれ、版の記録が2つになる。所有者は、「すべて」と同じく Neovim のプラグインとして扱うことを選んだ。
- 環境変数で `init.lua` の動きを切り替える案: シェルを経由しない起動では環境変数がなく、「最小限」でも全プラグインを取得しようとする。
- ファイルを1つずつ `~/.config/nvim` 配下に配置する案: Home Manager が生成する `init.lua` と配置先が衝突し、評価時にエラーになる。

## 結果

- 「最小限」のマシンでも Neovim が入り、`EDITOR` が設定される。ADR 0002 の「導入範囲「最小限」の環境には Neovim が入らず、`EDITOR` も設定されない」という結果は、この ADR で置き換える。
- 「最小限」でも、ノートとタスクを nvim-orgmode と org-roam.nvim で扱える。ADR 0006 の「「最小限」には Neovim も pandoc も入らないため、ノートとタスクを扱えない」という結果は、この ADR で置き換える。ただし、pandoc、blink.cmp、telescope が入らないため、Markdown としてのコピー、ノートの種類の補完、タグのないノートの一覧は使えない。
- 「最小限」でも、初回起動では lazy.nvim、nvim-orgmode、org-roam.nvim、tree-sitter-org を GitHub から取得するため、ネットワークへの接続が要る。
- 「最小限」には C コンパイラーが入る。
- 「最小限」では、補完、診断、ファイルの検索、Git の操作など、ほかのプラグインと言語サーバーに頼る機能は使えない。
- 「最小限」で使う設定を足すときは、`minimal-config-files` に加える必要がある。加え忘れると、起動確認で見つかる。
- nvim-orgmode と org-roam.nvim の設定から、「最小限」にないプラグインを呼ぶと、「最小限」で動かない。起動時に呼ぶものは起動確認で見つかるが、キー操作から呼ぶものは見つからない。
- Neovim をヘッドレスで起動すると `VeryLazy` が発火しないため、起動確認では nvim-orgmode と org-roam.nvim の `config` は実行されない。

## 出典

- docs/prd/0001_environment-setup.md
- docs/prd/0002_editor-setup.md
- docs/prd/0006_note-taking.md
- docs/prd/0008_editor-plugin-management.md
- docs/adr/0001_manage-environment-with-nix-flakes.md
- docs/adr/0002_use-neovim-as-default-editor.md
- docs/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks.md
- docs/adr/0014_pin-neovim-plugins-by-commit-in-lazy-nvim-specs.md
- packages/dotfiles/nix/home.nix
- packages/dotfiles/nix/programs/neovim/default.nix
- packages/dotfiles/nix/programs/neovim/minimal-config-files
- packages/dotfiles/nix/programs/neovim/nvim/plugins.lua
- packages/dotfiles/scripts/nvim-smoke-test.sh
- Home Manager のソース（`modules/programs/neovim/default.nix` の `nvim/init.lua`、`modules/files.nix` の `insertFile`）
- nvim-orgmode のソース（`lua/orgmode/utils/treesitter/install.lua`）
- nixpkgs のソース（`pkgs/development/lua-modules/overrides.nix` の `orgmode`）
- 所有者の依頼（2026-10-04、「最小限」でも Neovim を使えるようにする）
- 所有者の依頼（2026-10-04、「最小限」でも Orgmode と org-roam を Neovim のプラグインとして使う）
