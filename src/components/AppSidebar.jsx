import * as React from "react"
import { BarChart3, Users, FileText, Settings, Plus, Brain, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getUserData, logout } from "../utils/auth"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Forms",
      url: "#",
      icon: FileText,
    },
    {
      title: "Responses",
      url: "#",
      icon: Users,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ activeView, setActiveView, handleStartBuilding, user, ...props }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-base bg-main text-main-foreground border-2 border-border">
            <span className="text-sm font-heading">AF</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-heading text-main-foreground">Artistic Forms</span>
            <span className="truncate text-xs text-main-foreground/70">AI-Powered Forms</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      (item.title === "Dashboard" && activeView === "overview") ||
                      (item.title === "My Forms" && activeView === "forms") ||
                      (item.title === "Responses" && activeView === "responses") ||
                      (item.title === "Settings" && activeView === "settings")
                    }
                    onClick={() => {
                      if (item.title === "Dashboard") setActiveView("overview")
                      else if (item.title === "My Forms") setActiveView("forms")
                      else if (item.title === "Responses") setActiveView("responses")
                      else if (item.title === "Settings") setActiveView("settings")
                    }}
                  >
                    <button className="flex items-center gap-2 w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    onClick={handleStartBuilding}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus />
                    <span>Create Form</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-base bg-main text-main-foreground border-2 border-border">
                <span className="text-sm font-heading">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-base text-main-foreground">
                  {user?.name || user?.email || 'User'}
                </span>
                <span className="truncate text-xs text-main-foreground/70">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="neutral"
                size="sm"
                className="ml-auto"
              >
                Logout
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}