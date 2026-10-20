"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import PageHeader from "@/components/ui/page-header";
import { buildExportTables, buildExportJson, csvFileNameFor, exportFileName, rowsToCsv, EXPORT_TABLES } from "@/features/export/export-api";
import { createZip } from "@/lib/utils/zip";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";

export default function ExportPage() {
  const { push } = useToast();
  const [working, setWorking] = useState(null);
  const [summary, setSummary] = useState(null);

  async function loadTables() {
    const bundle = await buildExportTables();
    setSummary({
      username: bundle.username, email: bundle.email,
      counts: Object.fromEntries(EXPORT_TABLES.map((t) => [t, (bundle[t] || []).length])),
    });
    return bundle;
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function handleJson() {
    setWorking("json");
    try {
      const bundle = await loadTables();
      const generatedAt = new Date();
      const json = buildExportJson({ tables: bundle, username: bundle.username, email: bundle.email, generatedAt });
      download(new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }), exportFileName("json", generatedAt));
      push("Export JSON diunduh.");
    } catch (err) { push(friendlyError(err, "Gagal mengekspor JSON."), "error"); }
    finally { setWorking(null); }
  }

  async function handleCsv() {
    setWorking("csv");
    try {
      const bundle = await loadTables();
      const generatedAt = new Date();
      const files = EXPORT_TABLES.map((table) => ({
        name: csvFileNameFor(table),
        content: rowsToCsv(bundle[table] || []),
      }));
      download(createZip(files, generatedAt), exportFileName("zip", generatedAt));
      push("Export CSV (ZIP) diunduh.");
    } catch (err) { push(friendlyError(err, "Gagal mengekspor CSV."), "error"); }
    finally { setWorking(null); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Export Data" subtitle="Unduh seluruh data akunmu dalam format JSON atau CSV." />
      <div className="card p-5 tablet:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-reset-soft text-reset-primary"><FileJson size={20} /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-reset-dark">Export JSON</h2>
            <p className="text-[13px] text-reset-muted">Satu file berisi seluruh data akun.</p>
          </div>
        </div>
        <button type="button" onClick={handleJson} disabled={!!working} className="btn-primary mt-4 w-full">
          <Download size={17} /> {working === "json" ? "Menyiapkan..." : "Unduh JSON"}
        </button>
      </div>
      <div className="card mt-4 p-5 tablet:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-reset-soft text-reset-primary"><FileSpreadsheet size={20} /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-reset-dark">Export CSV (ZIP)</h2>
            <p className="text-[13px] text-reset-muted">Satu file ZIP berisi CSV per dataset.</p>
          </div>
        </div>
        <button type="button" onClick={handleCsv} disabled={!!working} className="btn-outline mt-4 w-full">
          <Download size={17} /> {working === "csv" ? "Menyiapkan..." : "Unduh ZIP"}
        </button>
      </div>
      {summary ? (
        <div className="card mt-4 p-5">
          <h2 className="text-[15px] font-bold text-reset-dark">Ringkasan terakhir</h2>
          <p className="mt-1 text-[13px] text-reset-muted">{summary.username || ""} {summary.email ? `• ${summary.email}` : ""}</p>
          <ul className="mt-3 space-y-1.5">
            {EXPORT_TABLES.map((t) => (
              <li key={t} className="flex justify-between text-[13.5px]">
                <span className="text-reset-muted">{t}</span>
                <span className="font-bold text-reset-dark">{summary.counts[t] ?? 0} baris</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </PageContainer>
  );
}
