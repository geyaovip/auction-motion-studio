# Auction Motion Studio

面向艺术品与拍卖业务的确定性营销视频工作台。项目可将拍品图片、文字与价格信息组合为可预览、可调整并可在浏览器内直接导出的 MP4。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`：

- `/`：产品首页与模板入口
- `/editor`：素材、场景时间线、预览与内容检查
- `/export`：浏览器能力检查、H.264 MP4 渲染与下载

## 质量检查

```bash
npm test
npx tsc --noEmit
npm run lint
npm run test:html
```

## 文档路由

开发前先阅读 [AGENTS.md](./AGENTS.md) 和 [docs/README.md](./docs/README.md)。规则文档按任务拆分，避免每次加载完整 SDS。
