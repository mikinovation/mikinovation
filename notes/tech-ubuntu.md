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
