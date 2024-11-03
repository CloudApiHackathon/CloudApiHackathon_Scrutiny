// Layout.js
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
  );
}
