# LangPack Studio Wiki

<div align="center">
  <img src="https://img.shields.io/badge/Minecraft-1.21.x-green" alt="Minecraft Version">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/License-BSD--3--Clause-blue" alt="License">
</div>

## 🎯 概要

**LangPack Studio**は、MinecraftのModの言語ファイルを自動翻訳してリソースパックを作成するデスクトップアプリケーションです。Material Design 3を採用した美しいUIで、複雑な翻訳作業を簡単に行うことができます。

## ✨ 主な機能

### 📁 ファイル処理
- **多形式対応**: JSON、LANGファイルの読み込み
- **ドラッグ&ドロップ**: 直感的なファイル操作
- **バッチ処理**: 複数ファイルの同時処理

### 🌐 自動翻訳
- **6つの翻訳API対応**:
  - Google Translate（無料・有料）
  - DeepL（高品質）
  - Azure Translator（企業向け）
  - OpenAI GPT（AI翻訳）
  - Google Gemini（AI翻訳・新登場）
  - LibreTranslate（オープンソース）
- **バッチ翻訳**: 大量のテキストを効率的に処理
- **翻訳結果の編集**: 手動での修正も可能

### 🎯 翻訳品質チェック（NEW!）
- **包括的品質分析**: プレースホルダー、フォーマット、一貫性をチェック
- **スマートスコアリング**: 0-100点での品質評価
- **詳細レポート**: 問題点と改善提案を表示
- **フィルタリング機能**: エラー・警告・情報レベルで絞り込み

### 📊 翻訳統計・レポート（NEW!）
- **使用状況分析**: サービス別・言語ペア別の利用統計
- **コスト計算**: 各翻訳APIの推定コストを自動算出
- **パフォーマンス追跡**: 翻訳セッションの履歴と品質スコア
- **レコメンデーション**: 使用パターンに基づく改善提案

### 🔌 API統合（NEW!）
- **RESTful API**: 外部ツールとの連携を可能に
- **認証システム**: API キーによるセキュアなアクセス
- **完全ドキュメント**: 使用例付きのAPI仕様書
- **リクエストログ**: API使用履歴の追跡

### 📦 リソースパック生成
- **Minecraft標準準拠**: pack.mcmetaの自動生成
- **バージョン対応**: 各Minecraftバージョンに対応
- **圧縮出力**: ZIPファイルで即使用可能

### 🎨 現代的UI/UX
- **Material Design 3**: Googleの最新デザインガイドライン
- **ダークモード**: 目に優しい暗いテーマ
- **レスポンシブ**: 様々な画面サイズに対応
- **ステップバイステップ**: 分かりやすいワークフロー

## 🚀 クイックスタート

### 1. ダウンロード & インストール
```bash
# リリースページからダウンロード
https://github.com/Sumire-Labs/LangPack-Studio/releases

# または開発版をビルド
git clone https://github.com/Sumire-Labs/LangPack-Studio.git
cd LangPack-Studio
npm install
npm run dev
```

### 2. 基本的な使い方
1. **ファイルインポート**: 言語ファイルをドラッグ&ドロップ
2. **プレビュー**: 読み込まれた内容を確認
3. **翻訳**: 好みの翻訳APIを選択して実行
4. **生成**: リソースパックを生成してダウンロード

### 3. 初回セットアップ
- 翻訳を使用する場合は、使用するAPIのキーを設定してください
- 無料オプション（LibreTranslate）も利用可能です

## 📚 詳細ガイド

| セクション | 内容 |
|-----------|------|
| [📖 使い方ガイド](User-Guide) | 詳細な操作手順 |
| [🌐 翻訳設定ガイド](Translation-Guide) | API設定と翻訳オプション |
| [🎯 品質チェックガイド](Quality-Check-Guide) | 翻訳品質分析の使い方 |
| [📊 統計・レポートガイド](Statistics-Guide) | 使用統計とコスト分析 |
| [🔌 API統合ガイド](API-Guide) | 外部連携とAPI仕様 |
| [🔧 トラブルシューティング](Troubleshooting) | よくある問題と解決方法 |
| [👨‍💻 開発者ガイド](Developer-Guide) | ビルド方法とコントリビューション |

## 🤝 サポート

- **Issues**: [GitHub Issues](https://github.com/Sumire-Labs/LangPack-Studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sumire-Labs/LangPack-Studio/discussions)
- **Wiki**: このWiki全体で詳細な情報を提供

## 📄 ライセンス

BSD-3-Clause License - 詳細は [LICENSE.md](https://github.com/Sumire-Labs/LangPack-Studio/blob/main/LICENSE.md) を参照してください。

---

<div align="center">
  <p>❤️ Made with love by <a href="https://github.com/Sumire-Labs">Sumire Labs</a></p>
</div>