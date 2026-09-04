import {
  getDashboardMetrics,
  getMonthlyData,
  getRecentTransactions,
  getDashboardSummary,
  getComparativeMetrics,
  getYearComparison,
} from "./actions";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const [metrics, monthlyData, recentTransactions, summary, comparative, yearComparison] =
    await Promise.all([
      getDashboardMetrics(),
      getMonthlyData(),
      getRecentTransactions(8),
      getDashboardSummary(),
      getComparativeMetrics(),
      getYearComparison(),
    ]);

  return (
    <DashboardClient
      data={{
        metrics,
        monthlyData,
        recentTransactions,
        summary,
        comparative,
        yearComparison,
      }}
    />
  );
}
