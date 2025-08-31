# 🌐 LangPack Studio

<div align="center">
  <img src="https://img.shields.io/badge/Minecraft-1.21.4-green" alt="Minecraft Version">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform">
  <img src="https://img.shields.io/badge/License-BSD--3--Clause-blue" alt="License">
  <img src="https://img.shields.io/badge/React-18-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript">
</div>

<div align="center">
  <h3>✨ MinecraftのModを簡単に翻訳してリソースパックを作成 ✨</h3>
  <p>Material Design 3を採用した美しいUIで、複雑な翻訳作業を直感的に行えるデスクトップアプリケーション</p>
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
  - 🔵 **Google Translate** (無料・有料)
  - 🟢 **DeepL** (高品質翻訳)
  - 🔷 **Azure Translator** (企業向け)
  - 🤖 **OpenAI GPT** (AI翻訳)
  - ✨ **Google Gemini** (AI翻訳・新登場)
  - 🆓 **LibreTranslate** (オープンソース)
- **バッチ翻訳**: 大量のテキストを効率的に処理
- **翻訳結果編集**: 手動での修正も可能
- **進行状況表示**: リアルタイムで翻訳進捗を確認

### 📦 **Minecraft互換リソースパック生成**
- **完全準拠**: pack.mcmetaの自動生成
- **バージョン対応**: 各Minecraftバージョンに最適化
- **ワンクリック出力**: ZIPファイルで即使用可能
- **プレビュー機能**: 生成前に内容を確認

### 🎨 **モダンUI/UX**
- **Material Design 3**: Googleの最新デザインガイドライン
- **ダークモード**: 目に優しい暗いテーマ
- **レスポンシブ**: あらゆる画面サイズに対応
- **ステップバイステップ**: 分かりやすいワークフロー
- **アニメーション**: スムーズで美しいトランジション

## 📸 スクリーンショット

<div align="center">

### ウェルカム画面
*美しいグラデーションと共に始まる翻訳の旅*

### ファイルインポート
*ドラッグ&ドロップで簡単にファイルを読み込み*

### 翻訳パネル
*5つの翻訳APIから最適なものを選択*

### プレビュー&確認
*翻訳結果を詳細に確認・編集*

### リソースパック生成
*ワンクリックでMinecraft用パックを作成*

</div>

## 🏃‍♂️ クイックスタート

### ダウンロード
```bash
# 最新リリースをダウンロード
https://github.com/Sumire-Labs/LangPack-Studio/releases
```

### 基本的な使い方
1. **📁 ファイルインポート**: 言語ファイルをドラッグ&ドロップ
2. **👁️ プレビュー**: 読み込まれた内容を確認
3. **🌐 翻訳**: お好みの翻訳APIを選択して実行
4. **📦 生成**: リソースパックを生成してダウンロード

### 対応ファイル形式
- `*.json` - Minecraft 1.13以降の標準形式
- `*.lang` - Minecraft 1.12以前の形式

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

## 🌍 翻訳API設定

### 無料オプション
- **LibreTranslate**: 完全無料、セルフホスト可能
- **Google Translate**: 制限付き無料利用

### 有料オプション（高品質）
| サービス | 料金目安 | 特徴 |
|---------|---------|------|
| **DeepL** | $6.99/月〜 | 最高品質、ヨーロッパ言語に強い |
| **Google Translate** | $20/100万文字 | 汎用性が高い、多言語対応 |
| **Google Gemini** | $0.00025/1Kトークン | 新世代AI、コスパ最高 |
| **Azure Translator** | $10/100万文字 | 企業向け、高い信頼性 |
| **OpenAI** | $0.002/1Kトークン | AI翻訳、文脈理解 |

詳細な設定方法は[翻訳設定ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Translation-Guide)をご覧ください。

## 📚 ドキュメント

| 📖 ガイド | 📝 内容 |
|----------|--------|
| [🏠 Home](https://github.com/Sumire-Labs/LangPack-Studio/wiki) | プロジェクト概要・クイックスタート |
| [📖 使い方ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/User-Guide) | 詳細な操作手順 |
| [🌐 翻訳設定ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Translation-Guide) | API設定と翻訳オプション |
| [🔧 トラブルシューティング](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Troubleshooting) | よくある問題と解決方法 |
| [👨‍💻 開発者ガイド](https://github.com/Sumire-Labs/LangPack-Studio/wiki/Developer-Guide) | ビルド方法とコントリビューション |

## 🤝 コントリビューション

LangPack Studioの改善にご協力ください！

### 貢献方法
1. **🍴 Fork** このリポジトリ
2. **🌿 Branch** を作成 (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** 変更 (`git commit -m 'feat: add amazing feature'`)
4. **🚀 Push** to Branch (`git push origin feature/amazing-feature`)
5. **📝 Pull Request** を作成

### 開発に参加
- **🐛 バグ報告**: [Issues](https://github.com/Sumire-Labs/LangPack-Studio/issues)
- **💡 機能提案**: [Discussions](https://github.com/Sumire-Labs/LangPack-Studio/discussions)
- **📖 ドキュメント**: [Wiki編集](https://github.com/Sumire-Labs/LangPack-Studio/wiki)

## 🎯 ロードマップ

### v1.1.0 (予定)
- [ ] 🎨 カスタムテーマサポート
- [ ] 📊 翻訳統計・レポート機能
- [ ] 🔄 自動バックアップ・復元
- [ ] 🌏 追加言語サポート (タイ語、ベトナム語など)

### v1.2.0 (予定)
- [ ] 🤖 機械学習による翻訳品質向上
- [ ] 👥 チーム共有・コラボレーション機能
- [ ] 🔌 プラグインシステム
- [ ] 📱 モバイル版対応

### v2.0.0 (未来)
- [ ] ☁️ クラウド同期
- [ ] 🎮 ゲーム内プレビュー
- [ ] 🎯 AI翻訳エンジン統合

## 📄 ライセンス

このプロジェクトは [BSD-3-Clause License](LICENSE.md) の下でライセンスされています。

## 🙏 謝辞

- **Material-UI Team** - 美しいコンポーネントライブラリ
- **React Team** - 素晴らしいフレームワーク
- **TypeScript Team** - 型安全な開発環境
- **Minecraft Community** - インスピレーションとフィードバック
- **翻訳API提供者** - 多言語対応を可能にするサービス

## 📞 サポート

### 💬 コミュニティ
- **GitHub Discussions**: 質問・アイデア交換
- **GitHub Issues**: バグ報告・機能要求
- **Wiki**: 詳細なドキュメント

### 📈 統計
![GitHub stars](https://img.shields.io/github/stars/Sumire-Labs/LangPack-Studio)
![GitHub forks](https://img.shields.io/github/forks/Sumire-Labs/LangPack-Studio)
![GitHub issues](https://img.shields.io/github/issues/Sumire-Labs/LangPack-Studio)
![GitHub license](https://img.shields.io/github/license/Sumire-Labs/LangPack-Studio)

---

<div align="center">
  <p>❤️ Made with love by <a href="https://github.com/Sumire-Labs">Sumire Labs</a></p>
  <p>🌟 あなたの⭐で応援してください！</p>
</div>