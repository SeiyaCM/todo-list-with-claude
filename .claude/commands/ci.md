CI相当のチェックをローカルで実行してください。以下を順番に実行し、結果をまとめて報告してください。

## 1. Backend チェック
```
cd backend
pnpm run lint
pnpm run typecheck
pnpm run test
```

## 2. Frontend チェック
```
cd frontend
pnpm run lint
pnpm run typecheck
pnpm run test
```

## 3. Infrastructure チェック
```
cd infrastructure
pnpm run lint
pnpm run typecheck
```

## 報告
- 各ステップの成功/失敗を一覧で報告してください
- 失敗があれば原因と修正方法を提案してください
