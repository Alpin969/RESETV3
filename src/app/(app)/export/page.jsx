"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, ChevronRight } from "lucide-react";
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
      push("JSON export downloaded.");
    } catch (err) { push(friendlyError(err, "Failed to export JSON."), "error"); }
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
      push("CSV (ZIP) export downloaded.");
    } catch (err) { push(friendlyError(err, "Failed to export CSV."), "error"); }
    finally { setWorking(null); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Export Data" subtitle="Download all your account data in JSON or CSV format." />

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
            <FileJson size={22} />
          </span>
          <div className="flex-1">
            <h2 className="heading-3">Export JSON</h2>
            <p className="body-sm text-reset-muted">Single file containing all account data.</p>
          </div>
        </div>
        <button type="button" onClick={handleJson} disabled={!!working} className="btn-primary mt-4 w-full">
          <Download size={18} /> {working === "json" ? "Preparing..." : "Download JSON"}
        </button>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
            <FileSpreadsheet size={22} />
          </span>
          <div className="flex-1">
            <h2 className="heading-3">Export CSV (ZIP)</h2>
            <p className="body-sm text-reset-muted">ZIP file containing separate CSV files per dataset.</p>
          </div>
        </div>
        <button type="button" onClick={handleCsv} disabled={!!working} className="btn-outline mt-4 w-full">
          <Download size={18} /> {working === "csv" ? "Preparing..." : "Download ZIP"}
        </button>
      </div>

      {summary && (
        <div className="card p-5">
          <h2 className="heading-3">Last Export Summary</h2>
          <p className="mt-1 body-sm text-reset-muted">{summary.username || ""} {summary.email ? `• ${summary.email}` : ""}</p>
          <ul className="mt-4 space-y-2">
            {EXPORT_TABLES.map((t) => (
              <li key={t} className="flex items-center justify-between py-2 px-3 rounded-xl bg-reset-bg">
                <span className="body-sm text-reset-muted">{t}</span>
                <span className="body-sm font-semibold text-reset-dark">{summary.counts[t] ?? 0} rows</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageContainer>
  );
}