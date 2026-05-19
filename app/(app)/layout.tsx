import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeSelector } from "@/components/ThemeSelector";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-base-100/90 backdrop-blur-md border-b border-base-300 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Concert Cost Tracker
              </h1>
              <p className="text-sm opacity-70 mt-1 max-w-xl">
                Track spending, fun, and value across every concert you attend.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <p className="text-sm">
                Signed in as{" "}
                <span className="font-medium">{user.email}</span>
              </p>
              <ThemeSelector compact />
              <LogoutButton />
            </div>
          </div>
          <AppNav />
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}
