"use client";

import { AuthProvider } from "@/features/auth/auth-provider";
import { DataRevisionProvider } from "@/lib/data-revision";
import { ToastProvider } from "@/components/ui/toast";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataRevisionProvider>{children}</DataRevisionProvider>
      </AuthProvider>
    </ToastProvider>
  );
}