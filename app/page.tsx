import type { Metadata } from "next";
import { TaskList } from "./components/TaskList";

export default function IndexPage() {
  return <TaskList />;
}

export const metadata: Metadata = {
  title: "Task List",
};
