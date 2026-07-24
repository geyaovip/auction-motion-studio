"use client";

import Link from "next/link";
import { Player } from "@remotion/player";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { AuctionComposition } from "@/src/remotion/AuctionComposition";
import { useProjectStore } from "@/src/store/projectStore";
import type { AssetInput, Currency } from "@/src/types/project";

const inspectFile = (file: File): Promise<AssetInput> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () =>
      resolve({
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url,
        fileName: file.name,
        mimeType: file.type,
        width: image.naturalWidth,
        height: image.naturalHeight,
        alt: file.name,
        focalPoint: { x: 0.5, y: 0.5 },
      });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取这张图片"));
    };
    image.src = url;
  });

const Field = ({
  label,
  value,
  onCommit,
  type = "text",
}: {
  label: string;
  value: string | number | undefined;
  onCommit: (value: string) => void;
  type?: "text" | "number";
}) => (
  <label className="field">
    <span>{label}</span>
    <input
      key={`${label}-${value ?? ""}`}
      type={type}
      defaultValue={value ?? ""}
      onBlur={(event) => onCommit(event.currentTarget.value)}
    />
  </label>
);

export function EditorClient() {
  const store = useProjectStore();
  const lot = store.project.lots[0];
  const selected =
    store.timeline.scenes.find((scene) => scene.id === store.selectedSceneId) ??
    store.timeline.scenes[0];

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        store.addArtwork(await inspectFile(file));
      } catch {
        // The visible store validation state handles unsupported assets.
      }
    }
  };

  return (
    <main className="studio">
      <header className="studio-header">
        <div className="studio-header-left">
          <Link href="/" className="icon-button" aria-label="返回首页">
            <ArrowLeft size={17} />
          </Link>
          <Link href="/" className="brand brand-compact">
            <span className="brand-mark">A</span>
            <span>Auction Motion Studio</span>
          </Link>
          <span className="header-divider" />
          <strong className="project-name">{store.project.projectName}</strong>
        </div>
        <div className="studio-toolbar">
          <button
            className="icon-button"
            aria-label="撤销"
            disabled={!store.history.length}
            onClick={store.undo}
          >
            <Undo2 size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="重做"
            disabled={!store.future.length}
            onClick={store.redo}
          >
            <Redo2 size={16} />
          </button>
          <select
            aria-label="模板"
            value={store.project.templateId}
            onChange={(event) =>
              store.setTemplate(
                event.target.value as typeof store.project.templateId,
              )
            }
          >
            <option value="artwork-showcase">作品特写</option>
            <option value="auction-preview">专场预告</option>
            <option value="auction-result">成交结果</option>
          </select>
          <select
            aria-label="画幅"
            value={store.project.aspectRatio}
            onChange={(event) =>
              store.setAspectRatio(
                event.target.value as typeof store.project.aspectRatio,
              )
            }
          >
            <option value="9:16">9:16 竖屏</option>
            <option value="16:9">16:9 横屏</option>
            <option value="1:1">1:1 方形</option>
          </select>
          <select
            aria-label="主题"
            value={store.project.themeId}
            onChange={(event) =>
              store.setTheme(event.target.value as typeof store.project.themeId)
            }
          >
            <option value="classic-dark">典藏深色</option>
            <option value="classic-light">画廊浅色</option>
          </select>
          <button className="button button-ghost button-small" onClick={store.generate}>
            <Sparkles size={15} /> 重新生成
          </button>
          <Link href="/export" className="button button-dark button-small">
            <Download size={15} /> 导出
          </Link>
        </div>
      </header>

      <div className="studio-grid">
        <aside className="panel asset-panel">
          <div className="panel-title">
            <div>
              <span>素材</span>
              <small>{lot.images.length} 张图片</small>
            </div>
          </div>
          <label className="upload-drop">
            <ImagePlus size={20} />
            <strong>添加作品图片</strong>
            <span>JPG、PNG 或 WebP</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleFiles(event.target.files)}
            />
          </label>
          <div className="asset-list">
            {lot.images.map((asset, index) => (
              <article className="asset-item" key={asset.id}>
                <img src={asset.url} alt={asset.alt || asset.fileName || ""} />
                <div className="asset-meta">
                  <strong>{index === 0 ? "主图" : `细节 ${index}`}</strong>
                  <span>{asset.width} × {asset.height}</span>
                </div>
                <button
                  className="bare-button"
                  aria-label={`删除图片 ${index + 1}`}
                  onClick={() => store.removeArtwork(asset.id)}
                >
                  <Trash2 size={14} />
                </button>
                <div className="focal-controls">
                  <label>
                    <span>水平焦点</span>
                    <input
                      aria-label={`图片 ${index + 1} 水平焦点`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={asset.focalPoint?.x ?? 0.5}
                      onChange={(event) =>
                        store.setFocalPoint(
                          asset.id,
                          Number(event.target.value),
                          asset.focalPoint?.y ?? 0.5,
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>垂直焦点</span>
                    <input
                      aria-label={`图片 ${index + 1} 垂直焦点`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={asset.focalPoint?.y ?? 0.5}
                      onChange={(event) =>
                        store.setFocalPoint(
                          asset.id,
                          asset.focalPoint?.x ?? 0.5,
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
          <button className="reset-button" onClick={store.resetDemo}>
            <RotateCcw size={14} /> 恢复演示项目
          </button>
        </aside>

        <section className="workspace">
          <div className="preview-area">
            <div
              className={`player-shell player-${store.project.aspectRatio.replace(":", "-")}`}
            >
              <Player
                component={AuctionComposition}
                inputProps={{ project: store.project, timeline: store.timeline }}
                durationInFrames={store.timeline.totalDurationInFrames}
                fps={store.timeline.fps}
                compositionWidth={store.timeline.canvas.width}
                compositionHeight={store.timeline.canvas.height}
                controls
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="preview-status">
              <span>{selected?.label ?? "Preview"}</span>
              <span>
                {(store.timeline.totalDurationInFrames / store.timeline.fps).toFixed(1)}s
                · {store.timeline.canvas.width} × {store.timeline.canvas.height}
              </span>
            </div>
          </div>

          <div className="timeline">
            <div className="timeline-header">
              <span>场景时间线</span>
              <small>点击选择 · 调整顺序与时长</small>
            </div>
            <div className="scene-strip">
              {store.scenes.map((scene, index) => (
                <article
                  key={scene.id}
                  className={`scene-card ${
                    store.selectedSceneId === scene.id ? "selected" : ""
                  } ${scene.enabled ? "" : "disabled"}`}
                  onClick={() => store.selectScene(scene.id)}
                >
                  <div className="scene-index">{String(index + 1).padStart(2, "0")}</div>
                  <strong>{scene.label}</strong>
                  <span>{(scene.durationInFrames / 30).toFixed(1)}s</span>
                  <div className="scene-actions">
                    <button
                      aria-label="向前移动"
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        store.reorderScene(index, index - 1);
                      }}
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      aria-label="减少时长"
                      onClick={(event) => {
                        event.stopPropagation();
                        store.updateSceneDuration(scene.id, scene.durationInFrames - 15);
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      aria-label="增加时长"
                      onClick={(event) => {
                        event.stopPropagation();
                        store.updateSceneDuration(scene.id, scene.durationInFrames + 15);
                      }}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      aria-label="向后移动"
                      disabled={index === store.scenes.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        store.reorderScene(index, index + 1);
                      }}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                  <label className="scene-toggle" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={scene.enabled}
                      onChange={() => store.toggleScene(scene.id)}
                    />
                    启用
                  </label>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="panel inspector">
          <div className="panel-title">
            <div>
              <span>内容与检查</span>
              <small>失焦时保存字段</small>
            </div>
          </div>
          {store.formError ? (
            <div className="inline-error"><AlertCircle size={15} /> {store.formError}</div>
          ) : null}
          <details open>
            <summary>项目资料</summary>
            <div className="field-grid">
              <Field
                label="项目名称"
                value={store.project.projectName}
                onCommit={store.updateProjectName}
              />
              <Field
                label="拍卖标题"
                value={store.project.auction?.title}
                onCommit={(value) => store.updateAuction({ title: value })}
              />
              <Field
                label="副标题"
                value={store.project.auction?.subtitle}
                onCommit={(value) => store.updateAuction({ subtitle: value })}
              />
              <Field
                label="日期"
                value={store.project.auction?.date}
                onCommit={(value) => store.updateAuction({ date: value })}
              />
              <Field
                label="地点"
                value={store.project.auction?.location}
                onCommit={(value) => store.updateAuction({ location: value })}
              />
              <Field
                label="拍卖机构"
                value={store.project.auction?.houseName}
                onCommit={(value) => store.updateAuction({ houseName: value })}
              />
            </div>
          </details>
          <details open>
            <summary>拍品资料</summary>
            <div className="field-grid">
              <Field
                label="作品名称"
                value={lot.title}
                onCommit={(value) => store.updateLot(lot.id, { title: value })}
              />
              <Field
                label="艺术家"
                value={lot.artist}
                onCommit={(value) => store.updateLot(lot.id, { artist: value })}
              />
              <div className="two-fields">
                <Field
                  label="创作年份"
                  value={lot.year}
                  onCommit={(value) => store.updateLot(lot.id, { year: value })}
                />
                <Field
                  label="拍品号"
                  value={lot.lotNumber}
                  onCommit={(value) => store.updateLot(lot.id, { lotNumber: value })}
                />
              </div>
              <Field
                label="材质"
                value={lot.medium}
                onCommit={(value) => store.updateLot(lot.id, { medium: value })}
              />
              <Field
                label="尺寸"
                value={lot.dimensions}
                onCommit={(value) => store.updateLot(lot.id, { dimensions: value })}
              />
              <div className="two-fields">
                <Field
                  label="估价下限"
                  type="number"
                  value={lot.estimateLow}
                  onCommit={(value) =>
                    store.updateLot(lot.id, {
                      estimateLow: value ? Number(value) : undefined,
                    })
                  }
                />
                <Field
                  label="估价上限"
                  type="number"
                  value={lot.estimateHigh}
                  onCommit={(value) =>
                    store.updateLot(lot.id, {
                      estimateHigh: value ? Number(value) : undefined,
                    })
                  }
                />
              </div>
              <label className="field">
                <span>币种</span>
                <select
                  value={lot.currency}
                  onChange={(event) =>
                    store.updateLot(lot.id, {
                      currency: event.target.value as Currency,
                    })
                  }
                >
                  {["USD", "GBP", "EUR", "HKD", "CNY", "SGD"].map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
              </label>
              <Field
                label="成交价"
                type="number"
                value={lot.salePrice}
                onCommit={(value) =>
                  store.updateLot(lot.id, {
                    salePrice: value ? Number(value) : undefined,
                  })
                }
              />
            </div>
          </details>
          <details open className="quality-section">
            <summary>
              质量检查
              <span className={`score score-${store.qualityReport.passed ? "good" : "warn"}`}>
                {store.qualityReport.score}
              </span>
            </summary>
            {store.qualityReport.issues.length ? (
              <div className="issue-list">
                {store.qualityReport.issues.map((issue, index) => (
                  <div className={`issue issue-${issue.severity}`} key={`${issue.code}-${index}`}>
                    <AlertCircle size={14} />
                    <div>
                      <strong>{issue.code}</strong>
                      <span>{issue.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="quality-pass">
                <CheckCircle2 size={16} /> 所有关键检查均已通过
              </div>
            )}
          </details>
        </aside>
      </div>
      <div className="mobile-export">
        <Link href="/export" className="button button-dark">
          导出成片 <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
