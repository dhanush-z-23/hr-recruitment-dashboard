import type { RecruitmentEntry } from "@/types/dashboard";

/**
 * Proper CSV parser that handles:
 * - Multiline quoted fields (e.g. "Position\nNew / Replacement\n")
 * - Escaped quotes ("" inside quoted fields)
 * - Currency symbols, commas inside quoted values
 * - Formula outputs like #DIV/0!
 */
function parseCsvFull(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        // Inside quotes: include everything including newlines
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentField.trim());
        currentField = "";
        // Skip \r\n combo
        if (char === "\r" && i + 1 < csvText.length && csvText[i + 1] === "\n") {
          i++;
        }
        if (currentRow.some((f) => f !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Push last field and row
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function parseNum(val: string): number {
  if (!val) return 0;
  // Remove currency symbols, commas, spaces
  const cleaned = val.replace(/[₹,\s]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

function parsePercent(val: string): string {
  if (!val || val.includes("#DIV/0!") || val.includes("#REF!") || val.includes("#N/A")) {
    return "N/A";
  }
  return val;
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
  const allRows = parseCsvFull(csvText);
  if (allRows.length < 2) return [];

  // Normalize headers: replace newlines with spaces, lowercase, trim
  const rawHeaders = allRows[0];
  const headers = rawHeaders.map((h) =>
    h
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim()
  );

  // Log for debugging (visible in browser console)
  console.log(`[HR Dashboard] Parsed ${allRows.length - 1} data rows, ${headers.length} columns`);
  console.log(`[HR Dashboard] Headers:`, headers);

  return allRows
    .slice(1)
    .map((values) => {
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });

      // Flexible getter that tries multiple header variations
      const get = (...keys: string[]) => {
        for (const k of keys) {
          // Try exact match
          if (row[k] !== undefined && row[k] !== "") return row[k];
          // Try normalized match (collapse whitespace)
          const normalized = k.replace(/\s+/g, " ").trim();
          if (row[normalized] !== undefined && row[normalized] !== "")
            return row[normalized];
        }
        // Try partial match as fallback
        for (const k of keys) {
          for (const header of headers) {
            if (header.includes(k) && row[header] !== undefined && row[header] !== "") {
              return row[header];
            }
          }
        }
        return "";
      };

      return {
        srNo: get("sr no.", "sr no"),
        positionTitle: get("position title"),
        department: get("department"),
        location: get("location"),
        salaryBudget: get("salary budget (per annum)", "salary budget"),
        offeredSalary: get("offered salary (per annum)", "offered salary"),
        overBudget: get("over budget"),
        costBucket: get("cost of hiring bucket"),
        positionReceivedDate: get("position received by hr"),
        positionReceivedMonth: parseNum(
          get("position received by hr (month)")
        ),
        postedEmployeeReferral: get("posted employee referral"),
        totalPositions: parseNum(get("total no of positions")),
        vacantPositions: parseNum(get("no of positions vacant")),
        approved: get("position approved yes/no"),
        newOrReplacement: get("position new / replacement"),
        exitingStaff: get("if replacement exiting staff (name)"),
        reasonForExit: get("reason for exit"),
        hiringManager: get("hiring manager"),
        skipLevelManager: get("skip level hiring manager"),
        positionStatus: get("position status (dropdown)", "position status"),
        candidateSelected: get("name of candidate selected"),
        candidateStatus: get("candidate status (from dropdown)", "candidate status"),
        doj: get("doj dd/mm/yy", "doj"),
        monthOfJoining: get("month of joining"),
        internalExternal: get("internal/external", "internal/ external"),
        source: get("source", " source"),
        sourceName: get("name of the source"),
        offerMailDate: get("date of the offer mail send to the candidate"),
        referralDate: get("date when candidate was referred by employee"),
        comments: get("comments"),
        actualDaysReqToOffer: get("actual days - req to offer"),
        targetStatusReqToOffer: get("target status - req to offer"),
        actualDaysReqToDoj: get("actual days req to doj"),
        targetStatusReqToDoj: get("target status - req to doj"),
        recruiterName: get("recruiter name"),
        totalCVs: parseNum(get("total no of cvs provided")),
        totalInterviewed: parseNum(get("total no of candidates interviewed")),
        r1: parseNum(get("r1")),
        r2: parseNum(get("r2")),
        r3: parseNum(get("r3")),
        r4: parseNum(get("r4")),
        totalOffered: parseNum(get("total no of candidates offered")),
        totalAcceptedOffer: parseNum(
          get("total no of candidates accepted offer")
        ),
        totalJoined: parseNum(get("total no of candidates joined")),
        cvToSelectionRatio: parsePercent(get("cv to selection ratio")),
        interviewToOfferRatio: parsePercent(get("interview to offer ratio")),
        offerToAcceptanceRatio: parsePercent(get("offer to acceptance ratio")),
        consultantCost: get("consultant cost / referral cost"),
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
