import type { Metadata } from "next";
import { EditorClient } from "@/app/editor/EditorClient";

export const metadata: Metadata = {
  title: "项目详情",
  description: "设置拍品图片、拍品信息并预览成片。",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditorClient projectId={id} />;
}
