import {
  getDashboardMetrics,
  getMonthlyData,
  getRecentTransactions,
  getDashboardSummary,
} from "./actions";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const [metrics, monthlyData, recentTransactions, summary] = await Promise.all([
    getDashboardMetrics(),
    getMonthlyData(),
    getRecentTransactions(8),
    getDashboardSummary(),
  ]);

  return (
    <DashboardClient
      data={{
        metrics,
        monthlyData,
        recentTransactions,
        summary,
      }}
    />
  );
}
