import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, Settings, QrCode, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";

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
  qrCode?: string;
}

export default function Equipment() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    location: ""
  });
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

  const generateQRCode = async (equipmentData: any) => {
    try {
      const qrData = JSON.stringify({
        id: equipmentData.id,
        name: equipmentData.name,
        serialNumber: equipmentData.serialNumber,
        type: equipmentData.type
      });
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.serialNumber) {
      toast({
        title: "Erro!",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const id = Date.now().toString();
    const today = new Date();
    const nextMaintenance = new Date();
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 3);

    const equipmentData = {
      id,
      ...newEquipment,
      status: "operational" as const,
      lastMaintenance: today.toISOString().split('T')[0],
      nextMaintenance: nextMaintenance.toISOString().split('T')[0]
    };

    const qrCode = await generateQRCode(equipmentData);
    
    const finalEquipment = {
      ...equipmentData,
      qrCode
    };

    setEquipment(prev => [...prev, finalEquipment]);
    setNewEquipment({
      name: "",
      type: "",
      model: "",
      serialNumber: "",
      location: ""
    });
    setIsDialogOpen(false);

    toast({
      title: "Equipamento cadastrado!",
      description: "QR Code gerado automaticamente.",
    });
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment) return;

    if (!editingEquipment.name || !editingEquipment.type || !editingEquipment.serialNumber) {
      toast({
        title: "Erro!",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Regenerar QR code se dados importantes mudaram
    const qrCode = await generateQRCode(editingEquipment);
    const updatedEquipment = { ...editingEquipment, qrCode };

    setEquipment(prev => prev.map(eq => 
      eq.id === editingEquipment.id ? updatedEquipment : eq
    ));

    setIsEditDialogOpen(false);
    setEditingEquipment(null);

    toast({
      title: "Equipamento atualizado!",
      description: "QR Code atualizado automaticamente.",
    });
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipment(prev => prev.filter(eq => eq.id !== id));
    toast({
      title: "Equipamento removido!",
      description: "O equipamento foi removido do sistema.",
    });
  };

  const handlePrintQR = (equipment: Equipment) => {
    if (!equipment.qrCode) {
      toast({
        title: "Erro!",
        description: "QR Code não disponível para este equipamento.",
        variant: "destructive"
      });
      return;
    }

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${equipment.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                border: 1px solid #ccc; 
                padding: 20px; 
                margin: 20px auto; 
                width: fit-content; 
              }
              img { 
                width: 200px; 
                height: 200px; 
              }
              h2 { margin-bottom: 10px; }
              p { margin: 5px 0; color: #666; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${equipment.name}</h2>
              <p><strong>Tipo:</strong> ${equipment.type}</p>
              <p><strong>Série:</strong> ${equipment.serialNumber}</p>
              <p><strong>Local:</strong> ${equipment.location}</p>
              <img src="${equipment.qrCode}" alt="QR Code - ${equipment.name}" />
              <p><small>QR Code do Equipamento</small></p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
            <p className="text-gray-600">Gerencie os equipamentos da empresa</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Equipamento</DialogTitle>
                <DialogDescription>
                  Cadastre um novo equipamento no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Equipamento *</Label>
                  <Input 
                    id="name"
                    placeholder="Nome do equipamento" 
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Input 
                    id="type"
                    placeholder="Tipo" 
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input 
                    id="model"
                    placeholder="Modelo" 
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="serial">Número de Série *</Label>
                  <Input 
                    id="serial"
                    placeholder="Número de série" 
                    value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input 
                    id="location"
                    placeholder="Localização" 
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddEquipment} className="flex-1">
                    <QrCode className="w-4 h-4 mr-2" />
                    Cadastrar e Gerar QR
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Equipment Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Equipamento</DialogTitle>
                <DialogDescription>
                  Atualize as informações do equipamento
                </DialogDescription>
              </DialogHeader>
              {editingEquipment && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nome do Equipamento *</Label>
                    <Input 
                      id="edit-name"
                      placeholder="Nome do equipamento" 
                      value={editingEquipment.name}
                      onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Tipo *</Label>
                    <Input 
                      id="edit-type"
                      placeholder="Tipo" 
                      value={editingEquipment.type}
                      onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, type: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Modelo</Label>
                    <Input 
                      id="edit-model"
                      placeholder="Modelo" 
                      value={editingEquipment.model}
                      onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, model: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-serial">Número de Série *</Label>
                    <Input 
                      id="edit-serial"
                      placeholder="Número de série" 
                      value={editingEquipment.serialNumber}
                      onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, serialNumber: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-location">Localização</Label>
                    <Input 
                      id="edit-location"
                      placeholder="Localização" 
                      value={editingEquipment.location}
                      onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, location: e.target.value } : null)}
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateEquipment} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
                    {eq.qrCode && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handlePrintQR(eq)}
                        title="Imprimir QR Code"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditEquipment(eq)}
                      title="Editar equipamento"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteEquipment(eq.id)}
                      title="Remover equipamento"
                    >
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

                  {eq.qrCode && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-center">
                        <img 
                          src={eq.qrCode} 
                          alt={`QR Code - ${eq.name}`}
                          className="w-20 h-20"
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">QR Code do Equipamento</p>
                    </div>
                  )}
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