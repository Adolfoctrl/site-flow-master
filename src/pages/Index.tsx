import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, Truck, FileText, Settings, Clock, QrCode, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => {}} />;
  }

  const modules = [
    {
      id: "employees",
      title: "Funcionários",
      description: "Gestão de trabalhadores e empresas",
      icon: Users,
      color: "bg-blue-500",
      count: "156 ativos"
    },
    {
      id: "equipment",
      title: "Equipamentos",
      description: "Controle de ferramentas e materiais",
      icon: Package,
      color: "bg-green-500",
      count: "89 itens"
    },
    {
      id: "machines",
      title: "Máquinas Alugadas",
      description: "Controle de tempo e relatórios",
      icon: Clock,
      color: "bg-purple-500",
      count: "12 ativas"
    },
    {
      id: "visitors",
      title: "Visitantes",
      description: "Controle de acesso e veículos",
      icon: Truck,
      color: "bg-orange-500",
      count: "8 hoje"
    },
    {
      id: "deliveries",
      title: "Entregas",
      description: "Rastreamento de materiais",
      icon: FileText,
      color: "bg-red-500",
      count: "3 pendentes"
    },
    {
      id: "reports",
      title: "Relatórios",
      description: "Análises e exportações",
      icon: FileText,
      color: "bg-indigo-500",
      count: "Gerar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Tecnobra</h1>
              <Badge variant="secondary" className="text-xs">
                Sistema de Gestão de Obra
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bem-vindo,</p>
                <p className="font-semibold text-gray-900">{user.name || user.email}</p>
                <Badge variant="outline" className="text-xs">
                  {user.role || 'Usuário'} - {user.company || 'Empresa'}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Tecnobra
          </h2>
          <p className="text-lg text-gray-600">
            Sistema inteligente de gestão de obra com controle total via QR Code
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pessoas na Obra</p>
                  <p className="text-2xl font-bold text-green-600">47</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipamentos Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">89</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Máquinas Trabalhando</p>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitantes Hoje</p>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={module.id} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={() => setActiveModule(module.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {module.count}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Acessar Módulo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-green-600 hover:bg-green-700">
              <QrCode className="w-4 h-4 mr-2" />
              Escanear QR Code
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Registrar Funcionário
            </Button>
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Adicionar Equipamento
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Registrar Máquina
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
