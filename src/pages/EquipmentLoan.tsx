import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, QrCode, User, ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import QRScanner from "@/components/QRScanner";

interface LoanRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  loanTimestamp: string;
  returnTimestamp?: string;
  status: "borrowed" | "returned";
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  qrCode: string;
  status: "available" | "borrowed";
}

export default function EquipmentLoan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employeeQR, setEmployeeQR] = useState("");
  const [equipmentQR, setEquipmentQR] = useState("");
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [currentStep, setCurrentStep] = useState<"employee" | "equipment">("employee");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEmployeeScanning, setIsEmployeeScanning] = useState(false);
  const [isEquipmentScanning, setIsEquipmentScanning] = useState(false);

  useEffect(() => {
    // Load loan records from localStorage
    const savedRecords = localStorage.getItem('tecnobra_loan_records');
    if (savedRecords) {
      setLoanRecords(JSON.parse(savedRecords));
    }

    // Load equipment from localStorage or set demo data
    const savedEquipment = localStorage.getItem('tecnobra_equipment_list');
    if (savedEquipment) {
      setEquipment(JSON.parse(savedEquipment));
    } else {
      const demoEquipment: Equipment[] = [
        {
          id: "1",
          name: "Martelo Elétrico Stanley",
          type: "Ferramenta Elétrica",
          qrCode: JSON.stringify({ id: "1", name: "Martelo Elétrico Stanley", type: "Ferramenta Elétrica" }),
          status: "available"
        },
        {
          id: "2", 
          name: "Pá de Obra",
          type: "Ferramenta Manual",
          qrCode: JSON.stringify({ id: "2", name: "Pá de Obra", type: "Ferramenta Manual" }),
          status: "available"
        },
        {
          id: "3",
          name: "Furadeira DeWalt",
          type: "Ferramenta Elétrica", 
          qrCode: JSON.stringify({ id: "3", name: "Furadeira DeWalt", type: "Ferramenta Elétrica" }),
          status: "available"
        },
        {
          id: "4",
          name: "Enxada",
          type: "Ferramenta Manual",
          qrCode: JSON.stringify({ id: "4", name: "Enxada", type: "Ferramenta Manual" }),
          status: "available"
        }
      ];
      setEquipment(demoEquipment);
      localStorage.setItem('tecnobra_equipment_list', JSON.stringify(demoEquipment));
    }
  }, []);

  const handleEmployeeQRScan = () => {
    if (!employeeQR.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escaneie o QR do funcionário",
        variant: "destructive",
      });
      return;
    }

    try {
      const employeeData = JSON.parse(employeeQR);
      
      if (!employeeData.id || !employeeData.name) {
        throw new Error("QR Code inválido");
      }

      setSelectedEmployee(employeeData);
      setCurrentStep("equipment");
      
      toast({
        title: "Funcionário Identificado",
        description: `${employeeData.name} selecionado`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "QR Code de funcionário inválido",
        variant: "destructive",
      });
    }
  };

  const handleEquipmentQRScan = () => {
    if (!equipmentQR.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escaneie o QR do equipamento",
        variant: "destructive",
      });
      return;
    }

    try {
      const equipmentData = JSON.parse(equipmentQR);
      
      if (!equipmentData.id || !equipmentData.name) {
        throw new Error("QR Code inválido");
      }

      // Check if equipment is already borrowed
      const existingLoan = loanRecords.find(record => 
        record.equipmentId === equipmentData.id && 
        record.status === "borrowed"
      );

      if (existingLoan) {
        // Return equipment
        handleReturnEquipment(existingLoan, equipmentData);
      } else {
        // Loan equipment
        handleLoanEquipment(equipmentData);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "QR Code de equipamento inválido",
        variant: "destructive",
      });
    }
  };

  const handleLoanEquipment = (equipmentData: any) => {
    if (!selectedEmployee) {
      toast({
        title: "Erro",
        description: "Funcionário não selecionado",
        variant: "destructive",
      });
      return;
    }

    const newLoan: LoanRecord = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      equipmentId: equipmentData.id,
      equipmentName: equipmentData.name,
      equipmentType: equipmentData.type,
      loanTimestamp: new Date().toISOString(),
      status: "borrowed"
    };

    const updatedRecords = [...loanRecords, newLoan];
    setLoanRecords(updatedRecords);
    localStorage.setItem('tecnobra_loan_records', JSON.stringify(updatedRecords));

    // Update equipment status
    const updatedEquipment = equipment.map(eq => 
      eq.id === equipmentData.id 
        ? { ...eq, status: "borrowed" as const }
        : eq
    );
    setEquipment(updatedEquipment);
    localStorage.setItem('tecnobra_equipment_list', JSON.stringify(updatedEquipment));

    toast({
      title: "Equipamento Emprestado",
      description: `${equipmentData.name} emprestado para ${selectedEmployee.name}`,
    });

    resetForm();
  };

  const handleReturnEquipment = (existingLoan: LoanRecord, equipmentData: any) => {
    const updatedRecords = loanRecords.map(record =>
      record.id === existingLoan.id
        ? { ...record, returnTimestamp: new Date().toISOString(), status: "returned" as const }
        : record
    );
    setLoanRecords(updatedRecords);
    localStorage.setItem('tecnobra_loan_records', JSON.stringify(updatedRecords));

    // Update equipment status
    const updatedEquipment = equipment.map(eq => 
      eq.id === equipmentData.id 
        ? { ...eq, status: "available" as const }
        : eq
    );
    setEquipment(updatedEquipment);
    localStorage.setItem('tecnobra_equipment_list', JSON.stringify(updatedEquipment));

    toast({
      title: "Equipamento Devolvido",
      description: `${equipmentData.name} devolvido por ${existingLoan.employeeName}`,
    });

    resetForm();
  };

  const resetForm = () => {
    setEmployeeQR("");
    setEquipmentQR("");
    setSelectedEmployee(null);
    setCurrentStep("employee");
  };

  const handleDemoLoan = () => {
    // Demo with predefined employee and equipment
    const demoEmployee = { id: "1", name: "João Silva" };
    const demoEquipment = equipment.find(eq => eq.status === "available");
    
    if (!demoEquipment) {
      toast({
        title: "Erro",
        description: "Nenhum equipamento disponível para demo",
        variant: "destructive",
      });
      return;
    }

    setSelectedEmployee(demoEmployee);
    setEmployeeQR(JSON.stringify(demoEmployee));
    setEquipmentQR(demoEquipment.qrCode);
    
    // Simulate loan
    handleLoanEquipment(JSON.parse(demoEquipment.qrCode));
  };

  const getTodayLoans = () => {
    const today = new Date().toDateString();
    return loanRecords.filter(record => 
      new Date(record.loanTimestamp).toDateString() === today
    ).sort((a, b) => new Date(b.loanTimestamp).getTime() - new Date(a.loanTimestamp).getTime());
  };

  const getCurrentlyBorrowed = () => {
    return loanRecords.filter(record => record.status === "borrowed");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Empréstimo de Equipamentos</h1>
              <p className="text-muted-foreground">
                Sistema de controle de ferramentas e equipamentos
              </p>
            </div>
          </div>
          <Button onClick={resetForm} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === "employee" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Package className="h-5 w-5" />
                )}
                {currentStep === "employee" ? "1. Escaneie o Funcionário" : "2. Escaneie o Equipamento"}
              </CardTitle>
              <CardDescription>
                {currentStep === "employee" 
                  ? "Primeiro, identifique o funcionário com o cartão QR"
                  : "Agora escaneie o equipamento para emprestar/devolver"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEmployee && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      {selectedEmployee.name}
                    </span>
                  </div>
                </div>
              )}

              {currentStep === "employee" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    QR Code do Funcionário
                  </label>
                  <Input
                    placeholder="Escaneie o QR do funcionário..."
                    value={employeeQR}
                    onChange={(e) => setEmployeeQR(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEmployeeQRScan()}
                  />
                  <Button onClick={handleEmployeeQRScan} className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Identificar Funcionário
                  </Button>
                  
                  <QRScanner 
                    onScan={(result) => {
                      setEmployeeQR(result);
                      handleEmployeeQRScan();
                    }}
                    isActive={isEmployeeScanning}
                    onToggle={() => setIsEmployeeScanning(!isEmployeeScanning)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    QR Code do Equipamento
                  </label>
                  <Input
                    placeholder="Escaneie o QR do equipamento..."
                    value={equipmentQR}
                    onChange={(e) => setEquipmentQR(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEquipmentQRScan()}
                  />
                  <Button onClick={handleEquipmentQRScan} className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Processar Equipamento
                  </Button>
                  
                  <QRScanner 
                    onScan={(result) => {
                      setEquipmentQR(result);
                      handleEquipmentQRScan();
                    }}
                    isActive={isEquipmentScanning}
                    onToggle={() => setIsEquipmentScanning(!isEquipmentScanning)}
                  />
                </div>
              )}

              <Button 
                variant="secondary" 
                onClick={handleDemoLoan}
                className="w-full"
              >
                Demo - Empréstimo Automático
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {getCurrentlyBorrowed().length}
                  </div>
                  <div className="text-sm text-orange-600">Emprestados</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {equipment.filter(eq => eq.status === "available").length}
                  </div>
                  <div className="text-sm text-green-600">Disponíveis</div>
                </div>
              </div>

              {/* Available Equipment */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Equipamentos Disponíveis</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {equipment.filter(eq => eq.status === "available").map((item) => (
                    <div key={item.id} className="text-sm p-2 bg-muted rounded flex justify-between">
                      <span>{item.name}</span>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Loans */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Empréstimos Ativos</CardTitle>
            <CardDescription>
              Equipamentos atualmente emprestados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getCurrentlyBorrowed().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum equipamento emprestado no momento
              </div>
            ) : (
              <div className="space-y-2">
                {getCurrentlyBorrowed().map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">{loan.equipmentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.employeeName} • {new Date(loan.loanTimestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="destructive">
                      Emprestado
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Atividade de Hoje</CardTitle>
            <CardDescription>
              Empréstimos e devoluções do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getTodayLoans().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade registrada hoje
              </div>
            ) : (
              <div className="space-y-2">
                {getTodayLoans().map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{loan.equipmentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.employeeName} • {new Date(loan.loanTimestamp).toLocaleTimeString('pt-BR')}
                          {loan.returnTimestamp && (
                            <> → {new Date(loan.returnTimestamp).toLocaleTimeString('pt-BR')}</>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={loan.status === "borrowed" ? "destructive" : "default"}
                    >
                      {loan.status === "borrowed" ? "Emprestado" : "Devolvido"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}