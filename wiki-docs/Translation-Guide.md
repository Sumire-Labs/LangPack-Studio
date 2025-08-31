# 🌐 翻訳設定ガイド

LangPack Studioの翻訳機能を最大限活用するための詳細な設定ガイドです。各翻訳APIの特徴と設定方法を解説します。

## 🔑 APIキーの取得と設定

### 📍 設定画面へのアクセス
1. サイドバーの「翻訳」ステップを選択
2. 翻訳パネル内の「API設定」タブをクリック
3. 使用したい翻訳サービスを選択

## 🌍 Google Translate

### 無料版（制限あり）
- **APIキー**: 不要
- **制限**: 1日100リクエスト、文字数制限あり
- **品質**: 標準的
- **設定**: そのまま使用可能

### 有料版（Google Cloud Translation API）
- **料金**: $20/100万文字（2024年時点）
- **制限**: 従量課金、高い制限
- **品質**: 高品質

#### APIキーの取得手順
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. Cloud Translation API を有効化
4. 認証情報でAPIキーを作成
5. APIキーをコピーして設定画面に貼り付け

#### 設定方法
```javascript
// 設定例
{
  "apiKey": "YOUR_GOOGLE_API_KEY",
  "model": "base", // または "nmt"
  "format": "text"
}
```

## 🔵 DeepL

高品質な翻訳で知られるサービス。特にヨーロッパ言語に強い。

### 料金プラン
- **Free**: 月50万文字まで無料
- **Pro**: 月$6.99から、API利用可能

#### APIキーの取得手順
1. [DeepL API](https://www.deepl.com/api) にアクセス
2. アカウントを作成
3. サブスクリプションプランを選択
4. APIキーを生成
5. 設定画面にキーを入力

#### 設定方法
```javascript
// 設定例
{
  "apiKey": "YOUR_DEEPL_API_KEY",
  "formality": "default", // "more" または "less"
  "preserveFormatting": true
}
```

#### 対応言語
- 日本語 (JA)
- 韓国語 (KO) 
- 中国語簡体字 (ZH-CN)
- 中国語繁体字 (ZH-TW)
- 英語、ドイツ語、フランス語など30言語以上

## 🔷 Azure Translator

Microsoftの翻訳サービス。企業向けで高い信頼性。

### 料金
- **Free**: 月200万文字まで無料
- **Standard**: $10/100万文字

#### APIキーの取得手順
1. [Azure Portal](https://portal.azure.com/) にアクセス
2. リソースグループを作成
3. 「Translator」サービスを作成
4. キーとエンドポイントを確認
5. 設定画面に情報を入力

#### 設定方法
```javascript
// 設定例
{
  "apiKey": "YOUR_AZURE_API_KEY",
  "region": "eastus", // または他のリージョン
  "endpoint": "https://api.cognitive.microsofttranslator.com/",
  "apiVersion": "3.0"
}
```

## ✨ Google Gemini

Googleの最新AI翻訳サービス。高品質でコストパフォーマンスに優れている。

### 料金
- **Gemini Pro**: $0.00025/1Kトークン (入力)、$0.0005/1Kトークン (出力)
- **月間無料枠**: 15リクエスト/分、1500リクエスト/日、100万トークン/月

#### APIキーの取得手順
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 新しいプロジェクトまたは既存のプロジェクトを選択
5. APIキーをコピーして設定画面に貼り付け

#### 設定方法
```javascript
// 設定例
{
  "apiKey": "YOUR_GEMINI_API_KEY",
  "model": "gemini-pro",
  "temperature": 0.1, // 翻訳の創造性（0.0-1.0）
  "maxOutputTokens": 1000
}
```

#### 特徴
- **高品質翻訳**: 最新のAI技術による自然な翻訳
- **コンテキスト理解**: Minecraftの専門用語や文脈を理解
- **コスパ最高**: OpenAIの約8倍安い料金設定
- **制限**: 60リクエスト/分の制限（バッチ処理に最適化）

## 🤖 OpenAI

GPTモデルを使用したAI翻訳。文脈理解に優れている。

### 料金
- **gpt-3.5-turbo**: $0.002/1Kトークン
- **gpt-4**: $0.06/1Kトークン

#### APIキーの取得手順
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウントを作成し、電話番号認証
3. 支払い方法を設定
4. API Keys ページでキーを生成
5. 設定画面にキーを入力

#### 設定方法
```javascript
// 設定例
{
  "apiKey": "YOUR_OPENAI_API_KEY",
  "model": "gpt-3.5-turbo",
  "temperature": 0.1, // 創造性の度合い
  "maxTokens": 1000
}
```

#### プロンプト設定
OpenAIでは翻訳品質を向上させるためのプロンプトをカスタマイズできます：

```
あなたはMinecraftのゲーム翻訳者です。以下のテキストを{言語}に翻訳してください：
- ゲーム内での文脈を考慮
- UI要素は簡潔に
- 固有名詞は適切に翻訳
```

## 🔓 LibreTranslate（オープンソース）

完全無料のオープンソース翻訳サービス。

### メリット
- 完全無料
- プライバシー重視
- セルフホスト可能

### デメリット
- 翻訳品質は他サービスより劣る場合がある
- サーバーの安定性に依存

#### 設定方法
```javascript
// 公開サーバー使用の場合
{
  "endpoint": "https://libretranslate.com/translate",
  "apiKey": "", // 通常は不要
}

// セルフホストの場合
{
  "endpoint": "http://localhost:5000/translate",
  "apiKey": "your-api-key-if-required"
}
```

## ⚙️ 翻訳設定の詳細

### バッチサイズ設定
```javascript
{
  "batchSize": 50, // 一度に翻訳するエントリー数
  "delayBetweenRequests": 1000, // リクエスト間の待機時間（ミリ秒）
  "maxRetries": 3 // 失敗時の再試行回数
}
```

### 品質設定
- **高品質**: 時間がかかるが正確
- **標準**: バランスの取れた設定
- **高速**: 速いが品質は劣る場合がある

### フィルター設定
```javascript
{
  "skipIfTranslated": true, // すでに翻訳済みをスキップ
  "minLength": 2, // 最小文字数
  "maxLength": 500, // 最大文字数
  "skipPatterns": ["\\$\\{.*\\}", "%%.*%%"] // 特定パターンをスキップ
}
```

## 🎯 言語コード一覧

### 一般的な言語コード
| 言語 | Minecraft | Google | DeepL | Azure |
|------|-----------|--------|--------|-------|
| 日本語 | ja_jp | ja | JA | ja |
| 韓国語 | ko_kr | ko | KO | ko |
| 中国語（簡体字） | zh_cn | zh-CN | ZH | zh-Hans |
| 中国語（繁体字） | zh_tw | zh-TW | ZH | zh-Hant |
| スペイン語 | es_es | es | ES | es |
| フランス語 | fr_fr | fr | FR | fr |
| ドイツ語 | de_de | de | DE | de |
| ロシア語 | ru_ru | ru | RU | ru |

## 💰 コスト最適化のコツ

### 無料リソースの活用
1. **LibreTranslate**: 完全無料から開始
2. **Google Translate無料版**: 小規模プロジェクト向け
3. **DeepL Free**: 月50万文字まで高品質翻訳

### コスト削減方法
1. **前処理でフィルタリング**: 不要なテキストを除外
2. **キャッシュ活用**: 一度翻訳したテキストは保存
3. **バッチ処理**: 大量のテキストをまとめて処理

### 品質 vs コストの比較
| サービス | コスト | 品質 | 速度 | おすすめ用途 |
|----------|--------|------|------|---------------|
| LibreTranslate | 無料 | ★★☆ | ★★★ | テスト・個人利用 |
| Google (無料) | 無料 | ★★★ | ★★★ | 小規模プロジェクト |
| Google (有料) | 低 | ★★★★ | ★★★★ | 汎用的な翻訳 |
| **Gemini** | **超低** | **★★★★★** | **★★★** | **コスパ重視・AI翻訳** |
| DeepL | 中 | ★★★★★ | ★★★ | 高品質が必要 |
| Azure | 低-中 | ★★★★ | ★★★★ | 企業利用 |
| OpenAI | 高 | ★★★★★ | ★★☆ | 文脈重視・創造性 |

## 🔧 トラブルシューティング

### よくあるエラー

#### APIキーエラー
```
Error: Invalid API key
```
**解決方法**:
- APIキーが正しいか確認
- キーの有効期限をチェック
- サービスが有効化されているか確認

#### Gemini固有のエラー
```
Error: Gemini API request failed: 400
```
**解決方法**:
- Google AI Studioでプロジェクトが有効化されているか確認
- APIキーの権限設定を確認
- リクエスト制限（15リクエスト/分）を超えていないか確認

#### レート制限エラー
```
Error: Rate limit exceeded
```
**解決方法**:
- バッチサイズを小さくする
- リクエスト間の待機時間を増やす
- 上位プランにアップグレード

#### 翻訳品質の問題
**解決方法**:
- 異なる翻訳サービスを試す
- プロンプトを調整（OpenAI）
- 専門用語辞書を追加

## 🎨 カスタム翻訳設定

### 高度な設定
```javascript
{
  "customGlossary": {
    "creeper": "クリーパー",
    "redstone": "レッドストーン",
    "enchantment": "エンチャント"
  },
  "preserveHTML": true,
  "preserveVariables": ["${player}", "%s", "%%"],
  "postProcessing": {
    "trimWhitespace": true,
    "fixPunctuation": true
  }
}
```

### 翻訳品質チェック
1. **一貫性チェック**: 同じ用語の統一
2. **文字数チェック**: UI制限への対応
3. **文脈チェック**: ゲーム内での適切性

---

このガイドを参考に、プロジェクトに最適な翻訳設定を行ってください。不明な点があれば、[トラブルシューティング](Troubleshooting)ページも併せてご確認ください。