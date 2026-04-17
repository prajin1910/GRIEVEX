import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  ShoppingCart, 
  Archive,
  MessageSquare,
  Lightbulb,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package },
  { title: "Inventory", url: "/inventory", icon: Archive },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "AI Assistant", url: "/ai-assistant", icon: MessageSquare },
  { title: "AI Insights", url: "/ai-insights", icon: Lightbulb },
];

function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold tracking-tight text-sidebar-primary">IntelliRetail</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || (location.startsWith(item.url) && item.url !== "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card z-10 shrink-0">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                A
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
