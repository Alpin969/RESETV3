"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, BellRing, ChevronRight, Download, LogOut, Pencil, BedDouble, PiggyBank, FileText } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import Avatar from "@/components/ui/avatar";
import Skeleton from "@/components/ui/skeleton";
import { usePwaInstall } from "@/features/settings/use-pwa-install";
import NotificationCard from "@/features/settings/notification-card";
import { TimezoneModal, UsernameModal } from "@/features/settings/profile-modals";
import { updateProfile, uploadAvatar } from "@/features/settings/settings-api";
import { timezoneLabel } from "@/lib/utils/timezones";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { useDataRevision } from "@/lib/data-revision";

export default function SettingsPage() {
  const router = useRouter();
  const { push } = useToast();
  const { bump } = useDataRevision();
  const { user, profile, profileLoading, refreshProfile, signOut } = useAuth();
  const pwa = usePwaInstall();
  const [usernameOpen, setUsernameOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleAvatar(file) {
    if (!file) return;
    try {
      await uploadAvatar(file);
      await refreshProfile();
      bump("profile");
      push("Avatar updated.");
    } catch (err) { push(friendlyError(err, "Failed to upload avatar."), "error"); }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch (err) { push(friendlyError(err, "Failed to logout."), "error"); setSigningOut(false); }
  }

  const settingsItems = [
    { icon: Pencil, title: "Username", subtitle: profile?.username || "—", onClick: () => setUsernameOpen(true) },
    { icon: Pencil, title: "Avatar", subtitle: "Change profile photo", onClick: () => document.getElementById("avatar-input")?.click() },
    { icon: Pencil, title: "Timezone", subtitle: timezoneLabel(profile?.timezone || "UTC"), onClick: () => setTimezoneOpen(true) },
    { icon: Archive, title: "Archived Tasks", subtitle: "View and restore tasks", onClick: () => router.push("/archived-tasks") },
    { icon: BedDouble, title: "Sleep Tracker", subtitle: "Manage sleep logs", onClick: () => router.push("/sleep") },
    { icon: PiggyBank, title: "Savings Tracker", subtitle: "Manage transactions", onClick: () => router.push("/savings") },
    { icon: BellRing, title: "Reminders", subtitle: "Manage reminders", onClick: () => router.push("/reminders") },
    { icon: Download, title: "Export Data", subtitle: "Download JSON or CSV", onClick: () => router.push("/export") },
    { icon: FileText, title: "Notification Preferences", subtitle: "Manage notification settings", onClick: () => router.push("/settings#notifications") },
  ];

  return (
    <div className="container-main py-6 desktop:py-8">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="mt-1 body-md text-reset-muted">Manage your profile and preferences.</p>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          <Avatar username={profile?.username} avatarUrl={profile?.avatar_url} size={64} />
          <div className="min-w-0 flex-1">
            {profileLoading ? (
              <>
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="mt-2 h-4 w-48 rounded-lg" />
              </>
            ) : (
              <>
                <p className="truncate heading-3">{profile?.username || user?.email?.split("@")[0] || "User"}</p>
                <p className="mt-0.5 truncate body-sm text-reset-muted">{user?.email || ""}</p>
                <p className="mt-1 body-xs text-reset-muted">Timezone: {timezoneLabel(profile?.timezone || "UTC")}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card divide-y divide-reset-border/50 mb-6">
        {settingsItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={item.onClick}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-reset-bg first:rounded-t-[var(--radius-card)] last:rounded-b-[var(--radius-card)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
              <item.icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate body-md font-semibold text-reset-dark">{item.title}</p>
              <p className="truncate body-sm text-reset-muted">{item.subtitle}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-reset-muted" />
          </button>
        ))}
      </div>

      <NotificationCard push={push} />

      <div className="card mt-4 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h2 className="heading-3" style={{ color: '#2f8a60', fontSize: '14px', fontWeight: 700 }}>{'Install RESET'}</h2>
            <p className="body-sm text-reset-muted">{pwa.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={pwa.install} disabled={pwa.working || pwa.installed} className="btn-primary w-full desktop:w-auto desktop:px-6 min-h-[44px] rounded-[12px]">
          {pwa.working ? "Processing..." : pwa.installed ? "Already Installed" : "Install RESET"}
        </button>
      </div>

      <button type="button" onClick={handleSignOut} disabled={signingOut} className="mt-4 w-full flex items-center justify-center gap-[10px] rounded-[12px] px-[20px] py-[12px] min-h-[48px] border border-reset-danger/50 bg-red-50/60 text-reset-danger text-[16px] font-semibold hover:bg-reset-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reset-danger/30 focus-visible:ring-offset-2 disabled:opacity-50">
        <LogOut size={20} className="shrink-0" /> <span className="shrink-0">{signingOut ? "Signing out..." : "Logout"}</span>
      </button>

      <input id="avatar-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleAvatar(f); }} />
      
      <UsernameModal open={usernameOpen} onClose={() => setUsernameOpen(false)} initial={profile?.username || ""}
        onSave={async (username) => {
          await updateProfile({ username });
          await refreshProfile();
          bump("profile");
          setUsernameOpen(false);
          push("Username updated.");
        }} />
      
      <TimezoneModal open={timezoneOpen} onClose={() => setTimezoneOpen(false)} initial={profile?.timezone || "UTC"}
        onError={(e) => push(friendlyError(e, "Failed to save timezone."), "error")}
        onSave={async (timezone) => {
          await updateProfile({ timezone });
          await refreshProfile();
          bump("profile");
          setTimezoneOpen(false);
          push("Timezone updated.");
        }} />
    </div>
  );
}