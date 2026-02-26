import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Recruitment Dashboard",
  description: "Real-time recruitment interview tracking dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
