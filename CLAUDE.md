# CLAUDE.md

## プロジェクト概要
日々のToDoを管理するアプリ

## 技術スタック
- TypeScript
- [React](https://github.com/facebook/react)
- [Hono](https://github.com/honojs/hono)
- AWS (サーバーレスアーキテクチャ)
- AWS CDK (Infrastructure as Code)
- Serverless (Lambda, API Gateway, DynamoDB 等)
- pnpm (パッケージマネージャー)
- Terraform (OIDC設定)

## CI/CD
- GitHub Actions を使用する

## テスト
- Vitest (ユニットテストフレームワーク)
- ユニットテストのカバレッジは条件網羅（Branch Coverage）で85%以上とする

## Linter
- [Biome](https://biomejs.dev/) を使用する

## コーディング規約
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) に準拠
- インデント: スペース2つ
- 文字列: シングルクォート使用
- セミコロン: 必須
- 改行コード: LF（`\n`）

## パッケージマネージャー
- npm / npx は使用禁止。pnpm / pnpx を使用すること
- パッケージ追加: `pnpm add <package>`
- スクリプト実行: `pnpm run <script>`
- npx相当: `pnpx` または `pnpm dlx`

## ディレクトリ構成
```
todo-list-with-claude/
├── CLAUDE.md
├── .agent/            # コーディングエージェントとの会話ログ
└── ...
```

## その他
- コーディングエージェントとの会話は `.agent/` ディレクトリに残すこと
