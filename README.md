# Team Learning Library

チームで共有したい学習コンテンツを、カテゴリ別に整理して閲覧するための静的HTMLハーネスです。`index.html` をブラウザで開くだけで動作し、コンテンツ本文は Markdown、一覧やカテゴリは JSON で管理します。

## 概要

- 画面本体: `index.html`
- 表示ロジック: `app.js`
- スタイル: `styles.css`
- コンテンツ定義: `content/git-basics/course.json`
- Markdown本文: `content/git-basics/*.md`
- ブラウザ用バンドル: `content-bundle.js`
- 更新用スキル: `.agents/skills/learning-content-harness/SKILL.md`

`content-bundle.js` は生成物です。直接編集せず、`course.json` と Markdown を編集してから再生成します。

## コンテンツ一覧

### FDE人材に向けた基礎知識

- Gitの基礎
  - Gitの全体像
  - コミットと変更履歴
  - ブランチとマージ
  - Pull Requestとレビュー
  - 状態を確認する: status / diff
  - 変更を記録する: add / commit
  - リモートとやりとりする: pull / push
  - 基本ワークフロー
- IT基礎用語
  - APIって何？
  - Dockerって何？
  - CLI/コマンドって何？

### 生成AI関連

- AIエージェント基礎
  - Agent skillsって何？
  - ハーネス設計って何？

## コンテンツの更新方法

Codex でこのリポジトリを開いた状態で、`learning-content-harness` スキルを使って更新します。

基本の流れ:

1. `content/git-basics/course.json` にカテゴリやレッスン情報を追加・編集する
2. `content/git-basics/` に Markdown 本文を追加・編集する
3. 検証を実行する
4. `content-bundle.js` を再生成する

実行コマンド:

```bash
node scripts/validate-content.js
node scripts/build-content-bundle.js
```

Markdown は必ず `#` 見出しから始めます。画像を差し込みたい場合は、Markdown の標準記法を使えます。

```md
![説明文](images/topic/example.png)
```

この例では、画像ファイルを `content/git-basics/images/topic/example.png` に置きます。画像はトピック単位のディレクトリに分け、相対パス画像は検証時に存在チェックされます。

## 検索機能

画面上部の検索欄から、コンテンツを絞り込めます。

検索対象:

- レッスンタイトル
- カテゴリ名
- セクション名
- 所要時間
- 著者
- 更新日
- Markdown本文

カテゴリボタンでは、`FDE人材に向けた基礎知識` や `生成AI関連` のような大カテゴリ単位で表示を切り替えられます。カテゴリは `course.json` の `stages` から、ナビゲーション内の小見出しは `sections` から自動生成されます。
