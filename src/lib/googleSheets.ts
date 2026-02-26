import type { RecruitmentEntry } from "@/types/dashboard";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseNum(val: string): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function buildCsvUrl(url: string): string {
  // Handle published URL format: /d/e/XXXX/pubhtml or /d/e/XXXX/pub
  const pubMatch = url.match(
    /\/spreadsheets\/d\/e\/(2PACX-[a-zA-Z0-9_-]+)\/(pub|pubhtml)/
  );
  if (pubMatch) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
  }

  // Handle regular URL format: /d/SHEET_ID/edit
  const editMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (editMatch) {
    return `https://docs.google.com/spreadsheets/d/${editMatch[1]}/export?format=csv&gid=0`;
  }

  throw new Error("Invalid Google Sheet URL");
}

export function parseCsv(csvText: string): RecruitmentEntry[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });

      const get = (...keys: string[]) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== "") return row[k];
        }
        return "";
      };

      return {
        srNo: get("sr no.", "sr no", "s.no"),
        positionTitle: get("position title", "position", "title", "role"),
        department: get("department", "dept"),
        location: get("location", "city"),
        salaryBudget: get("salary budget (per annum)", "salary budget"),
        offeredSalary: get("offered salary (per annum)", "offered salary"),
        overBudget: get("over budget"),
        costBucket: get("cost of hiring bucket", "cost bucket"),
        positionReceivedDate: get(
          "position received by hr",
          "position received"
        ),
        positionReceivedMonth: parseNum(
          get("position received by hr (month)", "month")
        ),
        postedEmployeeReferral: get("posted employee referral"),
        totalPositions: parseNum(get("total no of positions", "total positions")),
        vacantPositions: parseNum(
          get("no of positions vacant", "vacant positions")
        ),
        approved: get("position approved yes/no", "approved"),
        newOrReplacement: get(
          "position\nnew / replacement\n",
          "position\nnew / replacement",
          "new / replacement",
          "new/replacement"
        ),
        exitingStaff: get(
          "if replacement exiting staff (name)",
          "exiting staff"
        ),
        reasonForExit: get("reason for exit"),
        hiringManager: get("hiring manager"),
        skipLevelManager: get("skip level hiring manager"),
        positionStatus: get("position status (dropdown)", "position status"),
        candidateSelected: get(
          "name of candidate selected",
          "candidate selected"
        ),
        candidateStatus: get(
          "candidate status (from dropdown)",
          "candidate status"
        ),
        doj: get("doj\ndd/mm/yy", "doj"),
        monthOfJoining: get("month of joining"),
        internalExternal: get("internal/external", "internal/ external"),
        source: get("source", " source"),
        sourceName: get("name of the source"),
        offerMailDate: get(
          "date of the offer mail send to the candidate",
          "offer date"
        ),
        referralDate: get(
          "date when candidate was referred by employee",
          "referral date"
        ),
        comments: get("comments"),
        actualDaysReqToOffer: get(
          "actual days - req to offer",
          "actual days req to offer"
        ),
        targetStatusReqToOffer: get(
          "target status - req to offer",
          "target status req to offer"
        ),
        actualDaysReqToDoj: get(
          "actual days req to doj",
          "actual days - req to doj"
        ),
        targetStatusReqToDoj: get(
          "target status - req to doj",
          "target status req to doj"
        ),
        recruiterName: get("recruiter name", "recruiter"),
        totalCVs: parseNum(
          get("total no of cvs provided", "total cvs provided", "total cvs")
        ),
        totalInterviewed: parseNum(
          get(
            "total no of candidates interviewed",
            "total interviewed",
            "candidates interviewed"
          )
        ),
        r1: parseNum(get("r1")),
        r2: parseNum(get("r2")),
        r3: parseNum(get("r3")),
        r4: parseNum(get("r4")),
        totalOffered: parseNum(
          get(
            "total no of candidates offered",
            "total offered",
            "candidates offered"
          )
        ),
        totalAcceptedOffer: parseNum(
          get(
            "total no of candidates accepted offer",
            "total accepted offer",
            "accepted offer"
          )
        ),
        totalJoined: parseNum(
          get(
            "total no of candidates joined",
            "total joined",
            "candidates joined"
          )
        ),
        cvToSelectionRatio: get("cv to selection ratio"),
        interviewToOfferRatio: get("interview to offer ratio"),
        offerToAcceptanceRatio: get("offer to acceptance ratio"),
        consultantCost: get("consultant cost / referral cost", "consultant cost"),
      };
    })
    .filter((entry) => entry.srNo || entry.positionTitle);
}

export async function fetchSheetData(
  sheetUrl: string
): Promise<RecruitmentEntry[]> {
  const csvUrl = buildCsvUrl(sheetUrl);
  const response = await fetch(csvUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      "Failed to fetch sheet. Make sure it is published to the web."
    );
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}
