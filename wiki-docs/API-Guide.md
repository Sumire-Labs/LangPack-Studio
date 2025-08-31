# 🔌 API統合ガイド

LangPack Studio の API 機能について詳しく解説します。この機能により、外部ツールやスクリプトから LangPack Studio の機能を利用できます。

## 🌐 API概要

LangPack Studio API は RESTful 設計に基づいており、以下の機能を提供します：

### 🔧 主要機能
- **翻訳API**: バッチ翻訳の実行
- **品質チェックAPI**: 翻訳品質の自動分析  
- **統計API**: 使用状況とコストデータの取得
- **リソースパック生成API**: Minecraftリソースパックの作成
- **システム情報API**: API仕様とヘルスチェック

### 🔐 セキュリティ
- **API キー認証**: Bearer Token による安全なアクセス
- **リクエスト制限**: 1時間あたり1000リクエスト制限
- **ログ管理**: すべてのAPIリクエストを記録

## 🚀 API セットアップ

### 1. API キーの設定

LangPack Studio の設定画面から API キーを生成・設定：

```javascript
// 設定例
const apiKey = "your-generated-api-key-here"
```

### 2. 基本認証ヘッダー

すべての認証が必要なリクエストに以下のヘッダーを含める：

```http
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

## 📋 API エンドポイント

### 🌐 翻訳API

#### `POST /api/translate`
バッチ翻訳を実行します。

**リクエスト例**:
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {"key": "menu.start", "text": "Start Game"},
      {"key": "menu.options", "text": "Options"}
    ],
    "from": "en",
    "to": "ja",
    "service": "google"
  }'
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "translations": [
      {
        "key": "menu.start",
        "original": "Start Game",
        "translated": "ゲームスタート"
      },
      {
        "key": "menu.options", 
        "original": "Options",
        "translated": "オプション"
      }
    ],
    "stats": {
      "successful": 2,
      "failed": 0,
      "totalCharacters": 18
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567890"
}
```

**パラメータ**:
- `entries`: 翻訳対象のエントリー配列
  - `key`: エントリーの識別子
  - `text`: 翻訳元テキスト
- `from`: 翻訳元言語コード（例: "en"）
- `to`: 翻訳先言語コード（例: "ja"）
- `service`: 使用する翻訳サービス（"google", "deepl", "azure", "openai", "gemini", "libretranslate"）

### 🎯 品質チェックAPI

#### `POST /api/quality-check`
翻訳品質を自動分析します（認証不要）。

**リクエスト例**:
```bash
curl -X POST http://localhost:3000/api/quality-check \
  -H "Content-Type: application/json" \
  -d '{
    "translations": [
      {
        "key": "test.message",
        "original": "Hello %s, you have %d messages",
        "translated": "こんにちは%s、%d件のメッセージがあります"
      }
    ]
  }'
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "totalChecked": 1,
    "totalIssues": 0,
    "errorCount": 0,
    "warningCount": 0,
    "averageScore": 100,
    "results": [
      {
        "key": "test.message",
        "originalText": "Hello %s, you have %d messages",
        "translatedText": "こんにちは%s、%d件のメッセージがあります",
        "issues": [],
        "score": 100
      }
    ],
    "summary": {
      "placeholderIssues": 0,
      "lengthWarnings": 0,
      "emptyTranslations": 0,
      "formattingIssues": 0,
      "consistencyIssues": 0
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567891"
}
```

### 📊 統計API

#### `GET /api/stats`
使用統計を取得します。

**リクエスト例**:
```bash
curl -X GET "http://localhost:3000/api/stats?days=30" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 25,
    "totalTranslations": 1250,
    "totalCharacters": 45000,
    "totalCost": 12.50,
    "averageQualityScore": 85.2,
    "serviceUsage": {
      "google": 500,
      "deepl": 300,
      "gemini": 250,
      "libretranslate": 200
    },
    "languagePairs": {
      "en-ja": 800,
      "en-ko": 250,
      "en-zh": 200
    },
    "dailyUsage": {
      "2024-01-01": 45,
      "2024-01-02": 38
    },
    "monthlyCosts": {
      "2024-01": 12.50
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567892"
}
```

**パラメータ**:
- `days`: 統計期間（デフォルト: 30日）

### 📦 リソースパック生成API

#### `POST /api/generate-pack`
Minecraftリソースパックを生成します。

**リクエスト例**:
```bash
curl -X POST http://localhost:3000/api/generate-pack \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {
        "path": "assets/minecraft/lang/ja_jp.json",
        "content": {
          "menu.singleplayer": "シングルプレイ",
          "menu.multiplayer": "マルチプレイ"
        }
      }
    ],
    "options": {
      "packName": "My Translation Pack",
      "packDescription": "Custom Japanese Translation",
      "packFormat": 34,
      "namespace": "minecraft"
    }
  }'
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "fileData": "UEsDBAoAAAAAAK1Vl1YAAAAAAAAAAAAAAAAcAAAAYXNzZXRzL21pbmVjcmFmdC9sYW5nL2phX2pwLmpzb24=",
    "fileName": "My Translation Pack.zip",
    "stats": {
      "totalFiles": 2,
      "totalSize": 1024
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567893"
}
```

**パラメータ**:
- `files`: リソースパックに含めるファイル配列
- `options`: パック設定（名前、説明、フォーマットなど）

### ℹ️ システム情報API

#### `GET /api/info`
API仕様情報を取得します（認証不要）。

**リクエスト例**:
```bash
curl -X GET http://localhost:3000/api/info
```

#### `GET /api/health`
システム状態を確認します（認証不要）。

**リクエスト例**:
```bash
curl -X GET http://localhost:3000/api/health
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0",
    "uptime": 1704067200000
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567895"
}
```

## 🔧 JavaScript SDK例

### 基本的なSDK実装

```javascript
class LangPackStudioAPI {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL || 'http://localhost:3000'
    this.apiKey = apiKey
  }

  async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json'
    }

    if (requiresAuth && this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`
    }

    const config = {
      method,
      headers
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(url, config)
    return await response.json()
  }

  // 翻訳実行
  async translate(entries, from, to, service = 'google') {
    return await this.request('/api/translate', 'POST', {
      entries, from, to, service
    })
  }

  // 品質チェック
  async qualityCheck(translations) {
    return await this.request('/api/quality-check', 'POST', {
      translations
    }, false)
  }

  // 統計取得
  async getStats(days = 30) {
    return await this.request(`/api/stats?days=${days}`)
  }

  // リソースパック生成
  async generatePack(files, options) {
    return await this.request('/api/generate-pack', 'POST', {
      files, options
    })
  }
}

// 使用例
const api = new LangPackStudioAPI('http://localhost:3000', 'your-api-key')

// 翻訳実行
const result = await api.translate([
  { key: 'test', text: 'Hello World' }
], 'en', 'ja', 'google')

console.log(result)
```

## 🐍 Python SDK例

```python
import requests
import json

class LangPackStudioAPI:
    def __init__(self, base_url='http://localhost:3000', api_key=None):
        self.base_url = base_url
        self.api_key = api_key

    def _request(self, endpoint, method='GET', data=None, requires_auth=True):
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if requires_auth and self.api_key:
            headers['Authorization'] = f"Bearer {self.api_key}"
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            data=json.dumps(data) if data else None
        )
        
        return response.json()

    def translate(self, entries, from_lang, to_lang, service='google'):
        return self._request('/api/translate', 'POST', {
            'entries': entries,
            'from': from_lang,
            'to': to_lang,
            'service': service
        })

    def quality_check(self, translations):
        return self._request('/api/quality-check', 'POST', {
            'translations': translations
        }, requires_auth=False)

    def get_stats(self, days=30):
        return self._request(f'/api/stats?days={days}')

# 使用例
api = LangPackStudioAPI(api_key='your-api-key')

result = api.translate([
    {'key': 'test', 'text': 'Hello World'}
], 'en', 'ja', 'google')

print(result)
```

## 🔄 CI/CD統合例

### GitHub Actions での自動翻訳

```yaml
name: Auto Translation

on:
  push:
    paths: ['src/lang/en_us.json']

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Translate to Japanese
        run: |
          curl -X POST "${{ secrets.LANGPACK_API_URL }}/api/translate" \
            -H "Authorization: Bearer ${{ secrets.LANGPACK_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d @- << EOF
          {
            "entries": $(cat src/lang/en_us.json | jq -r 'to_entries | map({key: .key, text: .value})'),
            "from": "en",
            "to": "ja",
            "service": "google"
          }
          EOF
```

## 📊 エラーハンドリング

### エラーレスポンス形式

```json
{
  "success": false,
  "error": "Missing required fields: entries, from, to",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567890"
}
```

### 一般的なエラーコード

| HTTPステータス | エラータイプ | 説明 |
|--------------|------------|------|
| **400** | Bad Request | リクエストパラメータが不正 |
| **401** | Unauthorized | API キーが無効または不正 |
| **404** | Not Found | エンドポイントが存在しない |
| **429** | Too Many Requests | レート制限を超過 |
| **500** | Internal Server Error | サーバー内部エラー |

## 💡 使用例とベストプラクティス

### 1. バッチ処理最適化

```javascript
// 大量データを小さなバッチに分割
const batchSize = 50
const entries = [...] // 1000件のエントリー

for (let i = 0; i < entries.length; i += batchSize) {
  const batch = entries.slice(i, i + batchSize)
  const result = await api.translate(batch, 'en', 'ja')
  
  // 結果を保存
  await saveBatchResult(result)
  
  // レート制限回避のため少し待機
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

### 2. エラー処理とリトライ

```javascript
async function translateWithRetry(entries, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await api.translate(entries, 'en', 'ja')
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) throw error
      
      // 指数バックオフで待機
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      )
    }
  }
}
```

### 3. 品質監視の自動化

```javascript
async function translateAndMonitor(entries) {
  // 翻訳実行
  const translateResult = await api.translate(entries, 'en', 'ja')
  
  // 品質チェック
  const qualityResult = await api.qualityCheck(
    translateResult.data.translations
  )
  
  // 品質が低い場合は警告
  if (qualityResult.data.averageScore < 80) {
    console.warn('Low quality translation detected!')
    // Slack/Discord通知など
  }
  
  return {
    translations: translateResult.data,
    quality: qualityResult.data
  }
}
```

## 🔐 セキュリティ考慮事項

### API キー管理
- **環境変数**: API キーはコードに直書きしない
- **権限分離**: 用途別に異なるAPI キーを使用
- **定期更新**: セキュリティのため定期的にキー更新

### 通信セキュリティ
- **HTTPS**: 本番環境では必ずHTTPS使用
- **レート制限**: 適切なリクエスト頻度を維持
- **ログ監視**: 不正アクセスの検知

---

API統合機能を活用して、LangPack Studio を様々なワークフローに組み込みましょう！