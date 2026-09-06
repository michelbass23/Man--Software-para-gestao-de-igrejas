"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import AlertToast from "@/components/AlertToast";
import DemoUpgradePrompt from "@/components/DemoUpgradePrompt";
import OverdueBanner from "@/components/OverdueBanner";
import TrialGate from "@/components/TrialGate";

interface DashboardShellProps {
  children: React.ReactNode;
  tenantName: string;
  tenantLogoUrl: string | null;
  userName: string;
  userRole: string;
  tenantPlan?: string;
  isDemo?: boolean;
  subscriptionOverdueSince?: string | null;
  trialEndsAt?: string | null;
  trialExpired?: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuito",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function DashboardShell({
  children,
  tenantName,
  tenantLogoUrl,
  userName,
  userRole,
  tenantPlan = "free",
  isDemo = false,
  subscriptionOverdueSince = null,
  trialEndsAt = null,
  trialExpired = false,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        tenantName={tenantName}
        tenantLogoUrl={tenantLogoUrl}
        userName={userName}
        userRole={userRole}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        tenantPlan={tenantPlan}
        planLabel={PLAN_LABELS[tenantPlan] || tenantPlan}
      />

      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <MobileHeader
          onMenuClick={handleOpenSidebar}
          tenantName={tenantName}
        />

        <OverdueBanner overdueSince={subscriptionOverdueSince} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <AlertToast />
      <DemoUpgradePrompt isDemo={isDemo} />

      {!isDemo && trialEndsAt && (
        <TrialGate trialEndsAt={trialEndsAt} expired={trialExpired} />
      )}
    </div>
  );
}
