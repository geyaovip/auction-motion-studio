import type { Metadata } from "next";
import { NewProjectClient } from "./NewProjectClient";

export const metadata: Metadata = {
  title: "创建视频项目",
  description: "选择视频类型并填写项目资料。",
};

export default function NewProjectPage() {
  return <NewProjectClient />;
}
