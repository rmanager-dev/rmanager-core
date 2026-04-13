import ProjectSidebar from "./components/ProjectSidebar";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <ProjectSidebar />
      {children}
    </>
  );
}
