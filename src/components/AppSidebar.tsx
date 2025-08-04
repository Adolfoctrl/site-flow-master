import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Users, 
  Package, 
  Clock, 
  Truck, 
  FileText, 
  QrCode,
  Settings,
  BarChart3,
  UserCheck,
  Home,
  Shield
} from "lucide-react";

const menuItems = [
  {
    group: "Principal",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Controle de Ponto", url: "/check-in", icon: QrCode },
    ]
  },
  {
    group: "Gestão",
    items: [
      { title: "Funcionários", url: "/employees", icon: Users },
      { title: "Equipamentos", url: "/equipment", icon: Package },
      { title: "Segurança", url: "/safety", icon: Shield },
      { title: "Máquinas", url: "/machines", icon: Settings },
      { title: "Empréstimo de Equipamentos", url: "/equipment-loan", icon: Package },
    ]
  },
  {
    group: "Controle",
    items: [
      { title: "Máquinas Alugadas", url: "/rental-control", icon: Clock },
      { title: "Controle de Visitas", url: "/visits", icon: UserCheck },
    ]
  },
  {
    group: "Relatórios",
    items: [
      { title: "Relatórios", url: "/reports", icon: FileText },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90" 
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="mt-4">
        {menuItems.map((group) => {
          return (
            <SidebarGroup key={group.group}>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.group}
                </SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/'}
                          className={getNavCls(item.url)}
                          title={collapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}