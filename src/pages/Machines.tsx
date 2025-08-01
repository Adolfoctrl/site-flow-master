import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, Cog, Activity, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Machine {
  id: string;
  name: string;
  type: string;
  model: string;
  status: "running" | "stopped" | "maintenance" | "error";
  efficiency: number;
  uptime: number;
  production: number;
  location: string;
  operator: string;
  lastUpdate: string;
}

export default function Machines() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: "1",
      name: "Linha de Produção A",
      type: "Linha de Montagem",
      model: "LM-2000",
      status: "running",
      efficiency: 92,
      uptime: 97.5,
      production: 1250,
      location: "Setor A",
      operator: "João Silva",
      lastUpdate: new Date().toISOString()
    },
    {
      id: "2",
      name: "Prensa Automática B",
      type: "Prensa",
      model: "PA-500",
      status: "maintenance",
      efficiency: 0,
      uptime: 0,
      production: 0,
      location: "Setor B", 
      operator: "Maria Santos",
      lastUpdate: new Date(Date.now() - 30000).toISOString()
    },
    {
      id: "3",
      name: "Esteira Principal C",
      type: "Esteira Transportadora",
      model: "ET-1000",
      status: "running",
      efficiency: 87,
      uptime: 94.2,
      production: 890,
      location: "Setor C",
      operator: "Carlos Lima",
      lastUpdate: new Date().toISOString()
    },
    {
      id: "4",
      name: "Robô Soldador D",
      type: "Robô Industrial",
      model: "RS-300",
      status: "error",
      efficiency: 0,
      uptime: 45.0,
      production: 0,
      location: "Setor D",
      operator: "Ana Costa",
      lastUpdate: new Date(Date.now() - 120000).toISOString()
    }
  ]);

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.operator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels = {
      running: "Em Operação",
      stopped: "Parada",
      maintenance: "Manutenção",
      error: "Erro"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: "bg-green-100 text-green-800",
      stopped: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-4 h-4" />;
      case "maintenance":
        return <Cog className="w-4 h-4" />;
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Cog className="w-4 h-4" />;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 95) return "text-green-600";
    if (uptime >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const isOnline = (lastUpdate: string) => {
    const now = new Date().getTime();
    const lastUpdateTime = new Date(lastUpdate).getTime();
    return (now - lastUpdateTime) < 60000; // Online se atualizado nos últimos 60 segundos
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Máquinas</h1>
            <p className="text-gray-600">Monitoramento em tempo real das máquinas</p>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Máquina
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar máquinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Cog className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{machines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operando</p>
                  <p className="text-2xl font-bold">{machines.filter(m => m.status === 'running').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Cog className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Manutenção</p>
                  <p className="text-2xl font-bold">{machines.filter(m => m.status === 'maintenance').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Com Erro</p>
                  <p className="text-2xl font-bold">{machines.filter(m => m.status === 'error').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Eficiência Média</p>
                  <p className="text-2xl font-bold">
                    {Math.round(machines.reduce((acc, m) => acc + m.efficiency, 0) / machines.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Machine List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <Card key={machine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    {isOnline(machine.lastUpdate) ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{machine.type} - {machine.model}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(machine.status)}>
                      {getStatusIcon(machine.status)}
                      <span className="ml-1">{getStatusLabel(machine.status)}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {isOnline(machine.lastUpdate) ? "Online" : "Offline"}
                    </span>
                  </div>
                  
                  {machine.status === 'running' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getEfficiencyColor(machine.efficiency)}`}>
                          {machine.efficiency}%
                        </p>
                        <p className="text-xs text-gray-600">Eficiência</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getUptimeColor(machine.uptime)}`}>
                          {machine.uptime}%
                        </p>
                        <p className="text-xs text-gray-600">Uptime</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Local:</strong> {machine.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Operador:</strong> {machine.operator}
                    </p>
                    {machine.status === 'running' && (
                      <p className="text-sm text-gray-600">
                        <strong>Produção:</strong> {machine.production.toLocaleString()} un/dia
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Última atualização:</strong> {new Date(machine.lastUpdate).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12">
            <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma máquina encontrada</h3>
            <p className="text-gray-600">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando uma nova máquina"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}