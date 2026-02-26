import type {
  RecruitmentEntry,
  DepartmentSummary,
  RecruiterSummary,
  StatusSummary,
  MonthSummary,
  SourceSummary,
} from "@/types/dashboard";

export function getTotals(data: RecruitmentEntry[]) {
  const totalPositions = data.length;
  const closed = data.filter(
    (d) => d.positionStatus.toLowerCase() === "closed"
  ).length;
  const open = data.filter(
    (d) => d.positionStatus.toLowerCase() === "open"
  ).length;
  const hold = data.filter(
    (d) => d.positionStatus.toLowerCase() === "hold"
  ).length;
  const totalCVs = data.reduce((sum, d) => sum + d.totalCVs, 0);
  const totalInterviewed = data.reduce(
    (sum, d) => sum + d.totalInterviewed,
    0
  );
  const totalOffered = data.reduce((sum, d) => sum + d.totalOffered, 0);
  const totalJoined = data.reduce((sum, d) => sum + d.totalJoined, 0);
  const totalAccepted = data.reduce(
    (sum, d) => sum + d.totalAcceptedOffer,
    0
  );
  const recruiters = new Set(
    data.map((d) => d.recruiterName.trim()).filter(Boolean)
  ).size;

  return {
    totalPositions,
    closed,
    open,
    hold,
    totalCVs,
    totalInterviewed,
    totalOffered,
    totalAccepted,
    totalJoined,
    recruiters,
    closureRate: totalPositions
      ? Math.round((closed / totalPositions) * 100)
      : 0,
    offerToJoinRate: totalOffered
      ? Math.round((totalJoined / totalOffered) * 100)
      : 0,
  };
}

export function getStatusSummaries(data: RecruitmentEntry[]): StatusSummary[] {
  const counts = new Map<string, number>();
  data.forEach((d) => {
    const status = d.positionStatus.trim() || "Unknown";
    counts.set(status, (counts.get(status) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export function getDepartmentSummaries(
  data: RecruitmentEntry[]
): DepartmentSummary[] {
  const byDept = new Map<string, RecruitmentEntry[]>();
  data.forEach((d) => {
    const dept = d.department.trim() || "Unspecified";
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept)!.push(d);
  });

  return Array.from(byDept.entries())
    .map(([department, entries]) => ({
      department,
      totalPositions: entries.length,
      openPositions: entries.filter(
        (e) => e.positionStatus.toLowerCase() === "open"
      ).length,
      closedPositions: entries.filter(
        (e) => e.positionStatus.toLowerCase() === "closed"
      ).length,
      holdPositions: entries.filter(
        (e) => e.positionStatus.toLowerCase() === "hold"
      ).length,
      totalCVs: entries.reduce((s, e) => s + e.totalCVs, 0),
      totalInterviewed: entries.reduce((s, e) => s + e.totalInterviewed, 0),
      totalOffered: entries.reduce((s, e) => s + e.totalOffered, 0),
      totalJoined: entries.reduce((s, e) => s + e.totalJoined, 0),
    }))
    .sort((a, b) => b.totalPositions - a.totalPositions);
}

export function getRecruiterSummaries(
  data: RecruitmentEntry[]
): RecruiterSummary[] {
  const byRecruiter = new Map<string, RecruitmentEntry[]>();
  data.forEach((d) => {
    const name = d.recruiterName.trim();
    if (!name) return;
    if (!byRecruiter.has(name)) byRecruiter.set(name, []);
    byRecruiter.get(name)!.push(d);
  });

  return Array.from(byRecruiter.entries())
    .map(([name, entries]) => {
      const totalPositions = entries.length;
      const closedPositions = entries.filter(
        (e) => e.positionStatus.toLowerCase() === "closed"
      ).length;
      return {
        name,
        totalPositions,
        closedPositions,
        openPositions: entries.filter(
          (e) => e.positionStatus.toLowerCase() === "open"
        ).length,
        totalCVs: entries.reduce((s, e) => s + e.totalCVs, 0),
        totalInterviewed: entries.reduce((s, e) => s + e.totalInterviewed, 0),
        totalOffered: entries.reduce((s, e) => s + e.totalOffered, 0),
        totalAccepted: entries.reduce((s, e) => s + e.totalAcceptedOffer, 0),
        totalJoined: entries.reduce((s, e) => s + e.totalJoined, 0),
        closureRate: totalPositions
          ? Math.round((closedPositions / totalPositions) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.totalPositions - a.totalPositions);
}

const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getMonthSummaries(data: RecruitmentEntry[]): MonthSummary[] {
  const byMonth = new Map<number, RecruitmentEntry[]>();
  data.forEach((d) => {
    const m = d.positionReceivedMonth;
    if (m < 1 || m > 12) return;
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(d);
  });

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, entries]) => ({
      month: MONTH_NAMES[month] || `M${month}`,
      positions: entries.length,
      closed: entries.filter(
        (e) => e.positionStatus.toLowerCase() === "closed"
      ).length,
      joined: entries.reduce((s, e) => s + e.totalJoined, 0),
    }));
}

export function getSourceSummaries(
  data: RecruitmentEntry[]
): SourceSummary[] {
  const counts = new Map<string, number>();
  data.forEach((d) => {
    const source = d.source.trim() || d.sourceName.trim() || "Not Specified";
    counts.set(source, (counts.get(source) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .filter((s) => s.source !== "Not Specified" || s.count > 1)
    .sort((a, b) => b.count - a.count);
}

export function getBudgetSummary(data: RecruitmentEntry[]) {
  const withinBudget = data.filter(
    (d) => d.costBucket.toLowerCase().includes("within")
  ).length;
  const overBudget = data.filter(
    (d) => d.costBucket.toLowerCase().includes("over")
  ).length;
  return [
    { label: "Within Budget", count: withinBudget },
    { label: "Over Budget", count: overBudget },
  ];
}
