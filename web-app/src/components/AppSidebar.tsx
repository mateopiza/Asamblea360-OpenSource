import {
  Building2, Home, Users, Vote, HelpCircle, MessageSquare,
  FileText, QrCode, LayoutDashboard, LogOut, UserCog
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Copropiedades", url: "/copropiedades", icon: Building2 },
  { title: "Unidades", url: "/unidades", icon: Home },
  { title: "Asambleas", url: "/asambleas", icon: FileText },
  { title: "Participantes", url: "/participantes", icon: Users },
  { title: "Acreditación QR", url: "/acreditacion", icon: QrCode },
];

const votingItems = [
  { title: "Preguntas", url: "/preguntas", icon: Vote },
];

const supportItems = [
  { title: "Soporte", url: "/soporte", icon: HelpCircle },
  { title: "Conversaciones", url: "/conversaciones", icon: MessageSquare },
  { title: "Delegaciones", url: "/delegaciones", icon: FileText },
];

const renderNavItems = (items: typeof mainItems) =>
  items.map((item) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-primary/20 hover:text-sidebar-foreground"
          activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
        >
          <item.icon className="h-4 w-4" />
          <span className="text-sm">{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));

export function AppSidebar() {
  const { profile, signOut, roles, hasRole } = useAuth();

  const roleLabel = roles.includes("superadmin") ? "Super Admin" : roles.includes("admin") ? "Admin" : "Viewer";
  const isSuperAdmin = hasRole("superadmin");

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">Asamblea360</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">S360T</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderNavItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Votación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderNavItems(votingItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderNavItems(supportItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {renderNavItems([{ title: "Usuarios", url: "/usuarios", icon: UserCog }])}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">
            {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-sm font-medium text-sidebar-foreground">{profile?.full_name ?? "Usuario"}</span>
            <Badge variant="outline" className="w-fit text-[10px] border-sidebar-foreground/20 text-sidebar-foreground/50 mt-0.5">
              {roleLabel}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
