import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* External trigger shown when sidebar is hidden */}
      

      <AppSidebar />

      <main className="flex-5">
        {children}
      </main>
    </SidebarProvider>
  )
}
