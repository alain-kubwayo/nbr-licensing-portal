import {  
  LayoutDashboard,
  FilePlus,
  FileText,
  ClipboardList,
  ShieldCheck,
  Users 
} from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import ProfileDropdown from "../ProfileDropdown"
import { Button } from "../ui/button"
import { Avatar } from "../ui/avatar"
import Footer from "../Footer"
import { Outlet } from "react-router"

type User = {
    id: number
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
}

export const sidebarLinks = {
  APPLICANT: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Application", href: "/dashboard/applications/new", icon: FilePlus },
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
}

const user: Partial<User> = {
  id: 1,
  firstName: "john",
  lastName: "doe",
  email: "john.doe@gmail.com",
  role: "APPLICANT", // APPLICANT, REVIEWER, APPROVER, AUDITOR, ADMIN
}

const links = sidebarLinks[user.role as keyof typeof sidebarLinks];

const DashboardLayout = () => {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                    {links.map(link => {
                        const Icon = link.icon
                        return (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton asChild>
                            <a href={link.href}>
                                {Icon && <Icon className="size-4" />}
                                <span>{link.label}</span>
                            </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem> 
                        )
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className='flex flex-1 flex-col'>
          <header className='bg-card sticky top-0 z-50 border-b'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:!size-5' />
              </div>
              <div className='flex items-center gap-1.5'>
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5 rounded-md'>
                      <Avatar className='size-9.5 rounded-md flex items-center justify-center'>
                        {`${user.firstName?.charAt(0).toUpperCase()}${user.lastName?.charAt(0).toUpperCase()}`}
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            <Outlet />
          </main>
          <Footer />
        </div>
      </SidebarProvider>
    </div>
  )
}

export default DashboardLayout
