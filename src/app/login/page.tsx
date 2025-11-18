import { redirect } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/server";

type LoginSearchParams = Record<string, string | string[] | undefined>;

const isPromiseSearchParams = (
  value: unknown
): value is Promise<LoginSearchParams> => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
};

interface LoginPageProps {
  searchParams?: Promise<LoginSearchParams> | LoginSearchParams;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = searchParams
    ? isPromiseSearchParams(searchParams)
      ? await searchParams
      : searchParams
    : undefined;

  const redirectParam = resolvedParams?.next;
  const redirectTo =
    typeof redirectParam === "string" && redirectParam.length > 0
      ? redirectParam
      : "/";

  const user = await getCurrentUser();
  if (user) {
    if (redirectTo.startsWith("/admin") && user.admin !== true) {
      redirect("/");
    }
    redirect(redirectTo || "/");
  }

  return (
    <div className="py-8">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
