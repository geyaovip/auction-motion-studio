# Auction Motion Studio · 艺术品营销视频制作工作台

面向艺术品展示与拍卖营销场景的视频制作应用，将拍品图片、文字和价格信息组织为可预览、可调整、可在浏览器内导出的 MP4。项目以确定性排版与动效引擎为核心，减少同类内容反复调整版式的工作。

[核心引擎](src/engine/) · [导出实现](app/export/ExportClient.tsx) · [项目文档](docs/README.md)

当前提供源码与本地运行方式。

## 核心功能

| 模块 | 功能说明 |
| --- | --- |
| 项目与素材 | 维护视频项目、拍品图像及语义化内容输入。 |
| 模板生成 | 通过模板规则组织画面，统一处理布局、文字、图像和运动。 |
| 编辑与预览 | 查看场景时间线，调整内容并预览最终画面。 |
| 内容检查 | 对布局与输出进行质量检查，展示问题和阻断条件。 |
| 浏览器导出 | 检测编码能力，逐帧渲染 H.264 MP4，显示进度并下载文件。 |

## 工程设计

- **确定性引擎**：排版、字体、图像、时间线与动效计算集中在独立模块中。
- **预览与导出一致**：两者消费同一份 `ResolvedTimeline`，避免分别计算产生偏差。
- **语义化编辑**：用户调整业务内容与模板输入，由引擎计算布局参数。
- **输入校验**：使用 TypeScript 类型与 Zod Schema 约束外部和持久化数据。
- **本地项目存储**：工作区项目使用浏览器本地存储，视频渲染在浏览器执行。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 应用 | React、TypeScript、App Router 结构、vinext / Vite |
| 表单与状态 | React Hook Form、Zod、Zustand |
| 视频 | Remotion、Remotion Player、Web Renderer |
| 验证 | Vitest、ESLint、渲染 HTML 检查 |

## 本地运行

需要 Node.js 22.13+ 和支持相应浏览器媒体能力的桌面浏览器。

```bash
git clone https://github.com/geyaovip/auction-motion-studio.git
cd auction-motion-studio
npm ci
npm run dev
```

默认访问 [http://localhost:3000](http://localhost:3000)。

| 路由 | 用途 |
| --- | --- |
| `/` | 首页与模板入口 |
| `/workbench` | 项目工作台 |
| `/projects/new` | 创建视频项目 |
| `/editor` | 素材、场景时间线、预览与内容检查 |
| `/export` | 浏览器能力检查、渲染进度与文件下载 |

导出能力取决于当前浏览器的 H.264 编码支持；渲染时需保持页面运行。项目不是通用多轨剪辑器，也未提供云端协作与服务端渲染队列。

## 检查与目录

```bash
npm test
npx tsc --noEmit
npm run lint
npm run test:html
```

| 路径 | 用途 |
| --- | --- |
| [`app/`](app/) | 工作台、项目、编辑和导出页面 |
| [`src/engine/`](src/engine/) | 模板、排版、字体、动效、时间线和质量检查 |
| [`src/remotion/`](src/remotion/) | 视频组件与渲染适配 |
| [`src/schemas/`](src/schemas/) | 项目及工作区数据校验 |
| [`src/store/`](src/store/) | 编辑状态与测试 |
| [`docs/`](docs/) | 产品边界、实现规则和决策 |

开发前阅读 [AGENTS.md](AGENTS.md) 与[任务路由](docs/ROUTER.md)。最终成片质量应通过实际导出文件检查，不能只以编辑器预览或构建成功判断。
