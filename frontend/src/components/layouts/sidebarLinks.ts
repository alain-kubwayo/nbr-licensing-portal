import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

export const sidebarLinks = {
  APPLICANT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Applications", href: "/dashboard/applications", icon: FileText },
  ],

  REVIEWER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Assigned Applications", href: "/dashboard/reviews", icon: ClipboardList },
  ],

  APPROVER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Awaiting Approval", href: "/dashboard/approvals", icon: ShieldCheck },
  ],

  AUDITOR: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList },
  ],

  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/dashboard/users", icon: Users },
  ],
};

