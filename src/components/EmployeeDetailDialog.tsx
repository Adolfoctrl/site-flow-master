import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Shield, 
  Package, 
  Clock, 
  Edit, 
  Save,
  Heart,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface EmployeeProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  photo?: string;
  createdAt: string;
  status?: string;
}

interface EmployeeDetails {
  // Dados pessoais
  cpf?: string;
  rg?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Dados profissionais
  admissionDate?: string;
  ctps?: string;
  pis?: string;
  salary?: string;
  
  // Dados médicos
  lastMedicalExam?: string;
  medicalExamValidity?: string;
  medicalRestrictions?: string;
  bloodType?: string;
  
  // Dados de segurança
  safetyTraining?: string[];
  certifications?: string[];
  
  // Observações
  notes?: string;
}

interface EmployeeDetailDialogProps {
  employee: any; // Aceita qualquer tipo de employee
  children: React.ReactNode;
}

export function EmployeeDetailDialog({ employee, children }: EmployeeDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails>({});
  const [equipmentHistory, setEquipmentHistory] = useState<any[]>([]);
  const [safetyEquipment, setSafetyEquipment] = useState<any[]>([]);
  const [checkInHistory, setCheckInHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Carregar dados detalhados do funcionário
      const savedDetails = localStorage.getItem(`tecnobra_employee_details_${employee.id}`);
      if (savedDetails) {
        setEmployeeDetails(JSON.parse(savedDetails));
      }

      // Carregar histórico de equipamentos
      const equipmentData = localStorage.getItem('tecnobra_equipment_loans') || '[]';
      const equipment = JSON.parse(equipmentData).filter((item: any) => 
        item.employeeId === employee.id
      );
      setEquipmentHistory(equipment);

      // Carregar equipamentos de segurança
      const safetyData = localStorage.getItem('tecnobra_safety_equipment') || '[]';
      const safety = JSON.parse(safetyData).filter((item: any) => 
        item.employeeId === employee.id
      );
      setSafetyEquipment(safety);

      // Carregar histórico de ponto
      const checkInData = localStorage.getItem('tecnobra_checkin_records') || '[]';
      const checkIns = JSON.parse(checkInData).filter((item: any) => 
        item.employeeId === employee.id
      ).slice(0, 10); // Últimos 10 registros
      setCheckInHistory(checkIns);
    }
  }, [isOpen, employee.id]);

  const handleSaveDetails = () => {
    localStorage.setItem(
      `tecnobra_employee_details_${employee.id}`, 
      JSON.stringify(employeeDetails)
    );
    setIsEditing(false);
    toast({
      title: "Dados salvos!",
      description: "Informações do funcionário atualizadas com sucesso",
    });
  };

  const updateDetail = (key: keyof EmployeeDetails, value: string) => {
    setEmployeeDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getMedicalStatus = () => {
    if (!employeeDetails.lastMedicalExam) return { status: 'pending', text: 'Pendente' };
    
    const examDate = new Date(employeeDetails.lastMedicalExam);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - examDate.getFullYear()) * 12 + 
                      (today.getMonth() - examDate.getMonth());
    
    if (monthsDiff > 12) return { status: 'expired', text: 'Expirado' };
    if (monthsDiff > 10) return { status: 'warning', text: 'Próximo do vencimento' };
    return { status: 'valid', text: 'Em dia' };
  };

  const medicalStatus = getMedicalStatus();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.photo} />
              <AvatarFallback className="text-lg">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{employee.name}</DialogTitle>
              <p className="text-muted-foreground">{employee.role} - {employee.department}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Admitido em {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <Badge variant={medicalStatus.status === 'valid' ? 'default' : 
                              medicalStatus.status === 'warning' ? 'secondary' : 'destructive'}>
                  <Heart className="h-3 w-3 mr-1" />
                  Exame médico: {medicalStatus.text}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
              >
                {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? "Salvar" : "Editar"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="professional">Profissionais</TabsTrigger>
            <TabsTrigger value="medical">Médicos</TabsTrigger>
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={employee.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={employee.phone} disabled />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={employeeDetails.cpf || ''}
                    onChange={(e) => updateDetail('cpf', e.target.value)}
                    disabled={!isEditing}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={employeeDetails.rg || ''}
                    onChange={(e) => updateDetail('rg', e.target.value)}
                    disabled={!isEditing}
                    placeholder="00.000.000-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={employeeDetails.birthDate || ''}
                    onChange={(e) => updateDetail('birthDate', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Sanguíneo</Label>
                  <Input
                    value={employeeDetails.bloodType || ''}
                    onChange={(e) => updateDetail('bloodType', e.target.value)}
                    disabled={!isEditing}
                    placeholder="A+, B-, O+, etc."
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={employeeDetails.address || ''}
                    onChange={(e) => updateDetail('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato de Emergência</Label>
                  <Input
                    value={employeeDetails.emergencyContact || ''}
                    onChange={(e) => updateDetail('emergencyContact', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nome do contato"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone de Emergência</Label>
                  <Input
                    value={employeeDetails.emergencyPhone || ''}
                    onChange={(e) => updateDetail('emergencyPhone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Dados Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Admissão</Label>
                  <Input
                    type="date"
                    value={employeeDetails.admissionDate || ''}
                    onChange={(e) => updateDetail('admissionDate', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTPS</Label>
                  <Input
                    value={employeeDetails.ctps || ''}
                    onChange={(e) => updateDetail('ctps', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Número da carteira de trabalho"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PIS/PASEP</Label>
                  <Input
                    value={employeeDetails.pis || ''}
                    onChange={(e) => updateDetail('pis', e.target.value)}
                    disabled={!isEditing}
                    placeholder="000.00000.00-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salário</Label>
                  <Input
                    value={employeeDetails.salary || ''}
                    onChange={(e) => updateDetail('salary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="R$ 0.000,00"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Input
                    value={employeeDetails.notes || ''}
                    onChange={(e) => updateDetail('notes', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Informações adicionais sobre o funcionário"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Dados Médicos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Último Exame Médico</Label>
                  <Input
                    type="date"
                    value={employeeDetails.lastMedicalExam || ''}
                    onChange={(e) => updateDetail('lastMedicalExam', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validade do Exame</Label>
                  <Input
                    type="date"
                    value={employeeDetails.medicalExamValidity || ''}
                    onChange={(e) => updateDetail('medicalExamValidity', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Restrições Médicas</Label>
                  <Input
                    value={employeeDetails.medicalRestrictions || ''}
                    onChange={(e) => updateDetail('medicalRestrictions', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Descreva qualquer restrição médica"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Equipamentos de Segurança
                  </CardTitle>
                  <CardDescription>EPIs entregues ao funcionário</CardDescription>
                </CardHeader>
                <CardContent>
                  {safetyEquipment.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum equipamento de segurança registrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {safetyEquipment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type} - {item.deliveryDate}
                            </p>
                          </div>
                          <Badge variant={item.status === 'delivered' ? 'default' : 'secondary'}>
                            {item.status === 'delivered' ? 'Entregue' : 'Devolvido'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Empréstimos de Equipamentos
                  </CardTitle>
                  <CardDescription>Equipamentos emprestados</CardDescription>
                </CardHeader>
                <CardContent>
                  {equipmentHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum empréstimo registrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {equipmentHistory.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{item.equipmentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.loanDate} - {item.returnDate || 'Em uso'}
                            </p>
                          </div>
                          <Badge variant={item.returnDate ? 'secondary' : 'default'}>
                            {item.returnDate ? 'Devolvido' : 'Em uso'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Histórico de Ponto
                </CardTitle>
                <CardDescription>Últimos registros de entrada e saída</CardDescription>
              </CardHeader>
              <CardContent>
                {checkInHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum registro de ponto encontrado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {checkInHistory.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {record.type === 'entrada' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {record.type === 'entrada' ? 'Entrada' : 'Saída'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={record.type === 'entrada' ? 'default' : 'secondary'}>
                          {record.type === 'entrada' ? 'Chegada' : 'Saída'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}