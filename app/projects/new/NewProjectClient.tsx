"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Play,
} from "lucide-react";
import { demoProject } from "@/src/data/demoProject";
import { saveWorkspaceProject } from "@/src/lib/workspaceStorage";
import type { ProjectInput, TemplateId } from "@/src/types/project";

const types: Array<{
  id: TemplateId;
  title: string;
  description: string;
  cover: string;
}> = [
  {
    id: "artwork-showcase",
    title: "作品特写",
    description: "聚焦单件拍品、细节、资料与估价。",
    cover: "/demo/artwork-main.jpg",
  },
  {
    id: "auction-preview",
    title: "专场预告",
    description: "编排多件精选拍品，形成完整专场节奏。",
    cover: "/demo/calligraphy-scroll.png",
  },
  {
    id: "auction-result",
    title: "成交结果",
    description: "突出落槌结果与成交数据，适合会后发布。",
    cover: "/demo/porcelain-vase.png",
  },
];

export function NewProjectClient() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [templateId, setTemplateId] =
    useState<TemplateId>("artwork-showcase");
  const [projectName, setProjectName] = useState("");
  const [auctionTitle, setAuctionTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [houseName, setHouseName] = useState("雅集拍卖");
  const [coverDataUrl, setCoverDataUrl] = useState<string>();

  const createProject = () => {
    const id = `local-${Date.now()}`;
    const type = types.find((item) => item.id === templateId) ?? types[0];
    const coverUrl = coverDataUrl ?? type.cover;
    const project: ProjectInput = {
      ...demoProject,
      projectName: projectName.trim() || `${type.title} · 未命名项目`,
      templateId,
      cover: {
        id: `${id}-cover`,
        url: coverUrl,
        width: coverDataUrl ? undefined : 1600,
        height: coverDataUrl ? undefined : 1200,
        alt: `${projectName.trim() || type.title}项目封面`,
        focalPoint: { x: 0.5, y: 0.5 },
      },
      auction: {
        ...demoProject.auction,
        title: auctionTitle.trim() || projectName.trim() || type.title,
        subtitle: subtitle.trim() || undefined,
        date: date.trim() || undefined,
        location: location.trim() || undefined,
        houseName: houseName.trim() || undefined,
      },
      lots: [
        {
          ...demoProject.lots[0],
          id: `${id}-lot-1`,
          images: [
            {
              ...demoProject.lots[0].images[0],
              id: `${id}-lot-image-1`,
              url: coverUrl,
              width: coverDataUrl ? undefined : demoProject.lots[0].images[0].width,
              height: coverDataUrl ? undefined : demoProject.lots[0].images[0].height,
            },
          ],
        },
      ],
    };
    saveWorkspaceProject({
      id,
      updatedAt: new Date().toISOString(),
      status: "draft",
      progress: 35,
      project,
    });
    router.push(`/projects/${id}`);
  };

  const handleCover = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCoverDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="create-project-page">
      <header className="create-project-header">
        <Link href="/workbench" className="icon-button" aria-label="返回工作台">
          <ArrowLeft size={17} />
        </Link>
        <Link href="/workbench" className="brand">
          <span className="brand-mark">拍</span>
          <span>拍卖影像工作室</span>
        </Link>
        <span className="create-header-divider" />
        <strong>创建视频项目</strong>
      </header>

      <section className="create-project-shell">
        <div className="create-progress">
          <span className="active"><i>1</i>选择类型</span>
          <b />
          <span className={step === 2 ? "active" : ""}><i>2</i>项目信息</span>
        </div>

        {step === 1 ? (
          <>
            <div className="create-heading">
              <span>第一步</span>
              <h1>这支视频要讲什么？</h1>
              <p>类型决定基础场景结构，后续仍可在项目内调整。</p>
            </div>
            <div className="type-choice-grid">
              {types.map((item) => (
                <button
                  className={templateId === item.id ? "selected" : ""}
                  key={item.id}
                  type="button"
                  onClick={() => setTemplateId(item.id)}
                >
                  <div className="type-choice-visual">
                    <img src={item.cover} alt="" />
                    <span><Play size={14} /> 预览结构</span>
                    {templateId === item.id ? <i><Check size={14} /></i> : null}
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </button>
              ))}
            </div>
            <div className="create-actions">
              <Link href="/workbench" className="button button-ghost">取消</Link>
              <button className="button button-dark" onClick={() => setStep(2)}>
                填写项目信息 <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="create-heading">
              <span>第二步</span>
              <h1>建立项目的统一信息</h1>
              <p>封面用于工作台和视频开场，拍品图片将在详情页继续添加。</p>
            </div>
            <div className="project-form-layout">
              <label className="cover-uploader">
                {coverDataUrl ? (
                  <img src={coverDataUrl} alt="项目封面预览" />
                ) : (
                  <img
                    src={types.find((item) => item.id === templateId)?.cover}
                    alt="默认项目封面"
                  />
                )}
                <span><ImagePlus size={17} /> 更换项目封面</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleCover(event.target.files?.[0])}
                />
              </label>
              <div className="project-form-fields">
                <label>
                  <span>项目名称</span>
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="例如：花卉大师 · 香港专场"
                    autoFocus
                  />
                </label>
                <label>
                  <span>拍卖标题</span>
                  <input
                    value={auctionTitle}
                    onChange={(event) => setAuctionTitle(event.target.value)}
                    placeholder="例如：花卉大师"
                  />
                </label>
                <label>
                  <span>副标题</span>
                  <input
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value)}
                    placeholder="例如：现当代艺术晚间拍卖"
                  />
                </label>
                <div className="create-two-fields">
                  <label>
                    <span>日期</span>
                    <input
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      placeholder="2026 年 9 月 18 日"
                    />
                  </label>
                  <label>
                    <span>地点</span>
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="中国香港"
                    />
                  </label>
                </div>
                <label>
                  <span>拍卖机构</span>
                  <input
                    value={houseName}
                    onChange={(event) => setHouseName(event.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="create-actions">
              <button className="button button-ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> 返回选择类型
              </button>
              <button className="button button-dark" onClick={createProject}>
                创建并进入项目 <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
