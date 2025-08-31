import { translationManager, BatchTranslationRequest, BatchTranslationResult } from './translationService'
import { TranslationQualityChecker, QualityReport } from './qualityChecker'
import { TranslationStatsManager, TranslationSession, UsageStats } from './translationStats'
import { ResourcePackGenerator, ResourcePackOptions } from './resourcePackGenerator'

export interface ApiRequest {
  id: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  timestamp: Date
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
  requestId: string
}

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  handler: (request: ApiRequest) => Promise<ApiResponse>
  description: string
  requiresAuth?: boolean
}

export class LangPackStudioAPI {
  private static instance: LangPackStudioAPI
  private endpoints: Map<string, ApiEndpoint> = new Map()
  private apiKey: string | null = null
  private requests: ApiRequest[] = []

  constructor() {
    this.setupEndpoints()
  }

  static getInstance(): LangPackStudioAPI {
    if (!this.instance) {
      this.instance = new LangPackStudioAPI()
    }
    return this.instance
  }

  private setupEndpoints(): void {
    // 翻訳エンドポイント
    this.endpoints.set('POST /api/translate', {
      path: '/api/translate',
      method: 'POST',
      handler: this.handleTranslate.bind(this),
      description: 'Translate a batch of entries',
      requiresAuth: true
    })

    // 品質チェックエンドポイント
    this.endpoints.set('POST /api/quality-check', {
      path: '/api/quality-check',
      method: 'POST',
      handler: this.handleQualityCheck.bind(this),
      description: 'Check translation quality',
      requiresAuth: false
    })

    // 統計取得エンドポイント
    this.endpoints.set('GET /api/stats', {
      path: '/api/stats',
      method: 'GET',
      handler: this.handleGetStats.bind(this),
      description: 'Get usage statistics',
      requiresAuth: true
    })

    // リソースパック生成エンドポイント
    this.endpoints.set('POST /api/generate-pack', {
      path: '/api/generate-pack',
      method: 'POST',
      handler: this.handleGeneratePack.bind(this),
      description: 'Generate resource pack',
      requiresAuth: true
    })

    // API情報取得
    this.endpoints.set('GET /api/info', {
      path: '/api/info',
      method: 'GET',
      handler: this.handleApiInfo.bind(this),
      description: 'Get API information',
      requiresAuth: false
    })

    // ヘルスチェック
    this.endpoints.set('GET /api/health', {
      path: '/api/health',
      method: 'GET',
      handler: this.handleHealthCheck.bind(this),
      description: 'Health check endpoint',
      requiresAuth: false
    })
  }

  setApiKey(key: string): void {
    this.apiKey = key
  }

  async processRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
    authToken?: string
  ): Promise<ApiResponse> {
    const request: ApiRequest = {
      id: Date.now().toString(),
      endpoint: path,
      method,
      data,
      timestamp: new Date()
    }

    this.requests.push(request)
    
    // Keep only last 100 requests
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(-100)
    }

    const endpointKey = `${method} ${path}`
    const endpoint = this.endpoints.get(endpointKey)

    if (!endpoint) {
      return {
        success: false,
        error: `Endpoint not found: ${endpointKey}`,
        timestamp: new Date(),
        requestId: request.id
      }
    }

    // 認証チェック
    if (endpoint.requiresAuth && (!authToken || authToken !== this.apiKey)) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date(),
        requestId: request.id
      }
    }

    try {
      return await endpoint.handler(request)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        requestId: request.id
      }
    }
  }

  private async handleTranslate(request: ApiRequest): Promise<ApiResponse> {
    const { entries, from, to, service } = request.data

    if (!entries || !from || !to) {
      return {
        success: false,
        error: 'Missing required fields: entries, from, to',
        timestamp: new Date(),
        requestId: request.id
      }
    }

    if (service) {
      translationManager.setService(service)
    }

    const batchRequest: BatchTranslationRequest = {
      entries: entries.map((entry: any) => ({
        key: entry.key || entry.id,
        text: entry.text || entry.value
      })),
      from,
      to
    }

    const result = await translationManager.batchTranslate(batchRequest)

    return {
      success: result?.success || false,
      data: result,
      timestamp: new Date(),
      requestId: request.id
    }
  }

  private async handleQualityCheck(request: ApiRequest): Promise<ApiResponse> {
    const { translations } = request.data

    if (!translations || !Array.isArray(translations)) {
      return {
        success: false,
        error: 'Missing or invalid translations array',
        timestamp: new Date(),
        requestId: request.id
      }
    }

    const report = TranslationQualityChecker.generateQualityReport(
      translations.map((t: any) => ({
        key: t.key || t.id,
        original: t.original || t.source,
        translated: t.translated || t.target
      }))
    )

    return {
      success: true,
      data: report,
      timestamp: new Date(),
      requestId: request.id
    }
  }

  private async handleGetStats(request: ApiRequest): Promise<ApiResponse> {
    const days = request.data?.days || 30
    const stats = TranslationStatsManager.getUsageStats(days)

    return {
      success: true,
      data: stats,
      timestamp: new Date(),
      requestId: request.id
    }
  }

  private async handleGeneratePack(request: ApiRequest): Promise<ApiResponse> {
    const { files, options } = request.data

    if (!files || !Array.isArray(files)) {
      return {
        success: false,
        error: 'Missing or invalid files array',
        timestamp: new Date(),
        requestId: request.id
      }
    }

    try {
      const result = await ResourcePackGenerator.generateResourcePack(files, options)
      
      // ファイルデータをBase64で返す（バイナリデータのため）
      let fileData: string | undefined
      if (result.zipBlob) {
        const arrayBuffer = await result.zipBlob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        fileData = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
      }

      return {
        success: result.success,
        data: {
          ...result,
          zipBlob: undefined, // Blobは送信できないので除外
          fileData, // Base64エンコードされたファイルデータ
          fileName: `${options?.packName || 'resource-pack'}.zip`
        },
        timestamp: new Date(),
        requestId: request.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pack generation failed',
        timestamp: new Date(),
        requestId: request.id
      }
    }
  }

  private async handleApiInfo(request: ApiRequest): Promise<ApiResponse> {
    const endpoints = Array.from(this.endpoints.values()).map(endpoint => ({
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      requiresAuth: endpoint.requiresAuth || false
    }))

    return {
      success: true,
      data: {
        name: 'LangPack Studio API',
        version: '1.0.0',
        description: 'API for LangPack Studio translation tool',
        endpoints,
        authentication: {
          type: 'API Key',
          header: 'Authorization',
          format: 'Bearer <api-key>'
        },
        rateLimit: {
          requests: 1000,
          period: '1 hour'
        }
      },
      timestamp: new Date(),
      requestId: request.id
    }
  }

  private async handleHealthCheck(request: ApiRequest): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        uptime: Date.now() // 簡易的な稼働時間
      },
      timestamp: new Date(),
      requestId: request.id
    }
  }

  getApiDocumentation(): string {
    let doc = `# LangPack Studio API Documentation

## Authentication
Include your API key in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

`

    for (const endpoint of this.endpoints.values()) {
      doc += `### ${endpoint.method} ${endpoint.path}
${endpoint.description}
${endpoint.requiresAuth ? '**Requires Authentication**' : '**No Authentication Required**'}

`
    }

    doc += `
## Example Usage

### Translate Text
\`\`\`bash
curl -X POST http://localhost:3000/api/translate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entries": [
      {"key": "test.message", "text": "Hello World"}
    ],
    "from": "en",
    "to": "ja",
    "service": "google"
  }'
\`\`\`

### Check Translation Quality
\`\`\`bash
curl -X POST http://localhost:3000/api/quality-check \\
  -H "Content-Type: application/json" \\
  -d '{
    "translations": [
      {
        "key": "test.message",
        "original": "Hello %s",
        "translated": "こんにちは %s"
      }
    ]
  }'
\`\`\`

### Get Usage Statistics
\`\`\`bash
curl -X GET http://localhost:3000/api/stats?days=30 \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## Response Format
All endpoints return JSON with the following structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "1234567890"
}
\`\`\`

Error responses:
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00Z", 
  "requestId": "1234567890"
}
\`\`\`
`

    return doc
  }

  getRequestLogs(): ApiRequest[] {
    return [...this.requests]
  }

  clearLogs(): void {
    this.requests = []
  }
}

// 外部からアクセス可能なグローバルインスタンス
export const apiServer = LangPackStudioAPI.getInstance()