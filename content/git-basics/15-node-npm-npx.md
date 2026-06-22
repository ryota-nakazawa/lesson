# Node.js / npm / npxって何？

フロントエンド開発やWebアプリ開発では、`Node.js`、`npm`、`npx` という言葉がよく出てきます。

最初は似た言葉に見えますが、役割は違います。

```txt
Node.js: JavaScriptをPCやサーバーで動かすための実行環境
npm: パッケージを入れたり、スクリプトを実行したりする道具
npx: パッケージのコマンドを一時的に実行するためによく使う道具
```

> まとめ: Node.jsは実行環境、npmはパッケージ管理、npxはコマンドの一時実行、と考えると整理しやすいです。

## Node.jsとは

Node.jsは、JavaScriptをブラウザの外でも動かせるようにする実行環境です。

JavaScriptは、もともとブラウザ上で動く言語としてよく使われてきました。

たとえば、Webページ上でボタンを押したときの動きや、画面の一部を書き換える処理などに使われます。

Node.jsを使うと、JavaScriptを自分のPCやサーバー上でも実行できます。

```bash
node app.js
```

このように、`node` コマンドでJavaScriptファイルを実行できます。

フロントエンド開発でもNode.jsはよく使われます。ReactやViteなどの開発ツールは、内部でNode.jsを使って動くことが多いからです。

## npmとは

npmは、Node.jsと一緒に使われるパッケージ管理ツールです。

パッケージとは、誰かが作った便利な機能のまとまりです。ライブラリと呼ばれることもあります。

たとえば、画面を作るためのライブラリ、日付を扱うライブラリ、テストを実行するためのツールなどがあります。

npmを使うと、必要なパッケージをプロジェクトに追加できます。

```bash
npm install
```

また、特定のパッケージを追加するときは次のようにします。

```bash
npm install axios
```

この例では、`axios` というパッケージを追加しています。

> npmは、Node Package Managerの略として説明されることが多いです。現在はnpmという名前のツールとして覚えれば十分です。

## package.jsonとは

`package.json` は、Node.js系のプロジェクトでよく使われる設定ファイルです。

プロジェクトで使うパッケージや、よく実行するコマンドが書かれています。

たとえば、次のような内容です。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

この例では、`react` を使うことや、`dev`、`build` というスクリプトがあることが分かります。

`package.json` があるプロジェクトでは、次のようなコマンドをよく使います。

```bash
npm install
```

これは、`package.json` に書かれているパッケージをインストールする操作です。

## node_modulesとは

`npm install` を実行すると、`node_modules` というフォルダが作られることがあります。

`node_modules` には、プロジェクトで使うパッケージの実体が入ります。

```txt
team-app/
  package.json
  node_modules/
  src/
```

`node_modules` は中身が多くなりやすいフォルダです。Gitでは通常、`node_modules` をそのままコミットしません。

代わりに、`package.json` などを共有し、各自の環境で `npm install` して必要なパッケージを入れます。

> `node_modules` は「インストールされた部品置き場」と考えると分かりやすいです。

## npm runとは

`npm run` は、`package.json` に書かれたスクリプトを実行するために使います。

たとえば、`package.json` に次のような設定があるとします。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

このとき、次のコマンドで開発用サーバーを起動できます。

```bash
npm run dev
```

本番公開用のファイルを作るときは、次のようなコマンドを使うことがあります。

```bash
npm run build
```

実際に何が動くかは、`package.json` の `scripts` に書かれています。

> `npm run dev` や `npm run build` は魔法のコマンドではなく、`package.json` に書かれた処理を呼び出しています。

## npxとは

npxは、パッケージが提供するコマンドを一時的に実行するためによく使われる道具です。

たとえば、新しいプロジェクトを作るときに、次のようなコマンドを見ることがあります。

```bash
npx create-vite my-app
```

これは、`create-vite` というコマンドを使って、`my-app` というプロジェクトを作る例です。

もう少し具体的にいうと、`create-vite` は「Viteのプロジェクトを作るための道具」です。

この道具は、プロジェクトを作るときには必要ですが、作成後のアプリ本体で毎回使い続けるものではありません。

```txt
npx create-vite my-app
  ↓
create-vite という作成ツールを呼び出す
  ↓
my-app というプロジェクトを作る
  ↓
作成後は、my-app の中で npm install や npm run dev を使う
```

つまり、npxは「今だけこのコマンドを使いたい」という場面で便利です。

たとえば、次のような場面で使われます。

```bash
npx create-vite my-app
npx eslint .
npx prettier --write .
```

`create-vite` はプロジェクト作成、`eslint` はコードチェック、`prettier` はコード整形で使われることがあります。

npxを使うと、グローバルにインストールしていないコマンドでも実行しやすくなります。

ただし、インターネット上のパッケージを実行することもあるため、知らないコマンドをそのまま実行するのは危険です。公式ドキュメントや信頼できる手順か確認してから実行します。

## npmとnpxの違い

npmとnpxは名前が似ていますが、使う場面が違います。

```txt
npm install: パッケージをプロジェクトに入れる
npm run: package.jsonのscriptsを実行する
npx: パッケージのコマンドを一時的に実行する
```

たとえば、既存プロジェクトを動かすときは、次のような流れがよくあります。

```bash
npm install
npm run dev
```

新しいプロジェクトを作るときは、次のようなコマンドを見ることがあります。

```bash
npx create-vite my-app
```

初学者のうちは、まずこの使い分けを押さえれば十分です。

## フロントエンド開発でよく出てくる理由

フロントエンド開発では、画面を作るだけでなく、開発用サーバーを起動したり、本番公開用のファイルを作ったりします。

そのため、Node.js、npm、npxがよく出てきます。

```txt
開発を始める
  ↓ npm install
必要なパッケージを入れる
  ↓ npm run dev
ローカルサーバーで画面を確認する
  ↓ npm run build
公開用のファイルを作る
```

GitHubからプロジェクトを取得したあとに、READMEで次のような手順を見ることがあります。

```bash
npm install
npm run dev
```

これは、「必要なパッケージを入れて、開発用サーバーを起動してください」という意味です。

## 生成AIに相談するときの見方

Node.js系の開発でエラーが出たときは、生成AIに相談する前に次の情報を確認すると役立ちます。

- どのコマンドを実行したか
- `package.json` の `scripts` に何が書かれているか
- エラーメッセージ
- Node.jsやnpmのバージョン

バージョンは、次のコマンドで確認できます。

```bash
node -v
npm -v
```

たとえば、次のように相談できます。

```txt
`npm run dev` を実行したらエラーになりました。
Node.jsは v20.x、npmは 10.x です。
package.json の scripts は以下です。
エラーメッセージは以下です。
```

ここまで情報があると、原因を特定しやすくなります。

## まず押さえること

最初に押さえるべきことは次の4つです。

- Node.jsはJavaScriptをブラウザの外でも動かす実行環境
- npmはパッケージを入れたり、scriptsを実行したりする道具
- npxはパッケージのコマンドを一時的に実行するためによく使う道具
- `package.json` を見ると、使っているパッケージや実行できるコマンドが分かる

> Node.js、npm、npxが分かると、フロントエンド開発のREADMEに書かれた手順を読みやすくなります。

## 理解度チェック

Q1. Node.jsの説明として最も近いものはどれですか。

- A. JavaScriptをブラウザの外でも動かすための実行環境
- B. Gitのブランチを削除するコマンド
- C. 画像ファイルだけを圧縮するツール
- D. データベースの表を作る専用画面

解説: Node.jsは、JavaScriptを自分のPCやサーバー上でも実行できるようにする実行環境です。

Q2. GitHubから取得した既存プロジェクトで、`package.json` に書かれたパッケージを入れるときに使うコマンドとして最も近いものはどれですか。

- A. `node app.js`
- B. `npx create-vite my-app`
- C. `npm -v`
- D. `npm install`

解説: 既存プロジェクトでは、`npm install` で `package.json` に書かれている依存パッケージをインストールします。

Q3. `npm run dev` が実際に何を実行するか確認したいとき、まず見るべき場所はどれですか。

- A. `node_modules` の全ファイル
- B. ブラウザのブックマーク
- C. `package.json` の `scripts`
- D. GitHubのプロフィール画像

解説: `npm run dev` は、`package.json` の `scripts` に書かれている `dev` の処理を実行します。

Q4. `npx create-vite my-app` の説明として最も近いものはどれですか。

- A. `my-app` の中で毎回使い続けるライブラリを追加する
- B. `create-vite` というプロジェクト作成ツールを呼び出し、`my-app` を作る
- C. Gitのコミット履歴をすべて削除する
- D. 既存の `node_modules` を必ずGitHubへ送る

解説: `npx create-vite my-app` は、プロジェクト作成用のコマンドを呼び出して、新しいプロジェクトを作る例です。

Q5. npxを使うときの注意点として最も近いものはどれですか。

- A. 公式ドキュメントや信頼できる手順か確認してから実行する
- B. 知らないコマンドでも必ず安全なので確認しなくてよい
- C. npxはインターネット上のパッケージとは一切関係しない
- D. npxを使えばNode.jsは不要になる

解説: npxでは外部のパッケージが提供するコマンドを実行することがあるため、信頼できる手順か確認してから使うことが大切です。

答え:

- Q1: A
- Q2: D
- Q3: C
- Q4: B
- Q5: A
