import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import MeSidebar from "../../components/MeSidebar";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "padelity-dev-secret-change-in-production"
  );

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("athlete_session")?.value;
  if (!token) redirect("/onboard");

  let igUserId = "";
  let name = "";
  let username = "";
  try {
    const { payload } = await jwtVerify(token, getSecret());
    igUserId = (payload as { igUserId?: string }).igUserId ?? "";
    name = (payload as { name?: string }).name ?? "";
    username = (payload as { username?: string }).username ?? "";
  } catch {
    redirect("/onboard");
  }

  if (!igUserId) redirect("/onboard");

  return (
    <div className="flex min-h-screen bg-canvas">
      <MeSidebar name={name} username={username} />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
