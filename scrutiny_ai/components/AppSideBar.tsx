"use client";
import { Calendar, Home, Archive, Megaphone } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserButton from "./UserButton";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "react-day-picker";
import { useRouter } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Calendar",
    url: "/dashboard",
    icon: Calendar,
  },
  {
    title: "Storage",
    url: "/dashboard/storage",
    icon: Archive,
  },
  {
    title: "Result",
    url: "/dashboard/result",
    icon: Megaphone,
  },
];

export function AppSidebar() {
  const { isLoading, user } = useUser();
  const router = useRouter();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <a href="/#" className="flex items-center w-50 mr-5">
              <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
                <span className="font-medium">Scrunity </span>
              </div>
            </a>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && !isLoading && (
          <div className="flex gap-3">
            <UserButton user={user} />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        )}
        {!user && !isLoading && (
          <Button
            onClick={() => {
              router.push("/api/auth/login");
            }}
          >
            Login
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
