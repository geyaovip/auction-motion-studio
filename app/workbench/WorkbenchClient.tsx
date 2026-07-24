"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { readWorkspaceProjects } from "@/src/lib/workspaceStorage";
import { workspaceProjects } from "@/src/data/workspaceProjects";
import type { TemplateId } from "@/src/types/project";
import type {
  WorkspaceProject,
  WorkspaceProjectStatus,
} from "@/src/types/workspace";

type Filter = "all" | TemplateId;

const typeLabel: Record<TemplateId, string> = {
  "artwork-showcase": "作品特写",
  "auction-preview": "专场预告",
  "auction-result": "成交结果",
};

const statusLabel: Record<WorkspaceProjectStatus, string> = {
  draft: "制作中",
  ready: "可生成",
  generated: "已生成",
  exported: "已导出",
};

const formatUpdatedAt = (value: string): string =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));

const ProjectThumb = ({
  record,
  compact = false,
}: {
  record: WorkspaceProject;
  compact?: boolean;
}) => {
  const lot = record.project.lots[0];
  const cover = record.project.cover ?? lot.images[0];
  const result = record.project.templateId === "auction-result";
  return (
    <div
      className={`project-thumb ${
        result ? "project-thumb-result" : ""
      } ${compact ? "project-thumb-compact" : ""}`}
    >
      <img src={cover.url} alt={cover.alt ?? record.project.projectName} />
      <div className="project-thumb-shade" />
      <span>{lot.lotNumber ?? typeLabel[record.project.templateId]}</span>
      {result ? (
        <strong>
          {lot.currency ?? "CNY"}{" "}
          {(lot.salePrice ?? 0).toLocaleString("zh-CN")}
        </strong>
      ) : (
        <strong>{lot.title}</strong>
      )}
      <small>
        {record.project.auction?.houseName ?? "雅集拍卖"} ·{" "}
        {record.project.auction?.location ?? "中国香港"}
      </small>
    </div>
  );
};

export function WorkbenchClient() {
  const [records, setRecords] =
    useState<WorkspaceProject[]>(workspaceProjects);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRecords(readWorkspaceProjects());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? records
        : records.filter((record) => record.project.templateId === filter),
    [filter, records],
  );
  const featured = visible[0] ?? records[0];
  const projectRows = visible.slice(featured ? 1 : 0);

  return (
    <main className="workbench">
      <header className="workbench-topbar">
        <div className="workbench-topbar-inner">
          <Link href="/" className="brand workbench-brand">
            <span className="brand-mark">拍</span>
            <span>拍卖影像工作室</span>
          </Link>
          <span className="workbench-location">工作台</span>
        </div>
      </header>

      <section className="workbench-main">
        <header className="workbench-header">
          <div>
            <h1>我的拍卖视频</h1>
            <p>管理项目、补充资料，并从上次的位置继续创作。</p>
          </div>
          <Link href="/projects/new" className="button button-dark">
            <Plus size={17} /> 创建视频
          </Link>
        </header>

        <div className="workbench-filters" id="types">
          {(
            [
              ["all", "全部类型"],
              ["artwork-showcase", "作品特写"],
              ["auction-preview", "专场预告"],
              ["auction-result", "成交结果"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="workbench-rule" />

        {featured ? (
          <section className="recent-project" aria-labelledby="recent-title">
            <span className="section-kicker" id="recent-title">近期项目</span>
            <div className="featured-project">
              <ProjectThumb record={featured} />
              <div className="featured-project-meta">
                <div>
                  <span className={`status-dot status-${featured.status}`} />
                  {statusLabel[featured.status]}
                </div>
                <h2>{featured.project.projectName}</h2>
                <p>
                  作品资料 {featured.progress}% · 场景时间线{" "}
                  {Math.max(1, Math.round(featured.progress / 18))}/6
                </p>
                <div className="progress-track">
                  <i style={{ width: `${featured.progress}%` }} />
                </div>
                <small>最后编辑：{formatUpdatedAt(featured.updatedAt)}</small>
                <div className="featured-actions">
                  <Link
                    href={`/projects/${featured.id}`}
                    className="button button-dark"
                  >
                    继续编辑
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="project-index" id="projects">
          <div className="project-index-header">
            <span>项目（{visible.length}）</span>
            <span>项目名称</span>
            <span>类型</span>
            <span>拍品</span>
            <span>最后编辑</span>
            <span>状态</span>
            <span aria-hidden="true" />
          </div>
          <div className="project-columns">
            {projectRows.map((record) => (
              <Link
                href={`/projects/${record.id}`}
                className="project-row"
                key={record.id}
              >
                <ProjectThumb record={record} compact />
                <div className="project-row-title">
                  <strong>{record.project.projectName}</strong>
                  <span>
                    {record.project.auction?.subtitle ??
                      record.project.lots[0].title}
                  </span>
                </div>
                <span>{typeLabel[record.project.templateId]}</span>
                <span>{record.project.lots.length} 件</span>
                <span>{formatUpdatedAt(record.updatedAt)}</span>
                <span className={`project-status status-${record.status}`}>
                  {statusLabel[record.status]}
                </span>
                <ChevronRight
                  className="project-row-entry"
                  aria-label="进入项目详情"
                  size={17}
                />
              </Link>
            ))}
          </div>
          {projectRows.length > 0 ? (
            <button className="show-more" type="button">
              已显示 {visible.length} 个项目 <ChevronDown size={15} />
            </button>
          ) : (
            <div className="empty-projects">
              <Archive size={20} />
              当前类型还没有其他项目
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
