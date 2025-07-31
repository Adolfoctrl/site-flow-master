import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: "operational" | "maintenance" | "inactive";
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

export default function Equipment() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: "1",
      name: "Prensa Hidráulica A1",
      type: "Prensa",
      model: "PH-2000",
      serialNumber: "PH001234",
      status: "operational",
      location: "Setor A - Linha 1",
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-04-15"
    },
    {
      id: "2",
      name: "Torno CNC B2",
      type: "Torno",
      model: "CNC-500",
      serialNumber: "TC005678",
      status: "maintenance",
      location: "Setor B - Linha 2",
      lastMaintenance: "2024-01-20",
      nextMaintenance: "2024-04-20"
    },
    {
      id: "3",
      name: "Fresadora Universal C1",
      type: "Fresadora",
      model: "FU-300",
      serialNumber: "FR009876",
      status: "operational",
      location: "Setor C - Linha 1",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-04-10"
    }
  ]);

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels = {
      operational: "Operacional",
      maintenance: "Em Manutenção",
      inactive: "Inativo"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      operational: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const isMaintenanceDue = (nextMaintenance: string) => {
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenance);
    const diffDays = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
              <p className="text-gray-600">Gerencie os equipamentos da empresa</p>
            </div>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Equipamento
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar equipamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{equipment.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operacional</p>
                  <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'operational').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Manutenção</p>
                  <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'maintenance').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Manutenção Próxima</p>
                  <p className="text-2xl font-bold">{equipment.filter(e => isMaintenanceDue(e.nextMaintenance)).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <Card key={eq.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{eq.type} - {eq.model}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(eq.status)}>
                      {getStatusLabel(eq.status)}
                    </Badge>
                    {isMaintenanceDue(eq.nextMaintenance) && (
                      <Badge variant="destructive" className="text-xs">
                        Manutenção Próxima
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Série:</strong> {eq.serialNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Local:</strong> {eq.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Última Manutenção:</strong> {new Date(eq.lastMaintenance).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Próxima Manutenção:</strong> {new Date(eq.nextMaintenance).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-gray-600">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando um novo equipamento"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}