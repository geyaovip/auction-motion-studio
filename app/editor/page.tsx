import type { Metadata } from "next";
import { EditorClient } from "./EditorClient";

export const metadata: Metadata = {
  title: "编辑器",
  description: "生成、预览并调整艺术品拍卖营销视频。",
};

export default function EditorPage() {
  return <EditorClient />;
}
