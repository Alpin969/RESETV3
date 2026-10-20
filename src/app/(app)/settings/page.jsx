"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, BellRing, ChevronRight, Download, LogOut, Pencil } from "lucide-react";
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
      push("Avatar diperbarui.");
    } catch (err) { push(friendlyError(err, "Gagal mengunggah avatar."), "error"); }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch (err) { push(friendlyError(err, "Gagal logout."), "error"); setSigningOut(false); }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-5 tablet:px-7 tablet:pt-7 desktop:pb-10">
      <h1 className="page-title">Settings</h1>
      <p className="muted mt-1 text-[14px]">Kelola profil dan preferensimu.</p>
      <div className="card mt-5 flex items-center gap-4 p-5">
        <Avatar username={profile?.username} avatarUrl={profile?.avatar_url} size={60} />
        <div className="min-w-0 flex-1">
          {profileLoading ? (<><Skeleton className="h-5 w-32 rounded-lg" /><Skeleton className="mt-2 h-4 w-48 rounded-lg" /></>)
          : (<>
            <p className="truncate text-[18px] font-bold text-reset-dark">{profile?.username || user?.email?.split("@")[0] || "Pengguna"}</p>
            <p className="mt-0.5 truncate text-[13.5px] text-reset-muted">{user?.email || ""}</p>
            <p className="mt-0.5 text-[12.5px] text-reset-muted">Zona waktu: {timezoneLabel(profile?.timezone || "UTC")}</p>
          </>)}
        </div>
      </div>
      <div className="card mt-4 divide-y divide-reset-border/70 p-2">
        <Tile icon={Pencil} title="Ubah username" subtitle={profile?.username || "-"} onClick={() => setUsernameOpen(true)} />
        <Tile icon={Pencil} title="Upload avatar" subtitle="Ganti foto profil" onClick={() => document.getElementById("avatar-input")?.click()} />
        <Tile icon={Pencil} title="Zona waktu" subtitle={timezoneLabel(profile?.timezone || "UTC")} onClick={() => setTimezoneOpen(true)} />
        <Tile icon={Archive} title="Archived tasks" subtitle="Lihat dan pulihkan task" onClick={() => router.push("/archived-tasks")} />
        <Tile icon={BellRing} title="Reminders" subtitle="Kelola pengingat" onClick={() => router.push("/reminders")} />
        <Tile icon={Download} title="Export data" subtitle="Unduh JSON atau CSV" onClick={() => router.push("/export")} />
      </div>
      <NotificationCard push={push} />
      <div className="card mt-4 p-5">
        <h2 className="text-[16px] font-bold text-reset-dark">Install RESET</h2>
        <p className="mt-1 text-[13.5px] leading-5 text-reset-muted">{pwa.subtitle}</p>
        <button type="button" onClick={pwa.install} disabled={pwa.working || pwa.installed} className="btn-primary mt-3 w-full tablet:w-auto tablet:px-8">
          {pwa.working ? "Memproses..." : pwa.installed ? "Sudah terpasang" : "Install RESET"}
        </button>
      </div>
      <button type="button" onClick={handleSignOut} disabled={signingOut} className="btn-outline mt-4 w-full !border-[#F0C9C6] !text-reset-danger hover:!bg-[#FFF6F5]">
        <LogOut size={17} /> {signingOut ? "Keluar..." : "Logout"}
      </button>
      <input id="avatar-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleAvatar(f); }} />
      <UsernameModal open={usernameOpen} onClose={() => setUsernameOpen(false)} initial={profile?.username || ""}
        onSave={async (username) => {
          await updateProfile({ username });
          await refreshProfile();
          bump("profile");
          setUsernameOpen(false);
          push("Username diperbarui.");
        }} />
      <TimezoneModal open={timezoneOpen} onClose={() => setTimezoneOpen(false)} initial={profile?.timezone || "UTC"}
        onError={(e) => push(friendlyError(e, "Gagal menyimpan zona waktu."), "error")}
        onSave={async (timezone) => {
          await updateProfile({ timezone });
          await refreshProfile();
          bump("profile");
          setTimezoneOpen(false);
          push("Zona waktu diperbarui.");
        }} />
    </div>
  );
}

function Tile({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition hover:bg-reset-bg">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary"><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-bold text-reset-dark">{title}</span>
        <span className="block truncate text-[13px] text-reset-muted">{subtitle}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-reset-muted" />
    </button>
  );
}
