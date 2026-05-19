"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn btn-outline btn-sm gap-2 transition-all duration-200 active:scale-[0.98]"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}
