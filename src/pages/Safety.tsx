import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Edit, Trash2, Shield, FileText, Calendar, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { generateOptimizedQR } from "@/utils/qrCodeUtils";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SafetyEquipment {
  id: string;
  name: string;
  type: string;
  size?: string;
  certificateNumber: string;
  validityDate: string;
  deliveredTo: string;
  employeeId: string;
  deliveryDate: string;
  qrCode?: string;
  status: 'delivered' | 'returned' | 'expired';
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
}

const safetyEquipmentTypes = [
  "Capacete de Segurança",
  "Botas de Segurança", 
  "Luvas de Proteção",
  "Óculos de Proteção",
  "Protetor Auricular",
  "Cinto de Segurança",
  "Colete Refletivo",
  "Máscara Respiratória",
  "Uniforme de Segurança"
];

const sizes = ["PP", "P", "M", "G", "GG", "XG", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

export default function Safety() {
  const [safetyEquipments, setSafetyEquipments] = useState<SafetyEquipment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<SafetyEquipment | null>(null);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("");
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    size: "",
    certificateNumber: "",
    validityDate: "",
    employeeId: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Carregar dados do localStorage
    const savedEquipments = localStorage.getItem('tecnobra_safety_equipment');
    if (savedEquipments) {
      setSafetyEquipments(JSON.parse(savedEquipments));
    }

    const savedEmployees = localStorage.getItem('tecnobra_employees');
    if (savedEmployees) {
      const employeeData = JSON.parse(savedEmployees);
      setEmployees(employeeData);
    } else {
      // Dados demo de funcionários
      const demoEmployees = [
        { id: "1", name: "João Silva", department: "Construção", role: "Pedreiro" },
        { id: "2", name: "Maria Santos", department: "Elétrica", role: "Eletricista" },
        { id: "3", name: "Pedro Costa", department: "Soldagem", role: "Soldador" },
        { id: "4", name: "Ana Oliveira", department: "Segurança", role: "Técnico de Segurança" }
      ];
      setEmployees(demoEmployees);
    }
  }, []);

  const generateQRCode = async (equipmentData: SafetyEquipment) => {
    try {
      const qrData = {
        id: equipmentData.id,
        name: equipmentData.name,
        type: equipmentData.type,
        employeeId: equipmentData.employeeId,
        deliveryDate: equipmentData.deliveryDate,
        category: "safety_equipment",
        v: "2.0"
      };
      
      const qrCodeDataURL = await generateOptimizedQR(qrData);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  };

  const handleAddEquipment = () => {
    setIsAddingEquipment(true);
    setNewEquipment({
      name: "",
      type: "",
      size: "",
      certificateNumber: "",
      validityDate: "",
      employeeId: "",
      notes: ""
    });
  };

  const handleSaveEquipment = async () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.employeeId || !newEquipment.certificateNumber) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id === newEquipment.employeeId);
    if (!selectedEmployee) {
      toast({
        title: "Erro",
        description: "Funcionário não encontrado",
        variant: "destructive",
      });
      return;
    }

    const equipmentData: SafetyEquipment = {
      id: Date.now().toString(),
      name: newEquipment.name,
      type: newEquipment.type,
      size: newEquipment.size,
      certificateNumber: newEquipment.certificateNumber,
      validityDate: newEquipment.validityDate,
      deliveredTo: selectedEmployee.name,
      employeeId: newEquipment.employeeId,
      deliveryDate: new Date().toISOString().split('T')[0],
      status: 'delivered',
      notes: newEquipment.notes
    };

    const qrCode = await generateQRCode(equipmentData);
    equipmentData.qrCode = qrCode;

    const updatedEquipments = [...safetyEquipments, equipmentData];
    setSafetyEquipments(updatedEquipments);
    localStorage.setItem('tecnobra_safety_equipment', JSON.stringify(updatedEquipments));

    setIsAddingEquipment(false);
    toast({
      title: "Sucesso!",
      description: "Equipamento de segurança registrado com sucesso",
    });
  };

  const handleDeleteEquipment = (id: string) => {
    const updatedEquipments = safetyEquipments.filter(eq => eq.id !== id);
    setSafetyEquipments(updatedEquipments);
    localStorage.setItem('tecnobra_safety_equipment', JSON.stringify(updatedEquipments));
    
    toast({
      title: "Equipamento removido",
      description: "Equipamento de segurança removido com sucesso",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'returned': return 'Devolvido';
      case 'expired': return 'Expirado';
      default: return 'Desconhecido';
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('RELATÓRIO DE EQUIPAMENTOS DE SEGURANÇA', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
    doc.text('Tecnobra - Sistema de Gestão', 20, 55);

    // Preparar dados para a tabela
    const tableData = filteredEquipments.map(eq => [
      eq.name,
      eq.type,
      eq.deliveredTo,
      eq.deliveryDate,
      eq.certificateNumber,
      eq.validityDate || 'N/A',
      getStatusLabel(eq.status)
    ]);

    // Adicionar tabela
    (doc as any).autoTable({
      head: [['Equipamento', 'Tipo', 'Funcionário', 'Data Entrega', 'Certificado', 'Validade', 'Status']],
      body: tableData,
      startY: 70,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Estatísticas
    const yPosition = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('ESTATÍSTICAS:', 20, yPosition);
    
    doc.setFontSize(10);
    doc.text(`Total de Equipamentos: ${filteredEquipments.length}`, 20, yPosition + 15);
    doc.text(`Equipamentos Entregues: ${filteredEquipments.filter(eq => eq.status === 'delivered').length}`, 20, yPosition + 25);
    doc.text(`Equipamentos Devolvidos: ${filteredEquipments.filter(eq => eq.status === 'returned').length}`, 20, yPosition + 35);
    doc.text(`Equipamentos Expirados: ${filteredEquipments.filter(eq => eq.status === 'expired').length}`, 20, yPosition + 45);

    // Salvar PDF
    doc.save(`relatorio-equipamentos-seguranca-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Relatório gerado!",
      description: "Relatório de equipamentos de segurança gerado com sucesso",
    });
  };

  const filteredEquipments = safetyEquipments.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.deliveredTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = selectedEmployeeFilter === "" || equipment.employeeId === selectedEmployeeFilter;
    
    return matchesSearch && matchesEmployee;
  });

  const stats = {
    total: safetyEquipments.length,
    delivered: safetyEquipments.filter(eq => eq.status === 'delivered').length,
    returned: safetyEquipments.filter(eq => eq.status === 'returned').length,
    expired: safetyEquipments.filter(eq => eq.status === 'expired').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Equipamentos de Segurança</h1>
            <p className="text-muted-foreground">Gestão de EPIs e equipamentos de proteção</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateReport} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button onClick={handleAddEquipment}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Entrega
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar equipamentos, funcionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os funcionários</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total EPIs</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devolvidos</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.returned}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Equipamentos */}
      {filteredEquipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento registrado'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm 
                ? 'Tente alterar os filtros de busca.' 
                : 'Comece registrando a entrega de equipamentos de segurança.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddEquipment}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Equipamento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      {equipment.name}
                    </CardTitle>
                    <CardDescription>{equipment.type}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(equipment.status)}>
                    {getStatusLabel(equipment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Funcionário:</p>
                    <p>{equipment.deliveredTo}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Data Entrega:</p>
                    <p>{new Date(equipment.deliveryDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {equipment.size && (
                    <div>
                      <p className="font-medium text-gray-600">Tamanho:</p>
                      <p>{equipment.size}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-600">Certificado:</p>
                    <p className="text-xs">{equipment.certificateNumber}</p>
                  </div>
                  {equipment.validityDate && (
                    <div className="col-span-2">
                      <p className="font-medium text-gray-600">Validade:</p>
                      <p>{new Date(equipment.validityDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
                
                {equipment.notes && (
                  <div>
                    <p className="font-medium text-gray-600 text-sm">Observações:</p>
                    <p className="text-sm text-gray-700">{equipment.notes}</p>
                  </div>
                )}

                {equipment.qrCode && (
                  <div className="flex justify-center pt-2">
                    <img 
                      src={equipment.qrCode} 
                      alt={`QR Code - ${equipment.name}`}
                      className="w-24 h-24 border rounded"
                    />
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteEquipment(equipment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar equipamento */}
      <Dialog open={isAddingEquipment} onOpenChange={setIsAddingEquipment}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Entrega de Equipamento de Segurança</DialogTitle>
            <DialogDescription>
              Registre a entrega de EPIs e equipamentos de proteção para funcionários.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-name">Nome do Equipamento *</Label>
              <Input
                id="equipment-name"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                placeholder="Ex: Capacete H700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipment-type">Tipo de Equipamento *</Label>
              <Select value={newEquipment.type} onValueChange={(value) => setNewEquipment({...newEquipment, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {safetyEquipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Funcionário *</Label>
              <Select value={newEquipment.employeeId} onValueChange={(value) => setNewEquipment({...newEquipment, employeeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Select value={newEquipment.size} onValueChange={(value) => setNewEquipment({...newEquipment, size: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate">Número do Certificado *</Label>
              <Input
                id="certificate"
                value={newEquipment.certificateNumber}
                onChange={(e) => setNewEquipment({...newEquipment, certificateNumber: e.target.value})}
                placeholder="Ex: CA 12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Data de Validade</Label>
              <Input
                id="validity"
                type="date"
                value={newEquipment.validityDate}
                onChange={(e) => setNewEquipment({...newEquipment, validityDate: e.target.value})}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                placeholder="Informações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEquipment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEquipment}>
              <Shield className="h-4 w-4 mr-2" />
              Registrar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}