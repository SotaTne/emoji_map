# Emoji Map 実装仕様書 (SPEC) - モノレポ構成

## 1. プロジェクト概要
現在地に絵文字と気持ちを投稿できる地図アプリ。
Firebase + Google Maps + React 19 を活用した教育用デモ。モノレポ構成によりフロント・バックの型共有を実現。

---

## 2. 技術スタック

| 役割 | 採用 | 備考 |
|---|---|---|
| フレームワーク | React 19 (TypeScript) | `web/` |
| バックエンド | Firebase Cloud Functions | `functions/` (Node.js) |
| 共有 | pnpm workspaces | `shared/` (型定義・共通ロジック) |
| ビルド | Vite | `web/` |
| スタイリング | Tailwind CSS v4 | Radix UI Primitives 併用 |
| 地図 | @vis.gl/react-google-maps | |
| 認証 | Firebase Authentication | Googleログイン |
| DB | Firestore | |

---

## 3. ディレクトリ構成 (Flat Monorepo)

```
/
├── web/               # React 19 フロントエンド
│   ├── src/
│   │   ├── lib/       # Firebase初期化, 地図関連utils
│   │   ├── contexts/  # データ解決のProvider (Posts, Auth)
│   │   ├── hooks/     # Contextへの窓口
│   │   ├── components/# ui, models, views, layouts
│   │   └── pages/     # MapPage 等の合成
├── functions/         # Firebase Cloud Functions
│   ├── src/           # 投稿トリガーによる進捗・XP計算ロジック
├── shared/            # 共通パッケージ
│   ├── src/
│   │   └── index.ts   # Post, User, Mission 等の共通型定義
├── firebase.json      # 全体のFirebase設定
└── pnpm-workspace.yaml
```

---

## 4. アーキテクチャの原則

### 4-1. Shared Types (型共有)
- `shared` パッケージで定義した型を `web` と `functions` 両方でインポート。
- 手動での型定義の書き直しを排除し、型安全な開発を促進。

### 4-2. Async React 19 (web)
- データの取得は Promise を `use(promise)` で解決する。
- フォーム送信などの副作用は React 19 の Actions を活用。

### 4-3. Cloud Functions (Backend Logic)
- クライアントからの投稿をトリガーに、進捗（Progress）やXP、レベルの計算を実行。
- セキュリティとデータの整合性をサーバーサイドで担保。

---

## 5. データの流れ
1. **投稿**: `web` (Action) -> Firestore (`posts`)
2. **トリガー**: Firestore への書き込みを検知 -> `functions` 起動
3. **計算**: `functions` がユーザーの進捗・XPを計算 -> Firestore (`users`, `progress`) 更新
4. **反映**: `web` (Snapshot) -> ユーザーにレベルアップや進捗をリアルタイム通知
