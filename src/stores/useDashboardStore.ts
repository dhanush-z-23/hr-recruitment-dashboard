import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecruitmentEntry } from "@/types/dashboard";
import { fetchSheetData } from "@/lib/googleSheets";

interface DashboardState {
  sheetUrl: string;
  data: RecruitmentEntry[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  autoRefresh: boolean;
  setSheetUrl: (url: string) => void;
  fetchData: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  clearData: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      sheetUrl: "",
      data: [],
      loading: false,
      error: null,
      lastFetched: null,
      autoRefresh: true,

      setSheetUrl: (url) => set({ sheetUrl: url }),

      fetchData: async () => {
        const { sheetUrl } = get();
        if (!sheetUrl) {
          set({ error: "Please enter a Google Sheet URL" });
          return;
        }

        set({ loading: true, error: null });

        try {
          const data = await fetchSheetData(sheetUrl);
          set({
            data,
            loading: false,
            lastFetched: new Date().toLocaleString(),
          });
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Failed to fetch data",
            loading: false,
          });
        }
      },

      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

      clearData: () =>
        set({ data: [], sheetUrl: "", lastFetched: null, error: null }),
    }),
    {
      name: "hr-dashboard-config",
      partialize: (state) => ({
        sheetUrl: state.sheetUrl,
        autoRefresh: state.autoRefresh,
      }),
    }
  )
);
