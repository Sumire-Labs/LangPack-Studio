# 🌐 LangPack Studio

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.2.1--alpha-purple" alt="Version">
  <img src="https://img.shields.io/badge/Minecraft-1.21.4-green" alt="Minecraft Version">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/License-BSD--3--Clause-blue" alt="License">
  <img src="https://img.shields.io/badge/React-18-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript">
</div>

<div align="center">
  <h3>MinecraftのModを簡単に翻訳してリソースパックを作成</h3>
  <p>複雑な翻訳作業を直感的に行えるWebアプリケーション</p>
</div>

---

## 🚀 主な機能

### 📁 **スマートファイル処理**
- **多形式対応**: JSON、LANGファイルの自動解析
- **ドラッグ&ドロップ**: 直感的なファイル操作
- **バッチ処理**: 複数ファイルの同時処理
- **エラー検出**: 不正なファイル形式を自動検出

### 🌐 **多言語翻訳システム**
- **6つの翻訳API対応**:
  - **Google Translate** (無料)
  - **DeepL** (無料)
  - **Azure Translator** (有料)
  - **OpenAI GPT** (AI翻訳・有料)
  - **Google Gemini** (AI翻訳・無料)
  - **LibreTranslate** (無料)
- **バッチ翻訳**: 大量のテキストを効率的に処理
- **翻訳結果編集**: 手動での修正も可能
- **進行状況表示**: 翻訳進捗のバーを表示

### 🎯 **翻訳品質チェック**
- **包括的品質分析**: プレースホルダー、フォーマット、一貫性をチェック
- **詳細レポート**: 問題点と改善提案を表示
- **フィルタリング機能**: エラー・警告・情報レベルで絞り込み
- **エクスポート対応**: 品質レポートのJSON出力

### 📊 **翻訳統計・レポート**
- **使用状況分析**: サービス別・言語ペア別の利用統計
- **コスト計算**: 各翻訳APIの推定コストを自動算出
- **パフォーマンス追跡**: 翻訳セッションの履歴と品質スコア
- **レコメンデーション**: 使用パターンに基づく改善提案
- **データエクスポート**: CSV・JSON形式での統計出力

### 🔌 **API統合**
- **RESTful API**: 外部ツールとの連携を可能に
- **認証システム**: API キーによるセキュアなアクセス
- **完全ドキュメント**: 使用例付きのAPI仕様書
- **リクエストログ**: API使用履歴の追跡
- **ヘルスチェック**: システム状態の監視

### 📦 **Minecraftリソースパック生成**
- **完全準拠**: pack.mcmetaの自動生成
- **バージョン対応**: 各Minecraftバージョンに最適化
- **ワンクリック出力**: ZIPファイルで即使用可能
- **プレビュー機能**: 生成前に内容を確認

## 🛠️ 開発者向け

### 環境要件
- **Node.js**: 18.0.0以上
- **npm**: 8.0.0以上

### セットアップ
```bash
# プロジェクトのクローン
git clone https://github.com/Sumire-Labs/LangPack-Studio.git
cd LangPack-Studio

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 利用可能なスクリプト
```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run preview       # ビルド結果のプレビュー
npm run test          # テスト実行
npm run lint          # ESLintによるコードチェック
npm run electron:dev  # Electron開発版起動
npm run electron:build # Electron配布版ビルド
```

### 技術スタック
- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI v5 (Material Design 3)
- **Styling**: Emotion (CSS-in-JS)
- **Build Tool**: Vite
- **Desktop**: Electron
- **File Processing**: JSZip, File API
- **HTTP Client**: Axios
- **Quality Analysis**: 独自開発の品質チェックエンジン
- **Statistics**: localStorage + 統計分析システム
- **API Server**: Express.js風のルーティングシステム

## 🌍 翻訳API設定

### オプション

| サービス | 料金目安 | 特徴 |
|---------|---------|------|
| **DeepL** | $6.99/月〜 | 高品質 |
| **Google Translate** | $20/100万文字 | 汎用性が高い |
| **Google Gemini** | $0.00025/1Kトークン | AI翻訳 |
| **Azure Translator** | $10/100万文字 | 企業向け |
| **OpenAI** | $0.002/1Kトークン | AI翻訳 |

詳細な設定方法は[翻訳設定ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Translation-Guide)をご覧ください。

## 📚 ドキュメント

| 📖 ガイド | 📝 内容 |
|----------|--------|
| [🏠 Home](https://github.com/Sumire-Labs/LangPack-Studio/wiki) | プロジェクト概要・クイックスタート |
| [📖 使い方ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/User-Guide) | 詳細な操作手順 |
| [🌐 翻訳設定ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Translation-Guide) | API設定と翻訳オプション |
| [🎯 品質チェックガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Quality-Check-Guide) | 翻訳品質分析の使い方 |
| [📊 統計・レポートガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Statistics-Guide) | 使用統計とコスト分析 |
| [🔌 API統合ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/API-Guide) | 外部連携とAPI仕様 |
| [🔧 トラブルシューティング](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Troubleshooting) | よくある問題と解決方法 |
| [👨‍💻 開発者ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Developer-Guide) | ビルド方法とコントリビューション |

## 💰 License

このプロジェクトは [BSD-3-Clause License](LICENSE.md) の下でライセンスされています。
