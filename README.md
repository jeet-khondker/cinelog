# CineLog - 映画検索＆日記アプリ

CineLogは、OMDb APIを利用した映画検索およびお気に入り管理アプリケーションです。
モダンなフルスタック技術（React + NestJS + PostgreSQL）を使用し、直感的なUIとセキュアな認証機能を備えています。

## 🚀 主な機能

- **ユーザー認証**: JWTを使用したセキュアなサインアップ・ログイン機能。
- **映画検索**: OMDb APIと連携したリアルタイム検索。
- **無限スクロール/ページネーション**: 「もっと見る」ボタンによる追加データの取得。
- **詳細表示**: モーダルウィンドウによる、あらすじ・監督・キャスト・評価の詳細表示。
- **お気に入り管理**: お気に入りの追加・削除。重複登録防止機能付き。
- **通知システム**: 操作結果をスタイリッシュなトースト通知で表示。
- **ダークモード対応**: Mantine UIによるモダンなダークテーマデザイン。

## 🛠 技術スタック

### フロントエンド

- **Framework**: React (Vite) / TypeScript
- **UI Library**: Mantine UI (@mantine/core, @mantine/hooks, @mantine/notifications)
- **State Management**: Zustand (Persist対応)
- **Icons**: React Icons (Ionicons 5)
- **HTTP Client**: Axios

### バックエンド

- **Framework**: NestJS / TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport-JWT
- **External API**: OMDb API

## 📦 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/jeet-khondker/cinelog.git
cd cinelog
```

### 2. バックエンドの設定

```bash
cd backend
npm install
```

`.env`ファイルを作成し、以下の情報を設定してください：

```
DATABASE_URL="postgresql://user:password@localhost:5432/cinelog"
JWT_SECRET="your_secret_key"
OMDB_API_KEY="your_omdb_api_key"
```

データベースのセットアップ：

```bash
npx prisma migrate dev
npm run start:dev
```

### 3. フロントエンドの設定

```bash
cd frontend
npm install
npm run dev
```

## テスト用ユーザー認証情報

ログインする時、以下のメールアドレスとpパスワードを使用して下さい。これはテスト用です。

```bash
メールアドレス: "test-user@example.com"
パスワード: "new-password-789"
```

## 📸 プレビュー

### ログイン画面

![ログイン画面](images/login.png)

### ホーム画面

![ホーム画面](images/home.png)

### 動画検索結果画面

![動画検索結果画面](images/search-result.png)

### 動画詳細モダール画面

![動画詳細モダール画面](images/movie-detail.png)

### お気に入り一覧画面

![お気に入り一覧画面](images/my-favorites.png)

## 📄 ライセンス

### MIT License