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

## 📜 説明

本ツールは以下の方を対象としています：
- **個人利用目的**の方
- どうしても日本語リソースパックを使用したい方

### ⚠️ 重要な注意事項

### 翻訳品質について
本ツールの翻訳は以下の特徴があります：
- **機械翻訳とAI翻訳**をメインとして使用
- **翻訳精度は低品質**です
- 専門の翻訳者による高品質な日本語訳とは**比べ物にならないレベル**

### 利用目的の制限
- あくまで「**どうしても日本語訳が欲しい**」という個人的な需要を満たすためのツール
- 公式配布や商用利用は想定していません

## 🚫 禁止事項

以下の行為は**絶対に行わないでください**：

- 本ツールで生成したものを自作リソースパックや公式翻訳リソースパックなどと宣伝する行為
- 生成した言語ファイルを使用して翻訳元Modに言語追加のIssueを送信する行為
- 低品質な翻訳リソースパックを広めるような行為全般

### 禁止する理由
- 低品質な翻訳リソースパックが広まることで、品質低下を招く可能性
- 公式Modや翻訳者に迷惑をかける恐れ

## 利用上の心構え

本ツールをご利用の際は、上記の注意事項を十分に理解し、**個人の範囲内での利用**に留めていただくようお願いいたします。

## 🚀 機能

### 📁 **スマートファイル処理**
- **多形式対応**: JSON、LANGファイルの自動解析
- **ドラッグ&ドロップ**: 直感的なファイル操作
- **バッチ処理**: 複数ファイルの同時処理
- **エラー検出**: 不正なファイル形式を自動検出

### 🌐 **翻訳システム**
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

## 💰 License

このプロジェクトは [BSD-3-Clause License](LICENSE.md) の下でライセンスされています。
