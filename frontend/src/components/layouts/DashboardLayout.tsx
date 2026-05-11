import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import ProfileDropdown from "../ProfileDropdown"
import Footer from "../Footer"
import { Outlet } from "react-router"
import { useAuth } from "@/auth/useAuth"
import { sidebarLinks } from "./sidebarLinks"

const DashboardLayout = () => {
  const { user } = useAuth()
  const links = sidebarLinks[(user?.role ?? "APPLICANT") as keyof typeof sidebarLinks] ?? sidebarLinks.APPLICANT

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
                <SidebarTrigger className='[&_svg]:size-5!' />
              </div>
              <div className='flex items-center gap-1.5'>
                <ProfileDropdown />
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
