"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import AlertToast from "@/components/AlertToast";

interface DashboardShellProps {
  children: React.ReactNode;
  tenantName: string;
  tenantLogoUrl: string | null;
  userName: string;
  userRole: string;
}

export default function DashboardShell({
  children,
  tenantName,
  tenantLogoUrl,
  userName,
  userRole,
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
      />

      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <MobileHeader
          onMenuClick={handleOpenSidebar}
          tenantName={tenantName}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <AlertToast />
    </div>
  );
}
