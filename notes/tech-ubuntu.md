# 初期設定

## リポジトリ、パッケージの最新化

```bash
sudo apt update
sudo apt list --upgradable
sudo apt upgrade
```

## 時間設定

```bash
sudo timedatectl status
sudo timedatectl set-timezone Asia/Tokyo
```

## ロケール設定

```bash
sudo localectl status
sudo localectl set-locale LANG=ja_JP.UTF-8
```

## ファイアフォール設定

```bash
# UFWの有効化
sudo ufw enable
# ポートの開放
sudo ufw allow 22
# ポートの閉鎖
sudo ufw deny 22
# ポートの開放状況確認
sudo ufw status
```

参照: https://ubuntu.com/server/docs/security-firewall

## SSH接続設定

```bash
# Open SSHサーバーが起動しているか確認
systemctl status sshd.service
# インストールされていない場合は以下
sudo apt install openssh-server
# ssh設定ファイル下へ移動
cd /etc/ssh
# 設定ファイルを念のため残しておく
sudo cp -p sshd_config sshd_config.copied
# sshdファイルの編集ができる
sudo vim ssh_config
```

クライアントPCでssh接続を試す。

```bash
# さくらVPSの場合
ssh username@xxxxxxxxxxxxxxx.sakura.ne.jp
```

このままだと毎回パスワードを入力しなければならず安全でもないので、公開鍵認証を導入する

クライアント側で以下を実行。今回はさくらVPSなのでid_sakura_dev_rsaという名前で作成した。

```bash
cd ~/.ssh
# 鍵の生成
ssh-keygen -t rsa
Enter file in which to save the key (/Users/(username)/.ssh/id_rsa):id_sakura_dev_rsa
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
# サーバー側にキーをコピーする
ssh-copy-id -i id_sakura_dev_rsa.pub username@xxxxxxxxxxxxxx.sakura.ne.jp
# 以下でログインできたら成功(接続するときに毎回使用するのでメモる)
ssh -i ~/.ssh/id_sakura_dev_rsa username@xxxxxxxxxxxxxxx.sakura.ne.jp
```

VPSサーバー側
SSHでの接続ができるようになったのでセキュリティを強める

```bash
cd /etc/ssh
sudo vim sshd_config
```

以下の設定を変更

```bash:sshd_config
port 56789 # 普段使わないport番号に変更
PublicAuthentication yes
PasswordAuthentication no
Use PAM no
```

ssh接続の最終的なコマンドをメモっておく

```bash
ssh -i ~/.ssh/id_sakura_dev_rsa -p 56789 username@xxxxxxxxxxxxx.sakura.ne.jp
```

sshdのサービスを再起動

```bash
sudo service sshd restart
```

更にファイアウォールも設定

```bash
# ssh接続で使うportを開く
sudo ufw allow 56789
# 22はもう使わないので閉じる
sudo ufw deny 22
```

## SSHが切断されないようにする

クライアントPC側でsshのconfigファイルを編集する

```bash
sudo vim ~/.ssh/config
```

1分毎に信号を送って接続が切れないようにする

```bash
Host *
  ServerAliveInterval 60
```

# パッケージのインストール

## 必須パッケージのインストール

gitがインストールされているか確認

```bash
sudo apt-get install build-essential procps curl file git unzip zip tmux
```

## zshのインストール

```bash
sudo apt install zsh
```

さくらのVPSにはデフォルトでインストールされていた

## dockerのインストール

dockerがインストールされているか確認

```bash
docker
```

dockerがインストールされていなかったので、以下を参照してインストール

https://docs.docker.com/engine/install/ubuntu/

## Linux Homebrew

Macと同じようにbrewが使えると何かと便利なので入れとく

https://docs.brew.sh/Homebrew-on-Linux

## Pythonのインストール

```bash
brew install python3
pip3 install -U neovim
```

## nvimのインストール

Pythonのサポートされたnvimをインストールする必要がある

```bash
sudo add-apt-repository ppa:neovim-ppa/stable
sudo apt-get update
sudo apt-get install neovim
```

ただこれだとnvimが最新バージョンでなかった。

```bash
# 一度削除
sudo apt remove neovim
#appimageをダウンロード
cd ~/Downloads
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
chmod u+x nvim.appimage
# ファイルを展開
./nvim.appimage --appimage-extract
# ディレクトリを移動してシンボリックを貼る
sudo mv squashfs-root /
sudo ln -s /squashfs-root/AppRun /usr/bin/nvim
```

これでpythonのサポートされたnvimが使えるようになる

```bash
nvim
```

## denoの導入

vimのパッケージ管理でdpp.vimを使用するために必要

https://zenn.dev/mikinovation/articles/20230930-install-deno-on-ubuntu

## Nodejs(volta)の導入

https://volta.sh/

## pnpmの導入

```bash
volta install pnpm
```

## gituiをインストール

brewを使ってgituiをインストール

https://github.com/extrawurst/gitui

## ripgrepのインストール

brewを使ってripgrepのインストール
vimで全体検索をできるようにする

https://github.com/BurntSushi/ripgrep

# 開発環境のportを開ける

自分のIPアドレスを調べる
https://www.cman.jp/network/support/go_access.cgi

```bash
sudo ufw allow from xxx.xxx.xxx.xxx to any port 3000
```

これで開発環境にもhttp接続できるようになる

# 各言語やツールの環境構築

- [CLI](./tech-cli.md)
- [Vim](./tech-vim.md)
- [Java](./tech-java.md)
- [JavaScript](./tech-javascript.md)
- [Vue](./tech-vue.md)
- [Python](./tech-python.md)
- [PostgreSQL](./tech-postgresql.md)
