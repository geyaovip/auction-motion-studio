import type { Metadata } from "next";
import { ExportClient } from "./ExportClient";

export const metadata: Metadata = {
  title: "导出",
  description: "在浏览器中渲染并下载高清 MP4。",
};

export default function ExportPage() {
  return <ExportClient />;
}
