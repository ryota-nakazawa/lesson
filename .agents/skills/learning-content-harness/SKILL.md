---
name: learning-content-harness
description: 学習コンテンツ管理。HTML学習サイトで、レッスンの追加・更新・整理・検証を行うときに使う。course.json、Markdown本文、レッスンのメタデータ、content-bundle.js の再生成を扱い、index.html をサーバーなしで直接開ける状態に保つ。
---

# 学習コンテンツ管理

このスキルは、このワークスペースの学習サイト専用です。

## 目的

コンテンツは編集しやすいソースファイルとして管理しつつ、`index.html` は Finder や `file://` から直接開ける状態に保ちます。

編集元のファイルは次の2種類です。

- `content/git-basics/course.json`
- `content/git-basics/*.md`

ブラウザ表示用に生成されるファイルは次です。

- `content-bundle.js`

`content-bundle.js` は直接編集しません。必ずソースファイルから再生成します。

## 基本手順

1. `content/git-basics/course.json` を読み、既存のステージ、セクション、レッスン情報を確認する。
2. `content/git-basics/` 配下のMarkdownを追加または編集する。
3. `course.json` を更新し、適切な `stages[].sections[]` にレッスンを配置する。各レッスンには次の項目をそろえる。
   - `id`
   - `number`
   - `title`
   - `duration`
   - `author`
   - `updatedAt`
   - `file`
4. 次のコマンドを実行する。

```bash
node scripts/validate-content.js
node scripts/build-content-bundle.js
```

5. 検証結果と、`content-bundle.js` を再生成したことを報告する。

## コンテンツ作成ルール

- 各Markdownレッスンは、必ず1つの `#` 見出しから始める。
- 大きな区切りには `##` 見出しを使う。
- 手順や要点は箇条書きにして読みやすくする。
- 補足、ヒント、運用上の注意は引用ブロックで書く。
- 1つのレッスンには、1つの学習目的だけを持たせる。
- レッスンごとに毎回「FDE人材が押さえること」のような固定セクションを入れない。必要な場合だけ、内容に合う自然な見出しで実務上の観点を補足する。
- 新規レッスンや大きく作り直すレッスンには、ユーザーから明示されなくても `## 理解度チェック` を作成する。
- 理解度チェックを作成・更新するときは、`lesson-quiz-maker` スキルの方針に従い、正解位置をばらけさせる。

## レッスンを追加するとき

- `04-branch.md` のように、次の連番ファイル名を使う。
- 適切なステージ内のセクションにレッスンを追加する。
- 合うセクションがなければ、無理に既存セクションへ入れず、新しいセクションを追加する。
- 合うステージがなければ、新しいステージを追加する。
- `number` はコース全体で重複させない。

## 検証

更新後は必ず検証とバンドル再生成を行います。

```bash
node scripts/validate-content.js
node scripts/build-content-bundle.js
```

検証に失敗した場合は、先に `course.json` またはMarkdownを修正し、その後で再度バンドルを生成します。
