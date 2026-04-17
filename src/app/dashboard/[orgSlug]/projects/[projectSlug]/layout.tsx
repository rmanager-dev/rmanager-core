import ProjectProvider from "@/src/components/providers/ProjectProvider";
import ProjectSidebar from "./components/ProjectSidebar";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; projectSlug: string }>;
}) {
  return (
    <ProjectProvider params={params}>
      <ProjectSidebar />
      {children}
    </ProjectProvider>
  );
}
