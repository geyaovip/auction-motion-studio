"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Film,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { AuctionComposition } from "@/src/remotion/AuctionComposition";
import { readWorkspaceProject } from "@/src/lib/workspaceStorage";
import { useProjectStore } from "@/src/store/projectStore";

type RenderState = "idle" | "checking" | "rendering" | "complete" | "error";

export function ExportClient() {
  const { project, timeline, qualityReport, loadProject } = useProjectStore();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const loadedProjectId = useRef<string>();
  const [state, setState] = useState<RenderState>("checking");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("正在检查浏览器能力…");
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [controller, setController] = useState<AbortController>();

  useEffect(() => {
    if (!projectId || loadedProjectId.current === projectId) return;
    const record = readWorkspaceProject(projectId);
    if (!record) return;
    loadedProjectId.current = projectId;
    loadProject(record.project);
  }, [loadProject, projectId]);

  const fileName = useMemo(
    () =>
      `${project.projectName
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "") || "auction-motion"}.mp4`,
    [project.projectName],
  );

  useEffect(() => {
    let active = true;
    void canRenderMediaOnWeb({
      container: "mp4",
      videoCodec: "h264",
      width: timeline.canvas.width,
      height: timeline.canvas.height,
      muted: true,
      videoBitrate: 12_000_000,
    }).then((result) => {
      if (!active) return;
      if (result.canRender) {
        setState("idle");
        setMessage(
          result.issues.find((issue) => issue.severity === "warning")?.message ??
            "浏览器已就绪，可以开始渲染。",
        );
      } else {
        setState("error");
        setMessage(
          result.issues.map((issue) => issue.message).join(" ") ||
            "当前浏览器不支持本地视频渲染。",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [timeline.canvas.height, timeline.canvas.width]);

  const startRender = async () => {
    const abortController = new AbortController();
    setController(abortController);
    setDownloadUrl(undefined);
    setProgress(0);
    setState("rendering");
    setMessage("正在逐帧渲染并编码 MP4，请保持此页面打开。");
    try {
      const result = await renderMediaOnWeb({
        composition: {
          component: AuctionComposition,
          id: "AuctionMotionStudio",
          width: timeline.canvas.width,
          height: timeline.canvas.height,
          fps: timeline.fps,
          durationInFrames: timeline.totalDurationInFrames,
          defaultProps: { project, timeline },
        },
        inputProps: { project, timeline },
        container: "mp4",
        videoCodec: "h264",
        muted: true,
        videoBitrate: 12_000_000,
        signal: abortController.signal,
        onProgress: ({ progress: renderProgress }) => {
          setProgress(Math.round(renderProgress * 100));
        },
      });
      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setState("complete");
      setMessage(`渲染完成 · ${(blob.size / 1024 / 1024).toFixed(1)} MB`);
    } catch (error) {
      if (abortController.signal.aborted) {
        setState("idle");
        setMessage("渲染已取消，可以随时重新开始。");
      } else {
        setState("error");
        setMessage(error instanceof Error ? error.message : "渲染失败，请重试。");
      }
    } finally {
      setController(undefined);
    }
  };

  return (
    <main className="export-page">
      <header className="export-header shell">
        <div className="export-header-left">
          <Link
            href={projectId ? `/projects/${projectId}` : "/editor"}
            className="icon-button"
            aria-label="返回编辑器"
          >
            <ArrowLeft size={17} />
          </Link>
          <Link href="/workbench" className="brand">
            <span className="brand-mark">拍</span>
            <span>拍卖影像工作室</span>
          </Link>
          <span className="export-header-divider" />
          <strong>导出视频</strong>
        </div>
      </header>
      <section className="export-shell shell">
        <div className="export-preview">
          <div className={`player-shell player-${project.aspectRatio.replace(":", "-")}`}>
            <Player
              component={AuctionComposition}
              inputProps={{ project, timeline }}
              durationInFrames={timeline.totalDurationInFrames}
              fps={timeline.fps}
              compositionWidth={timeline.canvas.width}
              compositionHeight={timeline.canvas.height}
              controls
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
        <div className="export-card">
          <div className="eyebrow"><Film size={15} /> 导出 MP4</div>
          <h1>交付你的成片。</h1>
          <p className="export-intro">
            视频将在当前浏览器中完成渲染。图片与项目资料不会上传至渲染服务器。
          </p>
          <div className="export-specs">
            <div><span>画幅</span><strong>{project.aspectRatio}</strong></div>
            <div><span>分辨率</span><strong>{timeline.canvas.width} × {timeline.canvas.height}</strong></div>
            <div><span>帧率</span><strong>{timeline.fps} FPS</strong></div>
            <div><span>时长</span><strong>{(timeline.totalDurationInFrames / timeline.fps).toFixed(1)} 秒</strong></div>
            <div><span>格式</span><strong>MP4 · H.264</strong></div>
            <div><span>质量分</span><strong>{qualityReport.score} / 100</strong></div>
          </div>
          <div className={`render-status render-${state}`}>
            {state === "rendering" || state === "checking" ? (
              <LoaderCircle size={17} className="spin" />
            ) : state === "complete" ? (
              <CheckCircle2 size={17} />
            ) : state === "error" ? (
              <AlertTriangle size={17} />
            ) : (
              <ShieldCheck size={17} />
            )}
            <span>{message}</span>
          </div>
          {state === "rendering" ? (
            <div className="progress-wrap">
              <div className="progress-label"><span>渲染进度</span><strong>{progress}%</strong></div>
              <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
              <button className="text-button" onClick={() => controller?.abort()}>取消渲染</button>
            </div>
          ) : null}
          {downloadUrl ? (
            <a
              className="button button-dark export-action"
              href={downloadUrl}
              download={fileName}
            >
              <Download size={17} /> 下载 {fileName}
            </a>
          ) : (
            <button
              className="button button-dark export-action"
              disabled={state === "checking" || state === "rendering" || state === "error"}
              onClick={() => void startRender()}
            >
              <Film size={17} /> 开始渲染 MP4
            </button>
          )}
          <small className="browser-note">
            建议使用最新版 Chrome。渲染期间请勿锁屏或切换到节能模式。
          </small>
        </div>
      </section>
    </main>
  );
}
