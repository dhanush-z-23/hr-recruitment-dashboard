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
} from "@/lib/dashboardUtils";
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
} from "recharts";

const COLORS = [
  "#6366f1",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#8b5cf6",
  "#60a5fa",
  "#fb923c",
  "#a3e635",
  "#e879f9",
  "#2dd4bf",
];

const STATUS_COLORS: Record<string, string> = {
  Closed: "#34d399",
  Open: "#60a5fa",
  Hold: "#fbbf24",
};

function SheetSetup() {
  const { sheetUrl, setSheetUrl, fetchData, loading, error } =
    useDashboardStore();
  const [inputUrl, setInputUrl] = useState(sheetUrl);

  const handleConnect = () => {
    setSheetUrl(inputUrl);
    setTimeout(() => fetchData(), 0);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            HR Recruitment Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Connect your Google Sheet to visualize hiring data
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">
            Connect Google Sheet
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste your Google Sheet published URL here..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleConnect}
              disabled={loading || !inputUrl}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? "Connecting..." : "Connect & Load Data"}
            </button>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/30",
    green: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/30",
    purple: "from-purple-600/20 to-purple-600/5 border-purple-500/30",
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/30",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-500/30",
    rose: "from-rose-600/20 to-rose-600/5 border-rose-500/30",
    cyan: "from-cyan-600/20 to-cyan-600/5 border-cyan-500/30",
    teal: "from-teal-600/20 to-teal-600/5 border-teal-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.indigo} border rounded-xl p-5`}
    >
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recruitment Dashboard</h1>
            <p className="text-gray-500 text-sm">
              {lastFetched
                ? `Last updated: ${lastFetched}`
                : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-indigo-600"
              />
              Auto-refresh (5m)
            </label>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh Now"}
            </button>
            <button
              onClick={clearData}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard
            label="Total Positions"
            value={totals.totalPositions}
            color="indigo"
          />
          <StatCard
            label="Closed"
            value={totals.closed}
            subtext={`${totals.closureRate}% closure`}
            color="green"
          />
          <StatCard
            label="Open"
            value={totals.open}
            color="blue"
          />
          <StatCard
            label="On Hold"
            value={totals.hold}
            color="amber"
          />
          <StatCard
            label="CVs Screened"
            value={totals.totalCVs}
            color="purple"
          />
          <StatCard
            label="Interviewed"
            value={totals.totalInterviewed}
            color="cyan"
          />
          <StatCard
            label="Offered"
            value={totals.totalOffered}
            color="teal"
          />
          <StatCard
            label="Joined"
            value={totals.totalJoined}
            subtext={`${totals.offerToJoinRate}% offer-to-join`}
            color="rose"
          />
        </div>

        {/* Row: Position Status Pie + Monthly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Status */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">
              Position Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusSummaries}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Hiring Trend */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">
              Monthly Hiring Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthSummaries}>
                <defs>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="positions"
                  name="Positions Received"
                  stroke="#6366f1"
                  fill="url(#posGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke="#34d399"
                  fill="url(#closedGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="joined"
                  name="Joined"
                  stroke="#fbbf24"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row: Department Breakdown + Hiring Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">
              Department Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentSummaries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="department"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalPositions"
                  name="Total"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="closedPositions"
                  name="Closed"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="openPositions"
                  name="Open"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="holdPositions"
                  name="Hold"
                  fill="#fbbf24"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hiring Sources */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Hiring Sources</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceSummaries}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {sourceSummaries.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recruiter Performance */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">
            Recruiter Performance
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={recruiterSummaries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar
                dataKey="totalCVs"
                name="CVs Screened"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="totalInterviewed"
                name="Interviewed"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="totalOffered"
                name="Offered"
                fill="#34d399"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="totalJoined"
                name="Joined"
                fill="#fbbf24"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel / Pipeline */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">
            Recruitment Funnel
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              {
                label: "CVs Screened",
                value: totals.totalCVs,
                color: "bg-indigo-500",
              },
              {
                label: "Interviewed",
                value: totals.totalInterviewed,
                color: "bg-purple-500",
              },
              {
                label: "Offered",
                value: totals.totalOffered,
                color: "bg-emerald-500",
              },
              {
                label: "Accepted",
                value: totals.totalAccepted,
                color: "bg-blue-500",
              },
              {
                label: "Joined",
                value: totals.totalJoined,
                color: "bg-amber-500",
              },
            ].map((stage, i) => {
              const maxVal = totals.totalCVs || 1;
              const pct = Math.round((stage.value / maxVal) * 100);
              return (
                <div key={i} className="text-center">
                  <div className="relative h-40 flex items-end justify-center mb-2">
                    <div
                      className={`${stage.color} rounded-t-lg w-full max-w-[80px] transition-all`}
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stage.value}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{stage.label}</p>
                  {i > 0 && (
                    <p className="text-gray-600 text-xs">{pct}% of CVs</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Budget Status</h2>
            <div className="flex items-center gap-6">
              {budgetSummary.map((b, i) => (
                <div key={i} className="flex-1 text-center">
                  <div
                    className={`text-4xl font-bold ${i === 0 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {b.count}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Closure Rate */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">
              Recruiter Closure Rate
            </h2>
            <div className="space-y-3">
              {recruiterSummaries.map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-24 truncate">
                    {r.name}
                  </span>
                  <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                      style={{ width: `${r.closureRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-12 text-right">
                    {r.closureRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recruiter Detailed Table */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">
            Recruiter Detailed Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
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
                      className="text-left py-3 px-3 text-gray-400 font-medium"
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
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="py-3 px-3 font-medium text-white">
                      {r.name}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.totalPositions}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">
                      {r.closedPositions}
                    </td>
                    <td className="py-3 px-3 text-blue-400">
                      {r.openPositions}
                    </td>
                    <td className="py-3 px-3 text-gray-300">{r.totalCVs}</td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.totalInterviewed}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.totalOffered}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.totalAccepted}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {r.totalJoined}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.closureRate >= 60
                            ? "bg-emerald-500/20 text-emerald-400"
                            : r.closureRate >= 40
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
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
        </div>

        {/* Full Position List */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">
            All Positions ({data.length})
          </h2>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800">
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
                      className="text-left py-3 px-2 text-gray-400 font-medium text-xs whitespace-nowrap"
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
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="py-2 px-2 text-gray-500 text-xs">
                      {entry.srNo}
                    </td>
                    <td className="py-2 px-2 text-white text-xs font-medium max-w-[150px] truncate">
                      {entry.positionTitle}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs">
                      {entry.department}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs">
                      {entry.location}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.positionStatus.toLowerCase() === "closed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : entry.positionStatus.toLowerCase() === "open"
                              ? "bg-blue-500/20 text-blue-400"
                              : entry.positionStatus.toLowerCase() === "hold"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {entry.positionStatus}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs max-w-[120px] truncate">
                      {entry.candidateSelected || "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs">
                      {entry.recruiterName}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs text-center">
                      {entry.totalCVs}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs text-center">
                      {entry.totalInterviewed}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs text-center">
                      {entry.totalOffered}
                    </td>
                    <td className="py-2 px-2 text-gray-300 text-xs text-center">
                      {entry.totalJoined}
                    </td>
                    <td className="py-2 px-2 text-gray-400 text-xs">
                      {entry.source || "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-400 text-xs">
                      {entry.hiringManager}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
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
