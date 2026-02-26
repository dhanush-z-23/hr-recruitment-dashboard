export interface RecruitmentEntry {
  srNo: string;
  positionTitle: string;
  department: string;
  location: string;
  salaryBudget: string;
  offeredSalary: string;
  overBudget: string;
  costBucket: string;
  positionReceivedDate: string;
  positionReceivedMonth: number;
  postedEmployeeReferral: string;
  totalPositions: number;
  vacantPositions: number;
  approved: string;
  newOrReplacement: string;
  exitingStaff: string;
  reasonForExit: string;
  hiringManager: string;
  skipLevelManager: string;
  positionStatus: string;
  candidateSelected: string;
  candidateStatus: string;
  doj: string;
  monthOfJoining: string;
  internalExternal: string;
  source: string;
  sourceName: string;
  offerMailDate: string;
  referralDate: string;
  comments: string;
  actualDaysReqToOffer: string;
  targetStatusReqToOffer: string;
  actualDaysReqToDoj: string;
  targetStatusReqToDoj: string;
  recruiterName: string;
  totalCVs: number;
  totalInterviewed: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  totalOffered: number;
  totalAcceptedOffer: number;
  totalJoined: number;
  cvToSelectionRatio: string;
  interviewToOfferRatio: string;
  offerToAcceptanceRatio: string;
  consultantCost: string;
}

export interface DepartmentSummary {
  department: string;
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  holdPositions: number;
  totalCVs: number;
  totalInterviewed: number;
  totalOffered: number;
  totalJoined: number;
}

export interface RecruiterSummary {
  name: string;
  totalPositions: number;
  closedPositions: number;
  openPositions: number;
  totalCVs: number;
  totalInterviewed: number;
  totalOffered: number;
  totalAccepted: number;
  totalJoined: number;
  closureRate: number;
}

export interface StatusSummary {
  status: string;
  count: number;
}

export interface MonthSummary {
  month: string;
  positions: number;
  closed: number;
  joined: number;
}

export interface SourceSummary {
  source: string;
  count: number;
}
