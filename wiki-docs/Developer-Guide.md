# 👨‍💻 開発者ガイド

LangPack Studioの開発環境構築、ビルド方法、コントリビューション方法について説明します。

## 🏗️ 開発環境のセットアップ

### 必要なツール

#### Node.js
```bash
# Node.js 18以上が必要
node --version  # v18.0.0以上

# nvmを使用する場合
nvm install 18
nvm use 18
```

#### Git
```bash
git --version  # 任意のバージョン
```

#### エディタ
推奨エディタ：
- Visual Studio Code
- WebStorm
- Vim/Neovim

### プロジェクトのクローン
```bash
git clone https://github.com/Sumire-Labs/LangPack-Studio.git
cd LangPack-Studio
```

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスして開発版を確認できます。

## 📁 プロジェクト構造

```
LangPack-Studio/
├── src/                     # ソースコード
│   ├── components/          # Reactコンポーネント
│   │   ├── redesign/        # 新UI設計のコンポーネント
│   │   │   ├── views/       # 各ビュー（ステップ）のコンポーネント
│   │   │   ├── Header.tsx   # アプリケーションヘッダー
│   │   │   ├── Sidebar.tsx  # サイドバーナビゲーション
│   │   │   └── WelcomeScreen.tsx # ウェルカム画面
│   │   └── [legacy]/        # 旧UIコンポーネント
│   ├── utils/               # ユーティリティ関数
│   │   ├── fileParser.ts    # ファイル解析機能
│   │   ├── resourcePackGenerator.ts # リソースパック生成
│   │   └── translationService.ts # 翻訳サービス
│   ├── types/               # TypeScript型定義
│   ├── AppNew.tsx           # メインアプリケーション（新版）
│   ├── App.tsx              # メインアプリケーション（旧版）
│   └── main.tsx             # エントリーポイント
├── public/                  # 静的ファイル
├── electron/                # Electron関連ファイル
├── dist/                    # ビルド出力
├── wiki-docs/               # Wiki文書
├── package.json             # プロジェクト設定
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
└── README.md                # プロジェクト説明
```

## 🔧 技術スタック

### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **Material-UI v5**: UIコンポーネントライブラリ
- **Emotion**: CSS-in-JS
- **React Dropzone**: ファイルドラッグ&ドロップ

### ビルドツール
- **Vite**: 高速な開発サーバー・ビルドツール
- **Electron**: デスクトップアプリケーション化

### 翻訳サービス
- **Axios**: HTTP クライアント
- **各種翻訳API**: Google, DeepL, Azure, OpenAI, LibreTranslate

### ファイル処理
- **JSZip**: ZIP ファイル生成
- **File API**: ブラウザでのファイル処理

## 📝 コーディング規約

### TypeScript
```typescript
// ✅ 良い例
interface FileImportProps {
  files: ParsedFile[]
  onFilesChange: (files: ParsedFile[]) => void
}

const FileImport: React.FC<FileImportProps> = ({ files, onFilesChange }) => {
  // 実装
}

// ❌ 悪い例
const FileImport = (props: any) => {
  // 実装
}
```

### コンポーネント命名
```typescript
// ✅ PascalCase for components
export const TranslationPanel: React.FC<Props> = () => {}

// ✅ camelCase for functions
export const parseLanguageFile = (content: string) => {}

// ✅ UPPER_CASE for constants
export const DEFAULT_PACK_FORMAT = 55
```

### ファイル命名
```
✅ PascalCase.tsx     - React コンポーネント
✅ camelCase.ts       - ユーティリティ関数
✅ kebab-case.css     - スタイルファイル
```

## 🏗️ ビルドコマンド

### 開発ビルド
```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番用ビルド
npm run preview      # ビルド結果のプレビュー
```

### Electronビルド
```bash
npm run electron:dev    # Electron開発版
npm run electron:build  # Electron配布用パッケージ作成
```

### テスト
```bash
npm run test        # ユニットテスト実行
npm run test:watch  # テストのウォッチモード
npm run test:coverage # カバレッジレポート生成
```

### リント・フォーマット
```bash
npm run lint        # ESLintによるコードチェック
npm run lint:fix    # 自動修正可能なエラーの修正
npm run format      # Prettierによるコード整形
```

## 🧪 テスト

### テスト構造
```
src/
├── components/
│   └── __tests__/           # コンポーネントテスト
├── utils/
│   └── __tests__/           # ユーティリティテスト
└── __tests__/               # 統合テスト
```

### テストの書き方
```typescript
// utils/__tests__/fileParser.test.ts
import { parseJsonFile, parseLangFile } from '../fileParser'

describe('fileParser', () => {
  test('should parse JSON file correctly', () => {
    const content = '{"key": "value"}'
    const result = parseJsonFile(content)
    
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].key).toBe('key')
    expect(result.entries[0].value).toBe('value')
  })

  test('should handle invalid JSON', () => {
    const content = 'invalid json'
    expect(() => parseJsonFile(content)).toThrow()
  })
})
```

### コンポーネントテスト
```typescript
// components/__tests__/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Header from '../redesign/Header'

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme()
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('Header', () => {
  test('should toggle dark mode', () => {
    const mockToggle = jest.fn()
    renderWithTheme(
      <Header
        darkMode={false}
        onToggleDarkMode={mockToggle}
        onReset={() => {}}
      />
    )

    const darkModeButton = screen.getByLabelText(/ダークモード/i)
    fireEvent.click(darkModeButton)
    
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
```

## 🤝 コントリビューション方法

### 1. フォークとクローン
```bash
# GitHubでリポジトリをフォーク
# フォークしたリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/LangPack-Studio.git
cd LangPack-Studio
```

### 2. ブランチの作成
```bash
# 機能開発用ブランチ
git checkout -b feature/new-translation-api

# バグ修正用ブランチ
git checkout -b fix/file-parsing-error

# ドキュメント更新用ブランチ
git checkout -b docs/update-readme
```

### 3. 開発とテスト
```bash
# 開発環境を起動
npm run dev

# テストを実行
npm run test

# リントチェック
npm run lint
```

### 4. コミットとプッシュ
```bash
# ステージング
git add .

# コミット（コンベンショナルコミット形式）
git commit -m "feat: add DeepL translation service support"

# プッシュ
git push origin feature/new-translation-api
```

### 5. プルリクエスト作成

#### PRテンプレート
```markdown
## 概要
このPRは何を行いますか？簡潔に説明してください。

## 変更内容
- [ ] 新機能の追加
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] リファクタリング

## 詳細な変更点
- 変更点1: 説明
- 変更点2: 説明

## テスト
- [ ] 既存のテストがすべてパス
- [ ] 新しいテストを追加（必要に応じて）
- [ ] 手動テストを実行

## スクリーンショット
（UI変更がある場合）

## 関連Issue
Closes #123
```

## 🎯 開発ガイドライン

### 新機能開発

#### 1. 設計段階
1. Issueで機能要件を議論
2. 技術設計を文書化
3. APIインターフェースを定義

#### 2. 実装段階
1. TypeScriptの型定義を先に作成
2. テストケースを先に書く（TDD推奨）
3. 小さな単位でコミット

#### 3. レビュー段階
1. セルフレビューを実行
2. テストカバレッジを確認
3. ドキュメントを更新

### バグ修正

#### 1. 問題特定
1. 再現可能な最小ケースを作成
2. 根本原因を特定
3. テストケースで問題を再現

#### 2. 修正実装
1. 失敗するテストを先に書く
2. 最小限の変更で修正
3. 既存機能への影響を確認

## 🚀 リリースプロセス

### バージョニング（Semantic Versioning）
```
MAJOR.MINOR.PATCH

例: 1.2.3
- MAJOR: 破壊的変更
- MINOR: 新機能追加
- PATCH: バグ修正
```

### リリース手順
```bash
# 1. バージョンアップ
npm version patch  # または minor, major

# 2. ビルド
npm run build
npm run electron:build

# 3. タグプッシュ
git push --tags

# 4. GitHub Releasesで配布ファイルを公開
```

### 自動化（GitHub Actions）
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm run electron:build
      - uses: actions/upload-artifact@v3
```

## 📊 パフォーマンス最適化

### バンドルサイズ最適化
```bash
# バンドルサイズ分析
npm run analyze

# Tree shakingの確認
npm run build -- --analyze
```

### メモリ最適化
```typescript
// ✅ useMemoで計算結果をキャッシュ
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// ✅ useCallbackで関数をキャッシュ
const handleClick = useCallback(() => {
  // クリック処理
}, [dependency])
```

### レンダリング最適化
```typescript
// ✅ React.memoで不要な再レンダリングを防ぐ
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* レンダリング内容 */}</div>
})
```

## 🔍 デバッグ

### React Developer Tools
1. ブラウザ拡張をインストール
2. Components タブで状態確認
3. Profiler タブでパフォーマンス分析

### VSCode デバッグ設定
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug LangPack Studio",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.tsx",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 📚 さらなる学習リソース

### 公式ドキュメント
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [Electron](https://www.electronjs.org/)

### おすすめの参考資料
- [Clean Code](https://www.amazon.com/dp/0132350882)
- [Refactoring](https://www.amazon.com/dp/0134757599)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

このガイドに沿って開発を進めることで、高品質なコードを維持しながらLangPack Studioに貢献できます。質問があれば、GitHubのDiscussionsでお気軽にお尋ねください。