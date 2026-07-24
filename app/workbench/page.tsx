import type { Metadata } from "next";
import { WorkbenchClient } from "./WorkbenchClient";

export const metadata: Metadata = {
  title: "工作台",
  description: "管理本地拍卖视频项目并开始新的创作。",
};

export default function WorkbenchPage() {
  return <WorkbenchClient />;
}
