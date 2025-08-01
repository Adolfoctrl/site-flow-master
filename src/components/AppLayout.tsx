import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QrCode, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileEditDialog } from "@/components/auth/ProfileEditDialog";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b z-50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="ml-2" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Tecnobra</h1>
              <Badge variant="secondary" className="text-xs">
                Sistema de Gestão de Obra
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-right p-2 hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-sm text-gray-600">Bem-vindo,</p>
                      <p className="font-semibold text-gray-900">{user?.name || user?.email}</p>
                      <Badge variant="outline" className="text-xs">
                        {user?.role || 'Usuário'} - {user?.company || 'Empresa'}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </header>

        <ProfileEditDialog 
          open={profileDialogOpen} 
          onOpenChange={setProfileDialogOpen} 
        />

        <div className="flex w-full pt-16">
          <AppSidebar />
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}