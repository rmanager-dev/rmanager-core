import AuthContainer from "./AuthContainer";

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initialIsLogin = searchParams?.form !== "signup";
  return <AuthContainer isInitLogin={initialIsLogin} />;
}
