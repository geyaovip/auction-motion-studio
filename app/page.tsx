import Link from "next/link";
import { ArrowRight, Layers3, Play, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav shell">
        <Link href="/" className="brand">
          <span className="brand-mark">A</span>
          <span>Auction Motion Studio</span>
        </Link>
        <div className="nav-actions">
          <a href="#workflow" className="text-link">工作方式</a>
          <Link href="/editor" className="button button-dark button-small">
            打开工作台
          </Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> 为艺术品与拍卖而生</div>
          <h1>让每一件作品，<br />自然成为一支影片。</h1>
          <p>
            上传拍品图和基础资料，系统自动完成镜头结构、版式与动效，
            在浏览器中直接预览并导出高清 MP4。
          </p>
          <div className="hero-actions">
            <Link href="/editor" className="button button-dark">
              用示例开始创作 <ArrowRight size={17} />
            </Link>
            <a href="#templates" className="button button-ghost">
              浏览模板
            </a>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={15} /> 本地渲染</span>
            <span><Play size={15} /> 实时预览</span>
            <span><Layers3 size={15} /> 确定性版式</span>
          </div>
        </div>
        <div className="hero-stage" aria-label="产品预览">
          <div className="stage-orbit orbit-one" />
          <div className="stage-orbit orbit-two" />
          <div className="stage-card stage-card-back">
            <img src="/demo/artwork-detail.jpg" alt="" />
          </div>
          <div className="stage-card stage-card-front">
            <img src="/demo/artwork-main.jpg" alt="花卉作品视频画面" />
            <div className="stage-overlay">
              <span>LOT 18</span>
              <strong>Floral Study No. 7</strong>
              <small>ATELIER AUCTIONS · HONG KONG</small>
            </div>
          </div>
          <div className="stage-note">9:16 · 30 FPS · MP4</div>
        </div>
      </section>

      <section className="workflow shell" id="workflow">
        <div className="section-heading">
          <span>WORKFLOW</span>
          <h2>从资料到成片，保持简单。</h2>
        </div>
        <div className="workflow-grid">
          {[
            ["01", "添加作品", "导入主图与细节图，设置画面焦点。"],
            ["02", "生成结构", "选择用途，自动组织镜头、文字与节奏。"],
            ["03", "检查细节", "实时预览，调整时长并处理质量提示。"],
            ["04", "导出影片", "浏览器本地渲染，下载标准 MP4。"],
          ].map(([number, title, body]) => (
            <article key={number} className="workflow-card">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="template-section shell" id="templates">
        <div className="section-heading">
          <span>TEMPLATES</span>
          <h2>为不同拍卖叙事准备的三种结构。</h2>
        </div>
        <div className="template-grid">
          {[
            ["Artwork Showcase", "作品特写", "聚焦单件作品、细节与估价，适合社交媒体传播。", "showcase"],
            ["Auction Preview", "专场预告", "以多件精选拍品建立节奏，快速传达专场气质。", "preview"],
            ["Auction Result", "成交结果", "从作品与估价自然过渡到落槌结果，适合会后发布。", "result"],
          ].map(([en, zh, body, tone]) => (
            <Link href="/editor" className={`template-card template-${tone}`} key={en}>
              <div className="template-visual">
                <span>{en}</span>
                <i />
                <b>AMS</b>
              </div>
              <h3>{zh}</h3>
              <p>{body}</p>
              <span className="card-link">使用模板 <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-cta shell">
        <div>
          <span>READY WHEN YOU ARE</span>
          <h2>从第一件作品开始。</h2>
        </div>
        <Link href="/editor" className="button button-light">
          进入工作台 <ArrowRight size={17} />
        </Link>
      </section>
      <footer className="landing-footer shell">
        <span>Auction Motion Studio</span>
        <span>Deterministic motion, made for art.</span>
      </footer>
    </main>
  );
}
