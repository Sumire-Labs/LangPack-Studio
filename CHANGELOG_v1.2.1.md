# 📋 Changelog - v1.2.1-alpha

## [1.2.1-alpha] - 2025-01-02

### 🐛 **Bug Fixes**
- **言語ファイル名の修正** 
  - 翻訳先言語に応じた正しいファイル名を生成（例：fi_fi.json、fr_fr.json）
  - 従来は全て en_us.json になっていた問題を修正
  - `src/utils/resourcePackGenerator.ts` Line 147の修正

- **レガシーMinecraftバージョン対応**
  - Pack Format 3以下で正しく.lang拡張子を使用するよう修正
  - 1.12.2などの古いバージョンで拡張子なしファイルが生成される問題を解決
  - `src/utils/resourcePackGenerator.ts` Line 109-110の修正

### 🌐 **Web Server Configuration**
- **公開Webサーバー対応**
  - app.pepeyukke.jp での公開設定完了
  - Cloudflare統合（SSL/TLS、Origin Rules）
  - ポート8080での安定動作

### 🔧 **Technical Improvements**
- **Vite設定更新**
  - allowedHosts にサブドメイン追加
  - ポート設定の最適化（8080）
- **ファイル名サニタイゼーション強化**
  - Windows予約語チェック改善
  - クロスプラットフォーム対応

### 📊 **Server Deployment**
- **LocalStorage実装確認**
  - APIキーは各ユーザーのブラウザに保存
  - サーバー側にユーザーデータは保存されない
  - 完全なクライアントサイド動作

---

## [1.2.0-alpha] - 2025-01-02 

### 🚀 **Major Features**
- パフォーマンス最適化（60-80%高速化）
- 翻訳キャッシュシステム
- 並列処理・バッチ最適化
- レガシーMinecraftバージョン対応（1.7.10～1.12.2）
- 最新バージョン対応（1.21.8、1.21.9-snapshot）
- Gemini 2.0 Flash対応
- クロスプラットフォーム配布準備