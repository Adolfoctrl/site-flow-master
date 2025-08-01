import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode, Camera, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import QRScanner from "@/components/QRScanner";

interface CheckInRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "check-in" | "check-out";
  timestamp: string;
  qrCode: string;
}

export default function CheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrInput, setQrInput] = useState("");
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Load check-in records from localStorage
    const savedRecords = localStorage.getItem('tecnobra_checkin_records');
    if (savedRecords) {
      setCheckInRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleQRScan = () => {
    if (!qrInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código QR do funcionário",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse QR code (should contain employee data)
      const employeeData = JSON.parse(qrInput);
      
      if (!employeeData.id || !employeeData.name) {
        throw new Error("QR Code inválido");
      }

      // Check if employee already checked in today
      const today = new Date().toDateString();
      const todayRecords = checkInRecords.filter(record => 
        new Date(record.timestamp).toDateString() === today && 
        record.employeeId === employeeData.id
      );

      const lastRecord = todayRecords[todayRecords.length - 1];
      const isCheckIn = !lastRecord || lastRecord.type === "check-out";

      const newRecord: CheckInRecord = {
        id: Date.now().toString(),
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        type: isCheckIn ? "check-in" : "check-out",
        timestamp: new Date().toISOString(),
        qrCode: qrInput
      };

      const updatedRecords = [...checkInRecords, newRecord];
      setCheckInRecords(updatedRecords);
      localStorage.setItem('tecnobra_checkin_records', JSON.stringify(updatedRecords));

      toast({
        title: isCheckIn ? "Entrada Registrada" : "Saída Registrada",
        description: `${employeeData.name} - ${new Date().toLocaleTimeString()}`,
      });

      setQrInput("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "QR Code inválido ou formato incorreto",
        variant: "destructive",
      });
    }
  };

  const handleManualCheckIn = () => {
    // For demo purposes - simulate QR scan with manual employee selection
    const demoEmployee = {
      id: "1",
      name: "João Silva",
      email: "joao@tecnobra.com"
    };

    const today = new Date().toDateString();
    const todayRecords = checkInRecords.filter(record => 
      new Date(record.timestamp).toDateString() === today && 
      record.employeeId === demoEmployee.id
    );

    const lastRecord = todayRecords[todayRecords.length - 1];
    const isCheckIn = !lastRecord || lastRecord.type === "check-out";

    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      employeeId: demoEmployee.id,
      employeeName: demoEmployee.name,
      type: isCheckIn ? "check-in" : "check-out",
      timestamp: new Date().toISOString(),
      qrCode: JSON.stringify(demoEmployee)
    };

    const updatedRecords = [...checkInRecords, newRecord];
    setCheckInRecords(updatedRecords);
    localStorage.setItem('tecnobra_checkin_records', JSON.stringify(updatedRecords));

    toast({
      title: isCheckIn ? "Entrada Registrada" : "Saída Registrada",
      description: `${demoEmployee.name} - ${new Date().toLocaleTimeString()}`,
    });
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return checkInRecords.filter(record => 
      new Date(record.timestamp).toDateString() === today
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getEmployeeStatus = (employeeId: string) => {
    const today = new Date().toDateString();
    const todayRecords = checkInRecords.filter(record => 
      new Date(record.timestamp).toDateString() === today && 
      record.employeeId === employeeId
    );
    
    const lastRecord = todayRecords[todayRecords.length - 1];
    return lastRecord?.type === "check-in" ? "Presente" : "Ausente";
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
              <h1 className="text-3xl font-bold">Controle de Ponto</h1>
              <p className="text-muted-foreground">
                Sistema de registro de entrada e saída
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scanner QR
              </CardTitle>
              <CardDescription>
                Escaneie o cartão QR do funcionário para registrar entrada/saída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="qr-input" className="text-sm font-medium">
                  Código QR do Funcionário
                </label>
                <Input
                  id="qr-input"
                  placeholder="Cole ou digite o código QR aqui..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleQRScan} className="flex-1">
                  <QrCode className="h-4 w-4 mr-2" />
                  Registrar Ponto
                </Button>
              </div>

              {/* QR Scanner */}
              <QRScanner 
                onScan={(result) => {
                  setQrInput(result);
                  handleQRScan();
                }}
                isActive={isScanning}
                onToggle={() => setIsScanning(!isScanning)}
              />

              {/* Demo button for testing */}
              <Button 
                variant="secondary" 
                onClick={handleManualCheckIn}
                className="w-full"
              >
                Demo - Registrar João Silva
              </Button>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Resumo de Hoje
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {getTodayRecords().filter(r => r.type === 'check-in').length}
                  </div>
                  <div className="text-sm text-green-600">Entradas</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getTodayRecords().filter(r => r.type === 'check-out').length}
                  </div>
                  <div className="text-sm text-blue-600">Saídas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Records */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Registros de Hoje</CardTitle>
            <CardDescription>
              Últimas entradas e saídas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getTodayRecords().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum registro encontrado para hoje
              </div>
            ) : (
              <div className="space-y-2">
                {getTodayRecords().map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {record.type === 'check-in' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(record.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={record.type === 'check-in' ? 'default' : 'secondary'}
                    >
                      {record.type === 'check-in' ? 'Entrada' : 'Saída'}
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