"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { Player, type PlayerRef } from "@remotion/player";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Download,
  ImagePlus,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { AuctionComposition } from "@/src/remotion/AuctionComposition";
import {
  readWorkspaceProject,
  saveWorkspaceProject,
} from "@/src/lib/workspaceStorage";
import { useProjectStore } from "@/src/store/projectStore";
import type { AssetInput, Currency } from "@/src/types/project";

const inspectFile = (file: File): Promise<AssetInput> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("无法读取这张图片"));
        return;
      }
      const image = new Image();
      image.onload = () =>
        resolve({
          id: `asset-${file.name}-${file.size}-${image.naturalWidth}x${image.naturalHeight}`,
          url: reader.result as string,
          fileName: file.name,
          mimeType: file.type,
          width: image.naturalWidth,
          height: image.naturalHeight,
          alt: file.name,
          focalPoint: { x: 0.5, y: 0.5 },
        });
      image.onerror = () => reject(new Error("无法读取这张图片"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("无法读取这张图片"));
    reader.readAsDataURL(file);
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
      onBlur={(event) => {
        if (event.currentTarget.value !== String(value ?? "")) {
          onCommit(event.currentTarget.value);
        }
      }}
    />
  </label>
);

const FocalPointPicker = ({
  asset,
  index,
  title,
  onChange,
}: {
  asset: AssetInput;
  index: number;
  title: string;
  onChange: (x: number, y: number) => void;
}) => {
  const x = asset.focalPoint?.x ?? 0.5;
  const y = asset.focalPoint?.y ?? 0.5;
  const updateFromPointer = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    onChange(
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
    );
  };
  const updateFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.05;
    const next = {
      ArrowLeft: [x - step, y],
      ArrowRight: [x + step, y],
      ArrowUp: [x, y - step],
      ArrowDown: [x, y + step],
      Home: [0.5, 0.5],
    }[event.key];
    if (!next) return;
    event.preventDefault();
    onChange(next[0], next[1]);
  };

  return (
    <div className="focal-editor">
      <div
        className="focal-picker"
        role="button"
        tabIndex={0}
        aria-label={`图片 ${index + 1} 主体位置，水平 ${Math.round(x * 100)}%，垂直 ${Math.round(y * 100)}%`}
        onClick={updateFromPointer}
        onKeyDown={updateFromKeyboard}
      >
        <img src={asset.url} alt={asset.alt ?? title} />
        <span
          className="focal-marker"
          style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          aria-hidden="true"
        >
          <Crosshair size={16} />
        </span>
      </div>
      <div className="focal-caption">
        <span>{index === 0 ? "主图" : `细节 ${index}`}</span>
        <button
          type="button"
          className="focal-reset"
          disabled={x === 0.5 && y === 0.5}
          onClick={() => onChange(0.5, 0.5)}
        >
          恢复居中
        </button>
      </div>
      <p>点击图片中的主体位置，画面裁切时会优先保留这里。</p>
    </div>
  );
};

export function EditorClient({ projectId }: { projectId?: string }) {
  const store = useProjectStore();
  const playerRef = useRef<PlayerRef>(null);
  const loadedProjectId = useRef<string>();
  const skipNextSave = useRef(false);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const record = readWorkspaceProject(projectId);
    if (!record) return;
    const alreadyLoaded =
      loadedProjectId.current === projectId &&
      store.project.projectName === record.project.projectName &&
      store.project.templateId === record.project.templateId &&
      store.project.lots.length === record.project.lots.length &&
      store.project.lots[0]?.id === record.project.lots[0]?.id;
    if (alreadyLoaded) return;
    skipNextSave.current = true;
    store.loadProject(record.project);
    loadedProjectId.current = projectId;
  }, [projectId, store]);

  useEffect(() => {
    if (!projectId || loadedProjectId.current !== projectId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const current = readWorkspaceProject(projectId);
    if (!current) return;
    saveWorkspaceProject({
      ...current,
      updatedAt: new Date().toISOString(),
      progress: Math.max(current.progress, 75),
      project: store.project,
    });
  }, [projectId, store.project]);

  const lot =
    store.project.lots.find((item) => item.id === store.selectedLotId) ??
    store.project.lots[0];
  const selected =
    store.timeline.scenes.find((scene) => scene.id === store.selectedSceneId) ??
    store.timeline.scenes[0];

  const sceneImages = useMemo(
    () =>
      new Map(
        store.project.lots.map((item) => [
          item.id,
          item.images[0]?.url ?? "/demo/artwork-main.jpg",
        ]),
      ),
    [store.project.lots],
  );

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

  const handleCoverFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      store.setProjectCover(await inspectFile(file));
    } catch {
      // The visible store validation state handles unsupported assets.
    }
  };

  const previewScene = (sceneId: string) => {
    store.selectScene(sceneId);
    const scene = store.timeline.scenes.find((item) => item.id === sceneId);
    if (scene) {
      playerRef.current?.pause();
      playerRef.current?.seekTo(
        Math.min(
          scene.endFrame - 1,
          scene.startFrame +
            (scene.motionPreset === "resultImpact" ? 44 : 24),
        ),
      );
    }
  };

  return (
    <main className="studio">
      <header className="studio-header">
        <div className="studio-header-left">
          <Link
            href="/workbench"
            className="icon-button"
            aria-label="返回工作台"
          >
            <ArrowLeft size={17} />
          </Link>
          <Link href="/workbench" className="brand brand-compact">
            <span className="brand-mark">拍</span>
            <span>拍卖影像工作室</span>
          </Link>
          <span className="header-divider" />
          <div className="project-identity">
            <strong>{store.project.projectName}</strong>
            <span>本地草稿 · 自动保存</span>
          </div>
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
          <button
            className="button button-ghost button-small"
            onClick={store.generate}
          >
            <Sparkles size={15} /> 重新生成
          </button>
          <Link href="/export" className="button button-dark button-small">
            <Download size={15} /> 导出
          </Link>
        </div>
      </header>

      <div className="studio-grid studio-grid-lots">
        <aside className="panel lot-panel">
          <div className="panel-title panel-title-action">
            <div>
              <span>拍品</span>
              <small>{store.project.lots.length} 件拍品</small>
            </div>
            <button
              className="icon-button"
              aria-label="添加拍品"
              onClick={store.addLot}
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="lot-list">
            {store.project.lots.map((item) => (
              <button
                className={`lot-row ${
                  item.id === lot.id ? "selected" : ""
                }`}
                key={item.id}
                type="button"
                onClick={() => store.selectLot(item.id)}
              >
                <img src={item.images[0]?.url} alt={item.title} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.lotNumber ?? "未填写拍品号"}</small>
                </span>
                <i />
              </button>
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
                ref={playerRef}
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
              <span>{selected?.label ?? "预览"}</span>
              <span>
                {(store.timeline.totalDurationInFrames / store.timeline.fps).toFixed(1)}s
                · {store.timeline.canvas.width} × {store.timeline.canvas.height}
              </span>
            </div>
          </div>

          <div className="timeline">
            <div className="timeline-header">
              <span>场景时间线</span>
              <small>版式自动轮换 · 点击场景预览</small>
            </div>
            <div className="scene-strip">
              {store.scenes.map((scene, index) => (
                <article
                  key={scene.id}
                  className={`scene-card ${
                    store.selectedSceneId === scene.id ? "selected" : ""
                  } ${scene.enabled ? "" : "disabled"}`}
                  onClick={() => previewScene(scene.id)}
                >
                  <div className="scene-preview">
                    <img
                      src={
                        (scene.sourceLotId
                          ? sceneImages.get(scene.sourceLotId)
                          : store.project.cover?.url) ??
                        "/demo/artwork-main.jpg"
                      }
                      alt=""
                    />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <strong>{scene.label}</strong>
                  <small>{scene.layoutPreset}</small>
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
                        store.updateSceneDuration(
                          scene.id,
                          scene.durationInFrames - 15,
                        );
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      aria-label="增加时长"
                      onClick={(event) => {
                        event.stopPropagation();
                        store.updateSceneDuration(
                          scene.id,
                          scene.durationInFrames + 15,
                        );
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
                  <label
                    className="scene-toggle"
                    onClick={(event) => event.stopPropagation()}
                  >
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

        <aside className="panel inspector lot-inspector">
          <div className="panel-title inspector-title">
            <div>
              <span>拍品详情</span>
              <small>图片与资料保持在同一页</small>
            </div>
            <button
              className={`icon-button ${projectSettingsOpen ? "active" : ""}`}
              aria-label="项目设置"
              onClick={() => setProjectSettingsOpen((value) => !value)}
            >
              <Settings2 size={15} />
            </button>
          </div>

          {projectSettingsOpen ? (
            <section className="project-settings">
              <label className="project-cover-editor">
                <img
                  src={
                    store.project.cover?.url ??
                    store.project.lots[0].images[0].url
                  }
                  alt="项目封面"
                />
                <div className="project-cover-editor-copy">
                  <ImagePlus size={16} />
                  <span>
                    <strong>更换项目封面</strong>
                    <small>同步用于工作台、视频开场和结尾</small>
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="更换项目封面"
                  onChange={(event) =>
                    void handleCoverFile(event.currentTarget.files)
                  }
                />
              </label>
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
                <div className="two-fields">
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
                </div>
              </div>
            </section>
          ) : null}

          {store.formError ? (
            <div className="inline-error">
              <AlertCircle size={15} /> {store.formError}
            </div>
          ) : null}

          <section className="lot-media-section">
            <div className="inspector-section-heading">
              <div>
                <span>{lot.lotNumber ?? "未填写拍品号"}</span>
                <strong>{lot.title}</strong>
              </div>
              <small>{lot.images.length} 张图片</small>
            </div>
            <div className="lot-image-grid">
              {lot.images.map((asset, index) => (
                <article className="lot-image-item" key={asset.id}>
                  <FocalPointPicker
                    asset={asset}
                    index={index}
                    title={lot.title}
                    onChange={(x, y) => store.setFocalPoint(asset.id, x, y)}
                  />
                  <button
                    className="bare-button"
                    aria-label={`删除图片 ${index + 1}`}
                    onClick={() => store.removeArtwork(asset.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
              <label className="lot-image-upload">
                <ImagePlus size={19} />
                <strong>添加图片</strong>
                <span>主图、局部、签名或证书</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => void handleFiles(event.target.files)}
                />
              </label>
            </div>
          </section>

          <section className="lot-fields-section">
            <div className="inspector-section-heading">
              <strong>拍品信息</strong>
              <small>失焦时保存字段</small>
            </div>
            <div className="field-grid">
              <Field
                label="作品名称"
                value={lot.title}
                onCommit={(value) => store.updateLot(lot.id, { title: value })}
              />
              <Field
                label="艺术家 / 年代"
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
                  onCommit={(value) =>
                    store.updateLot(lot.id, { lotNumber: value })
                  }
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
                onCommit={(value) =>
                  store.updateLot(lot.id, { dimensions: value })
                }
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
                  {["USD", "GBP", "EUR", "HKD", "CNY", "SGD"].map(
                    (currency) => (
                      <option key={currency}>{currency}</option>
                    ),
                  )}
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
          </section>

          <section className="quality-section">
            <div className="inspector-section-heading">
              <strong>质量检查</strong>
              <span
                className={`score score-${
                  store.qualityReport.passed ? "good" : "warn"
                }`}
              >
                {store.qualityReport.score}
              </span>
            </div>
            {store.qualityReport.issues.length ? (
              <div className="issue-list">
                {store.qualityReport.issues.map((issue, index) => (
                  <div
                    className={`issue issue-${issue.severity}`}
                    key={`${issue.code}-${index}`}
                  >
                    <AlertCircle size={14} />
                    <div>
                      <strong>
                        {issue.severity === "error" ? "需要处理" : "建议优化"}
                      </strong>
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
          </section>
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
