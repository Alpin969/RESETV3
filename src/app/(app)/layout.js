import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppProviders from "@/components/providers";
import DashboardShell from "@/components/layout/dashboard-shell";

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppProviders>
      <DashboardShell>{children}</DashboardShell>
    </AppProviders>
  );
}