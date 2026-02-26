"use client";

import { useEffect, useCallback, useState } from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import {
  getTotals,
  getStatusSummaries,
  getDepartmentSummaries,
  getRecruiterSummaries,
  getMonthSummaries,
  getSourceSummaries,
  getBudgetSummary,
  getRecruiterDetail,
} from "@/lib/dashboardUtils";
import type { RecruitmentEntry } from "@/types/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#4f46e5",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0284c7",
  "#65a30d",
  "#ea580c",
  "#db2777",
];

const STATUS_COLORS: Record<string, string> = {
  Closed: "#059669",
  Open: "#2563eb",
  Hold: "#d97706",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  color: "#111827",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  fontSize: "13px",
};

/* ─── Setup Screen ─── */
function SheetSetup() {
  const { sheetUrl, setSheetUrl, fetchData, loading, error } =
    useDashboardStore();
  const [inputUrl, setInputUrl] = useState(sheetUrl);

  const handleConnect = () => {
    setSheetUrl(inputUrl);
    setTimeout(() => fetchData(), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-2xl font-bold mb-4">
            HR
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recruitment Dashboard
          </h1>
          <p className="text-gray-500">
            Connect your Google Sheet to get real-time hiring insights
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Sheet URL
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/e/..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleConnect}
            disabled={loading || !inputUrl}
            className="w-full mt-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {loading ? "Connecting..." : "Connect & Load Data"}
          </button>
          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Make sure your sheet is published to the web via File &rarr; Share
              &rarr; Publish to web. The sheet URL should contain
              &ldquo;/pub&rdquo; or &ldquo;/pubhtml&rdquo;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  subtext,
  icon,
  trend,
  accentColor = "#4f46e5",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : trend === "down"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-50 text-gray-500"
            }`}
          >
            {trend === "up" ? "Active" : trend === "down" ? "Low" : "Stable"}
          </span>
        )}
      </div>
      <p
        className="text-3xl font-bold tracking-tight"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
      {subtext && (
        <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

/* ─── Recruiter Detail Slide-Over ─── */
function RecruiterDetailPanel({
  data,
  recruiterName,
  onClose,
}: {
  data: RecruitmentEntry[];
  recruiterName: string;
  onClose: () => void;
}) {
  const detail = getRecruiterDetail(data, recruiterName);
  const funnelStages = [
    { label: "CVs Screened", value: detail.totalCVs, color: "#4f46e5" },
    { label: "Interviewed", value: detail.totalInterviewed, color: "#7c3aed" },
    { label: "Offered", value: detail.totalOffered, color: "#059669" },
    { label: "Accepted", value: detail.totalAccepted, color: "#0891b2" },
    { label: "Joined", value: detail.totalJoined, color: "#d97706" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {detail.name}
            </h2>
            <p className="text-sm text-gray-500">Recruiter Performance Report</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-700">{detail.totalPositions}</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">Total Positions</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{detail.closed}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Closed</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{detail.closureRate}%</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Closure Rate</p>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Conversion Funnel</h3>
            <div className="grid grid-cols-5 gap-2">
              {funnelStages.map((stage, i) => {
                const maxVal = detail.totalCVs || 1;
                const pct = Math.round((stage.value / maxVal) * 100);
                return (
                  <div key={i} className="text-center">
                    <div className="h-20 flex items-end justify-center mb-2">
                      <div
                        className="w-10 rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(pct, 8)}%`,
                          backgroundColor: stage.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <p className="text-lg font-bold" style={{ color: stage.color }}>
                      {stage.value}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium leading-tight">
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-indigo-600">{detail.cvToInterview}%</p>
                <p className="text-[10px] text-gray-400">CV &rarr; Interview</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-purple-600">{detail.interviewToOffer}%</p>
                <p className="text-[10px] text-gray-400">Interview &rarr; Offer</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-bold text-emerald-600">{detail.offerToJoin}%</p>
                <p className="text-[10px] text-gray-400">Offer &rarr; Join</p>
              </div>
              {detail.avgDaysToOffer !== null && (
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-cyan-600">{detail.avgDaysToOffer}d</p>
                  <p className="text-[10px] text-gray-400">Avg Days to Offer</p>
                </div>
              )}
            </div>
          </div>

          {/* Status + Department + Source Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h4>
              <div className="space-y-2">
                {detail.statuses.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[s.status] || COLORS[i % COLORS.length],
                        }}
                      />
                      <span className="text-xs text-gray-700">{s.status}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Departments</h4>
              <div className="space-y-2">
                {detail.departments.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 truncate">{d.department}</span>
                    <span className="text-xs font-bold text-gray-900">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources</h4>
              <div className="space-y-2">
                {detail.sources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 truncate">{s.source}</span>
                    <span className="text-xs font-bold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini funnel chart using recharts */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Pipeline per Position
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={detail.entries.map((e) => ({
                  position: e.positionTitle.length > 18
                    ? e.positionTitle.slice(0, 18) + "..."
                    : e.positionTitle,
                  CVs: e.totalCVs,
                  Interviewed: e.totalInterviewed,
                  Offered: e.totalOffered,
                  Joined: e.totalJoined,
                }))}
                barGap={1}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="position" fontSize={10} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="CVs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Interviewed" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offered" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Joined" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Position List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Assigned Positions ({detail.entries.length})
            </h3>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["#", "Position", "Dept", "Status", "CVs", "Interviewed", "Offered", "Joined"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-3 text-gray-500 font-semibold text-[10px] uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.entries.map((entry, i) => (
                    <tr
                      key={i}
                      className={`border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="py-2 px-3 text-gray-400 text-xs">{entry.srNo}</td>
                      <td className="py-2 px-3 text-gray-900 text-xs font-medium max-w-[140px] truncate">
                        {entry.positionTitle}
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs">{entry.department}</td>
                      <td className="py-2 px-3 text-xs">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            entry.positionStatus.toLowerCase() === "closed"
                              ? "bg-emerald-50 text-emerald-700"
                              : entry.positionStatus.toLowerCase() === "open"
                                ? "bg-blue-50 text-blue-700"
                                : entry.positionStatus.toLowerCase() === "hold"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {entry.positionStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-700 text-xs text-center">{entry.totalCVs || "—"}</td>
                      <td className="py-2 px-3 text-gray-700 text-xs text-center">{entry.totalInterviewed || "—"}</td>
                      <td className="py-2 px-3 text-gray-700 text-xs text-center">{entry.totalOffered || "—"}</td>
                      <td className="py-2 px-3 text-gray-700 text-xs text-center">{entry.totalJoined || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Dashboard ─── */
function Dashboard() {
  const {
    data,
    fetchData,
    loading,
    lastFetched,
    autoRefresh,
    setAutoRefresh,
    clearData,
  } = useDashboardStore();

  const [selectedRecruiter, setSelectedRecruiter] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data.length === 0) refresh();
  }, [data.length, refresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const totals = getTotals(data);
  const statusSummaries = getStatusSummaries(data);
  const departmentSummaries = getDepartmentSummaries(data);
  const recruiterSummaries = getRecruiterSummaries(data);
  const monthSummaries = getMonthSummaries(data);
  const sourceSummaries = getSourceSummaries(data);
  const budgetSummary = getBudgetSummary(data);

  const interviewToOfferRate = totals.totalInterviewed
    ? Math.round((totals.totalOffered / totals.totalInterviewed) * 100)
    : 0;
  const cvToInterviewRate = totals.totalCVs
    ? Math.round((totals.totalInterviewed / totals.totalCVs) * 100)
    : 0;

  const topDept = departmentSummaries[0];
  const topRecruiter = recruiterSummaries[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              HR
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Recruitment Dashboard
              </h1>
              <p className="text-xs text-gray-400">
                {lastFetched
                  ? `Updated ${lastFetched}`
                  : "Loading data..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              Auto-refresh
            </label>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={clearData}
              className="px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-medium text-gray-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* ─── Executive Summary Banner ─── */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200/40">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Executive Summary</h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                Hiring pipeline at a glance
              </p>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
              {totals.totalPositions} Total Positions
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-xs font-medium">
                Closure Rate
              </p>
              <p className="text-3xl font-bold mt-1">{totals.closureRate}%</p>
              <p className="text-indigo-300 text-xs mt-1">
                {totals.closed} of {totals.totalPositions} closed
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-xs font-medium">
                CV to Interview
              </p>
              <p className="text-3xl font-bold mt-1">{cvToInterviewRate}%</p>
              <p className="text-indigo-300 text-xs mt-1">
                {totals.totalInterviewed} of {totals.totalCVs} screened
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-xs font-medium">
                Interview to Offer
              </p>
              <p className="text-3xl font-bold mt-1">
                {interviewToOfferRate}%
              </p>
              <p className="text-indigo-300 text-xs mt-1">
                {totals.totalOffered} offers from {totals.totalInterviewed}{" "}
                interviews
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-xs font-medium">
                Offer to Join
              </p>
              <p className="text-3xl font-bold mt-1">
                {totals.offerToJoinRate}%
              </p>
              <p className="text-indigo-300 text-xs mt-1">
                {totals.totalJoined} joined of {totals.totalOffered} offered
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-1 text-xs text-indigo-200">
            <span>
              Top Department:{" "}
              <strong className="text-white">
                {topDept?.department || "-"}
              </strong>{" "}
              ({topDept?.totalPositions || 0} positions)
            </span>
            <span>
              Top Recruiter:{" "}
              <button
                onClick={() => topRecruiter && setSelectedRecruiter(topRecruiter.name)}
                className="font-bold text-white underline decoration-white/40 hover:decoration-white cursor-pointer transition-colors"
              >
                {topRecruiter?.name || "-"}
              </button>{" "}
              ({topRecruiter?.closureRate || 0}% closure)
            </span>
            <span>
              Budget:{" "}
              <strong className="text-white">
                {budgetSummary[0]?.count || 0} within
              </strong>
              ,{" "}
              <strong className="text-amber-300">
                {budgetSummary[1]?.count || 0} over
              </strong>
            </span>
            <span>
              Open roles:{" "}
              <strong className="text-white">{totals.open}</strong> | On hold:{" "}
              <strong className="text-amber-300">{totals.hold}</strong>
            </span>
          </div>
        </div>

        {/* ─── KPI Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <MetricCard
            icon="📋"
            label="Total Positions"
            value={totals.totalPositions}
            accentColor="#4f46e5"
          />
          <MetricCard
            icon="✅"
            label="Closed"
            value={totals.closed}
            subtext={`${totals.closureRate}% closure`}
            accentColor="#059669"
            trend="up"
          />
          <MetricCard
            icon="🔵"
            label="Open"
            value={totals.open}
            accentColor="#2563eb"
            trend={totals.open > 5 ? "up" : "neutral"}
          />
          <MetricCard
            icon="⏸"
            label="On Hold"
            value={totals.hold}
            accentColor="#d97706"
            trend={totals.hold > 3 ? "down" : "neutral"}
          />
          <MetricCard
            icon="📄"
            label="CVs Screened"
            value={totals.totalCVs}
            accentColor="#7c3aed"
          />
          <MetricCard
            icon="🎙"
            label="Interviewed"
            value={totals.totalInterviewed}
            subtext={`${cvToInterviewRate}% of CVs`}
            accentColor="#0891b2"
          />
          <MetricCard
            icon="📨"
            label="Offered"
            value={totals.totalOffered}
            subtext={`${interviewToOfferRate}% of interviews`}
            accentColor="#0284c7"
          />
          <MetricCard
            icon="🎉"
            label="Joined"
            value={totals.totalJoined}
            subtext={`${totals.offerToJoinRate}% of offers`}
            accentColor="#dc2626"
            trend="up"
          />
        </div>

        {/* ─── Recruitment Funnel ─── */}
        <Section
          title="Recruitment Funnel"
          subtitle="Conversion at each stage of the hiring pipeline"
        >
          <div className="grid grid-cols-5 gap-4 mt-2">
            {[
              {
                label: "CVs Screened",
                value: totals.totalCVs,
                color: "#4f46e5",
                bg: "bg-indigo-50",
              },
              {
                label: "Interviewed",
                value: totals.totalInterviewed,
                color: "#7c3aed",
                bg: "bg-violet-50",
              },
              {
                label: "Offered",
                value: totals.totalOffered,
                color: "#059669",
                bg: "bg-emerald-50",
              },
              {
                label: "Accepted",
                value: totals.totalAccepted,
                color: "#0891b2",
                bg: "bg-cyan-50",
              },
              {
                label: "Joined",
                value: totals.totalJoined,
                color: "#d97706",
                bg: "bg-amber-50",
              },
            ].map((stage, i) => {
              const maxVal = totals.totalCVs || 1;
              const pct = Math.round((stage.value / maxVal) * 100);
              const prevValue = i === 0 ? stage.value : [
                totals.totalCVs,
                totals.totalInterviewed,
                totals.totalOffered,
                totals.totalAccepted,
              ][i - 1] || 1;
              const dropoff =
                i === 0
                  ? null
                  : prevValue
                    ? Math.round((stage.value / prevValue) * 100)
                    : 0;

              return (
                <div key={i} className="text-center relative">
                  {/* Connector arrow */}
                  {i > 0 && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full text-gray-300 text-lg hidden md:block">
                      &rarr;
                    </div>
                  )}
                  <div
                    className={`${stage.bg} rounded-2xl p-4 flex flex-col items-center`}
                  >
                    <div className="relative w-full h-28 flex items-end justify-center mb-3">
                      <div
                        className="rounded-xl w-14 transition-all"
                        style={{
                          height: `${Math.max(pct, 8)}%`,
                          backgroundColor: stage.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: stage.color }}
                    >
                      {stage.value}
                    </p>
                    <p className="text-xs font-medium text-gray-600 mt-1">
                      {stage.label}
                    </p>
                    {dropoff !== null && (
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {dropoff}% conversion
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ─── Charts Row 1: Status + Monthly Trend ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Position Status" subtitle="Current status distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusSummaries}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {statusSummaries.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        STATUS_COLORS[entry.status] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            {/* Status legend */}
            <div className="flex justify-center gap-6 mt-2">
              {statusSummaries.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[s.status] || COLORS[i % COLORS.length],
                    }}
                  />
                  <span className="text-gray-600 font-medium">
                    {s.status}
                  </span>
                  <span className="text-gray-400">{s.count}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Monthly Hiring Trend"
            subtitle="Positions received vs closed over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthSummaries}>
                <defs>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="closedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="positions"
                  name="Received"
                  stroke="#4f46e5"
                  fill="url(#posGrad)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke="#059669"
                  fill="url(#closedGrad)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="joined"
                  name="Joined"
                  stroke="#d97706"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ─── Charts Row 2: Department + Sources ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section
            title="Department Breakdown"
            subtitle="Positions by department and status"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentSummaries} barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="department"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="totalPositions"
                  name="Total"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="closedPositions"
                  name="Closed"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="openPositions"
                  name="Open"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="holdPositions"
                  name="Hold"
                  fill="#d97706"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section
            title="Hiring Sources"
            subtitle="Where candidates are coming from"
          >
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={sourceSummaries}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {sourceSummaries.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 min-w-[160px]">
                {sourceSummaries.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                    <span className="text-xs text-gray-600 flex-1 truncate">
                      {s.source}
                    </span>
                    <span className="text-xs font-semibold text-gray-900">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ─── Recruiter Performance Chart ─── */}
        <Section
          title="Recruiter Performance"
          subtitle="CVs screened, interviewed, offered and joined per recruiter"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={recruiterSummaries} layout="vertical" barGap={2}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                width={90}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="totalCVs"
                name="CVs"
                fill="#4f46e5"
                radius={[0, 6, 6, 0]}
              />
              <Bar
                dataKey="totalInterviewed"
                name="Interviewed"
                fill="#7c3aed"
                radius={[0, 6, 6, 0]}
              />
              <Bar
                dataKey="totalOffered"
                name="Offered"
                fill="#059669"
                radius={[0, 6, 6, 0]}
              />
              <Bar
                dataKey="totalJoined"
                name="Joined"
                fill="#d97706"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* ─── Budget + Closure Rate Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget */}
          <Section
            title="Budget Status"
            subtitle="Cost of hiring within vs over budget"
          >
            <div className="flex items-center gap-8 mt-4">
              {budgetSummary.map((b, i) => {
                const total =
                  (budgetSummary[0]?.count || 0) +
                  (budgetSummary[1]?.count || 0);
                const pct = total
                  ? Math.round((b.count / total) * 100)
                  : 0;
                return (
                  <div key={i} className="flex-1">
                    <div className="flex items-end gap-3 mb-2">
                      <span
                        className="text-4xl font-bold"
                        style={{
                          color: i === 0 ? "#059669" : "#d97706",
                        }}
                      >
                        {b.count}
                      </span>
                      <span className="text-sm text-gray-400 pb-1">
                        ({pct}%)
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {b.label}
                    </p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            i === 0 ? "#059669" : "#d97706",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Closure Rate */}
          <Section
            title="Recruiter Closure Rate"
            subtitle="Percentage of positions closed by recruiter"
          >
            <div className="space-y-4 mt-2">
              {recruiterSummaries.map((r) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => setSelectedRecruiter(r.name)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-left transition-colors"
                    >
                      {r.name}
                    </button>
                    <span className="text-sm font-bold text-gray-900">
                      {r.closureRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${r.closureRate}%`,
                        background:
                          r.closureRate >= 60
                            ? "linear-gradient(90deg, #059669, #34d399)"
                            : r.closureRate >= 40
                              ? "linear-gradient(90deg, #d97706, #fbbf24)"
                              : "linear-gradient(90deg, #dc2626, #f87171)",
                      }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1 text-[10px] text-gray-400">
                    <span>{r.closedPositions} closed</span>
                    <span>{r.openPositions} open</span>
                    <span>{r.totalPositions} total</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ─── Recruiter Table ─── */}
        <Section
          title="Recruiter Detailed Breakdown"
          subtitle="Complete recruiter-wise metrics"
        >
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    "Recruiter",
                    "Positions",
                    "Closed",
                    "Open",
                    "CVs",
                    "Interviewed",
                    "Offered",
                    "Accepted",
                    "Joined",
                    "Closure %",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recruiterSummaries.map((r) => (
                  <tr
                    key={r.name}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setSelectedRecruiter(r.name)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                      >
                        {r.name}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {r.totalPositions}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-medium">
                      {r.closedPositions}
                    </td>
                    <td className="py-3 px-3 text-blue-600 font-medium">
                      {r.openPositions}
                    </td>
                    <td className="py-3 px-3 text-gray-700">{r.totalCVs}</td>
                    <td className="py-3 px-3 text-gray-700">
                      {r.totalInterviewed}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {r.totalOffered}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {r.totalAccepted}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {r.totalJoined}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.closureRate >= 60
                            ? "bg-emerald-50 text-emerald-700"
                            : r.closureRate >= 40
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {r.closureRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ─── All Positions Table ─── */}
        <Section
          title={`All Positions (${data.length})`}
          subtitle="Complete position-wise tracker"
        >
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto mt-2 rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {[
                    "#",
                    "Position",
                    "Department",
                    "Location",
                    "Status",
                    "Candidate",
                    "Recruiter",
                    "CVs",
                    "Interviewed",
                    "Offered",
                    "Joined",
                    "Source",
                    "Hiring Manager",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-3 text-gray-500 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((entry, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-gray-400 text-xs">
                      {entry.srNo}
                    </td>
                    <td className="py-2.5 px-3 text-gray-900 text-xs font-medium max-w-[160px] truncate">
                      {entry.positionTitle}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-xs">
                      {entry.department}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-xs">
                      {entry.location}
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          entry.positionStatus.toLowerCase() === "closed"
                            ? "bg-emerald-50 text-emerald-700"
                            : entry.positionStatus.toLowerCase() === "open"
                              ? "bg-blue-50 text-blue-700"
                              : entry.positionStatus.toLowerCase() === "hold"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {entry.positionStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-xs max-w-[120px] truncate">
                      {entry.candidateSelected || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <button
                        onClick={() => setSelectedRecruiter(entry.recruiterName.trim())}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                      >
                        {entry.recruiterName}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 text-xs text-center font-medium">
                      {entry.totalCVs || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 text-xs text-center font-medium">
                      {entry.totalInterviewed || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 text-xs text-center font-medium">
                      {entry.totalOffered || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 text-xs text-center font-medium">
                      {entry.totalJoined || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {entry.source || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {entry.hiringManager}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">
            HR Recruitment Dashboard &middot; Data synced from Google Sheets
          </p>
        </div>
      </main>

      {/* Recruiter Detail Slide-Over */}
      {selectedRecruiter && (
        <RecruiterDetailPanel
          data={data}
          recruiterName={selectedRecruiter}
          onClose={() => setSelectedRecruiter(null)}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, sheetUrl } = useDashboardStore();

  if (!sheetUrl || data.length === 0) {
    return <SheetSetup />;
  }

  return <Dashboard />;
}
