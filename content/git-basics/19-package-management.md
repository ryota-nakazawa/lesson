# パッケージ管理って何？

パッケージ管理は、プロジェクトで使う外部ライブラリやツールを管理することです。

開発では、すべての機能を自分で作るのではなく、既存の便利なパッケージを使うことがあります。

> まとめ: パッケージ管理は、外部の部品を安全に追加・共有・更新するための仕組みです。

## パッケージとは

パッケージは、再利用できる機能のまとまりです。

たとえば、次のようなものがあります。

- 画面を作るライブラリ
- 日付を扱うライブラリ
- コードを整形するツール
- テストを実行するツール

## 依存関係とは

プロジェクトが特定のパッケージに頼っている状態を、依存関係と呼びます。

たとえば、画面を作るためにReactを使っている場合、そのプロジェクトはReactに依存していると言えます。

Node.js系のプロジェクトでは、`package.json` に依存関係が書かれます。

```json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

Pythonのプロジェクトでは、`requirements.txt` に必要なパッケージを書くことがあります。

```txt
requests==2.31.0
fastapi==0.110.0
```

| 言語・環境 | 依存関係を書くファイルの例 | インストールするコマンドの例 |
| --- | --- | --- |
| Node.js | `package.json` | `npm install` |
| Python | `requirements.txt` | `pip install -r requirements.txt` |

## npm installの役割

`npm install` は、`package.json` に書かれた依存関係をもとに、必要なパッケージを入れる操作です。

```bash
npm install
```

これにより、`node_modules` にパッケージが入ります。

たとえば、`package.json` に次のような内容があるとします。

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0"
  }
}
```

この状態で `npm install` を実行すると、`axios` や `react` など、プロジェクトに必要なパッケージがインストールされます。

```txt
package.json
  ↓ npm install
node_modules に必要なパッケージが入る
```

READMEに次のように書かれている場合は、

```bash
npm install
npm run dev
```

「まず必要なパッケージを入れてから、開発用サーバーを起動してください」という意味です。

## Pythonのrequirements.txtの例

Pythonでは、`requirements.txt` に必要なパッケージを書くことがあります。

たとえば、APIを呼び出すために `requests` を使い、Web APIを作るために `fastapi` を使う場合は、次のように書きます。

```txt
requests==2.31.0
fastapi==0.110.0
```

このファイルをもとにパッケージをインストールするときは、次のようなコマンドを使います。

```bash
pip install -r requirements.txt
```

これは、「`requirements.txt` に書かれているパッケージをまとめて入れてください」という意味です。

```txt
requirements.txt
  ↓ pip install -r requirements.txt
Python環境に必要なパッケージが入る
```

## なぜファイルに書いて共有するのか

必要なパッケージをファイルに書いておくと、他の人も同じ準備をしやすくなります。

たとえば、GitHubからプロジェクトを取得した人は、次のような手順で環境をそろえられます。

| プロジェクト | 最初に見るファイル | よく使うコマンド |
| --- | --- | --- |
| Node.jsのプロジェクト | `package.json` | `npm install` |
| Pythonのプロジェクト | `requirements.txt` | `pip install -r requirements.txt` |

これにより、「自分のPCには入っているけれど、他の人のPCには入っていない」という差分を減らしやすくなります。

## Gitに入れるものと入れないもの

パッケージ管理では、依存関係を表すファイルはGitに入れます。一方で、インストールされたパッケージ本体はGitに入れないことが多いです。

| ファイル・フォルダ | Gitに入れるか | 理由 |
| --- | --- | --- |
| `package.json` | 入れる | 必要なNode.jsパッケージが分かる |
| `requirements.txt` | 入れる | 必要なPythonパッケージが分かる |
| `node_modules/` | 通常は入れない | `npm install` で再作成でき、容量が大きい |

> 依存関係の「リスト」は共有し、インストールされた「実体」は各自の環境で作る、と考えると整理しやすいです。

## FDE人材が押さえること

FDE人材としては、細かいパッケージの中身をすべて覚える必要はありません。

ただし、READMEに書かれたセットアップ手順を読んだときに、次の意味が分かると実務で会話しやすくなります。

| コマンド | ざっくりした意味 |
| --- | --- |
| `npm install` | Node.jsプロジェクトに必要なパッケージを入れる |
| `npm run dev` | 開発用サーバーなど、`package.json` に書かれた処理を実行する |
| `pip install -r requirements.txt` | Pythonプロジェクトに必要なパッケージをまとめて入れる |

> パッケージ管理を理解すると、READMEに書かれたセットアップ手順を読みやすくなります。

## 理解度チェック

Q1. パッケージ管理の説明として最も近いものはどれですか。

- A. Gitのブランチ名だけを管理すること
- B. プロジェクトで使う外部ライブラリやツールを管理すること
- C. 画像ファイルの色だけを自動で変えること
- D. 本番サーバーのIPアドレスだけを記録すること

解説: パッケージ管理は、プロジェクトで使う外部ライブラリやツールを追加・共有・更新しやすくするための仕組みです。

Q2. Node.jsプロジェクトで `npm install` を実行する主な目的はどれですか。

- A. `package.json` に書かれた依存関係をもとに必要なパッケージを入れる
- B. GitHubのPull Requestを作成する
- C. Pythonの仮想環境を削除する
- D. 本番データベースを初期化する

解説: `npm install` は、`package.json` に書かれた依存関係をもとに、必要なパッケージを `node_modules` に入れる操作です。

Q3. Pythonプロジェクトで `requirements.txt` に書かれたパッケージをまとめて入れるコマンドはどれですか。

- A. `npm run dev`
- B. `git install requirements.txt`
- C. `pip install -r requirements.txt`
- D. `node requirements.txt`

解説: Pythonでは、`pip install -r requirements.txt` で `requirements.txt` に書かれたパッケージをまとめてインストールできます。

Q4. `node_modules/` を通常Gitに入れない理由として最も近いものはどれですか。

- A. `node_modules/` は必ず秘密情報だけを保存するため
- B. `node_modules/` はPython専用のファイルだから
- C. `node_modules/` はGitのコミット履歴そのものだから
- D. `npm install` で再作成でき、容量も大きくなりやすいため

解説: 依存関係のリストである `package.json` を共有すれば、各自が `npm install` で `node_modules/` を再作成できます。

答え:

- Q1: B
- Q2: A
- Q3: C
- Q4: D
