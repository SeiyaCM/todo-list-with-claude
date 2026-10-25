# インフラを AWS から Azure へ変更

- 日付: 2026-10-25

## 依頼
インフラはAzureにします。関係するファイルはすべて修正して

## 調査
リポジトリ全体で AWS 関連キーワード（aws, cdk, lambda, dynamodb, api gateway, terraform, oidc, serverless 等）を検索。
該当は `CLAUDE.md` の技術スタック欄のみ（`backend/` `frontend/` `infrastructure/` は `.gitkeep` のみ）。

## 対応
`CLAUDE.md` の技術スタックを以下のように置き換えた。

| 変更前 (AWS) | 変更後 (Azure) |
| --- | --- |
| AWS (サーバーレスアーキテクチャ) | Azure (サーバーレスアーキテクチャ) |
| AWS CDK | Bicep |
| Lambda | Azure Functions |
| API Gateway | Azure API Management |
| DynamoDB | Azure Cosmos DB |
| （フロント配信） | Azure Static Web Apps |
| Terraform (OIDC設定) | Terraform (GitHub Actions 用 Microsoft Entra ID フェデレーション資格情報) |
