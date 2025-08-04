import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Play, Square, Clock, QrCode, FileText, Calendar, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateMachineQR } from "@/utils/qrCodeUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const rentalMachineSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  type: z.string().min(2, "Tipo é obrigatório"),
  model: z.string().min(2, "Modelo é obrigatório"),
  supplier: z.string().min(2, "Fornecedor é obrigatório"),
  hourlyRate: z.number().min(0.01, "Valor por hora deve ser maior que 0"),
  plate: z.string().min(3, "Placa é obrigatória"),
  operator: z.string().min(2, "Operador é obrigatório"),
});

interface RentalMachine {
  id: string;
  name: string;
  type: string;
  model: string;
  supplier: string;
  hourlyRate: number;
  plate: string;
  operator: string;
  qrCode: string;
  status: "idle" | "working" | "offline";
  entryDate: string;
  totalHours: number;
  currentSessionStart?: string;
  sessions: WorkSession[];
}

interface WorkSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // em minutos
  operator: string;
  date: string;
}

export default function RentalControl() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState<RentalMachine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<RentalMachine | null>(null);
  const [reportPeriod, setReportPeriod] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const form = useForm<z.infer<typeof rentalMachineSchema>>({
    resolver: zodResolver(rentalMachineSchema),
    defaultValues: {
      name: "",
      type: "",
      model: "",
      supplier: "",
      hourlyRate: undefined,
      plate: "",
      operator: "",
    },
  });

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Timer para atualizar máquinas em funcionamento
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => prev.map(machine => {
        if (machine.status === 'working' && machine.currentSessionStart) {
          const now = new Date();
          const start = new Date(machine.currentSessionStart);
          const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
          return { ...machine, totalHours: machine.totalHours + (diffMinutes / 60) };
        }
        return machine;
      }));
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const generateQRCode = async (machineId: string): Promise<string> => {
    try {
      const machineData = {
        id: machineId,
        name: `Máquina ${machineId}`,
        type: "rental_machine"
      };
      
      const qrCodeDataURL = await generateMachineQR(machineData);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  };

  const handleSubmit = async (data: z.infer<typeof rentalMachineSchema>) => {
    const machineId = Date.now().toString();
    const qrCode = await generateQRCode(machineId);
    
    const newMachine: RentalMachine = {
      id: machineId,
      name: data.name,
      type: data.type,
      model: data.model,
      supplier: data.supplier,
      hourlyRate: data.hourlyRate,
      plate: data.plate,
      operator: data.operator,
      qrCode,
      status: "idle",
      entryDate: new Date().toISOString(),
      totalHours: 0,
      sessions: []
    };

    setMachines(prev => [...prev, newMachine]);
    toast({
      title: "Máquina registrada!",
      description: "QR Code gerado com sucesso.",
    });
    
    setIsDialogOpen(false);
    form.reset();
  };

  const startWork = (machineId: string) => {
    setMachines(prev => prev.map(machine => {
      if (machine.id === machineId && machine.status === 'idle') {
        return {
          ...machine,
          status: 'working' as const,
          currentSessionStart: new Date().toISOString()
        };
      }
      return machine;
    }));

    toast({
      title: "Trabalho iniciado!",
      description: "Cronômetro ativado para a máquina.",
    });
  };

  const stopWork = (machineId: string) => {
    setMachines(prev => prev.map(machine => {
      if (machine.id === machineId && machine.status === 'working' && machine.currentSessionStart) {
        const now = new Date();
        const start = new Date(machine.currentSessionStart);
        const duration = Math.floor((now.getTime() - start.getTime()) / 60000); // em minutos

        const newSession: WorkSession = {
          id: Date.now().toString(),
          startTime: machine.currentSessionStart,
          endTime: now.toISOString(),
          duration,
          operator: machine.operator,
          date: now.toISOString().split('T')[0]
        };

        return {
          ...machine,
          status: 'idle' as const,
          currentSessionStart: undefined,
          totalHours: machine.totalHours + (duration / 60),
          sessions: [...machine.sessions, newSession]
        };
      }
      return machine;
    }));

    toast({
      title: "Trabalho finalizado!",
      description: "Tempo registrado com sucesso.",
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      idle: "bg-gray-100 text-gray-800",
      working: "bg-green-100 text-green-800",
      offline: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      idle: "Parada",
      working: "Trabalhando",
      offline: "Offline"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getCurrentSessionTime = (machine: RentalMachine): string => {
    if (machine.status !== 'working' || !machine.currentSessionStart) return '0h 0m';
    
    const now = new Date();
    const start = new Date(machine.currentSessionStart);
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getFilteredSessions = () => {
    let startDate = new Date();
    let endDate = new Date();

    switch (reportPeriod) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return machines.map(machine => ({
      ...machine,
      filteredSessions: machine.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      })
    }));
  };

  const generateReport = () => {
    const filteredData = getFilteredSessions();
    const reportContent = filteredData.map(machine => {
      const totalMinutes = machine.filteredSessions.reduce((acc, session) => acc + session.duration, 0);
      const totalHours = totalMinutes / 60;
      const totalCost = totalHours * machine.hourlyRate;

      return {
        machine: machine.name,
        supplier: machine.supplier,
        operator: machine.operator,
        plate: machine.plate,
        type: machine.type,
        model: machine.model,
        totalMinutes: totalMinutes,
        hours: totalHours,
        rate: machine.hourlyRate,
        cost: totalCost,
        sessions: machine.filteredSessions.length,
        detailedSessions: machine.filteredSessions.map(session => ({
          startTime: new Date(session.startTime).toLocaleString('pt-BR'),
          endTime: session.endTime ? new Date(session.endTime).toLocaleString('pt-BR') : 'Em andamento',
          duration: `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`,
          date: new Date(session.date).toLocaleDateString('pt-BR')
        }))
      };
    });

    return reportContent;
  };

  const printReport = () => {
    const reportData = generateReport();
    const totalCost = reportData.reduce((acc, item) => acc + item.cost, 0);
    const totalMinutes = reportData.reduce((acc, item) => acc + item.totalMinutes, 0);
    const totalHours = totalMinutes / 60;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório Completo de Máquinas Alugadas</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
              .summary { margin-top: 20px; padding: 10px; background-color: #f9f9f9; }
              .machine-section { margin-top: 30px; page-break-inside: avoid; }
              .sessions-table { margin-top: 10px; font-size: 0.9em; }
              .sessions-table th, .sessions-table td { padding: 4px 6px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório Completo de Máquinas Alugadas</h1>
              <p>Período: ${reportPeriod === 'custom' ? `${new Date(customStartDate).toLocaleDateString('pt-BR')} a ${new Date(customEndDate).toLocaleDateString('pt-BR')}` : reportPeriod}</p>
              <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            
            <div class="summary">
              <h3>Resumo Geral</h3>
              <p><strong>Total de Tempo:</strong> ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m (${formatHours(totalHours)})</p>
              <p><strong>Valor Total:</strong> € ${totalCost.toFixed(2)}</p>
              <p><strong>Máquinas Ativas:</strong> ${reportData.filter(item => item.totalMinutes > 0).length}</p>
              <p><strong>Valor Médio/Hora:</strong> € ${totalHours > 0 ? (totalCost / totalHours).toFixed(2) : '0.00'}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Máquina</th>
                  <th>Tipo/Modelo</th>
                  <th>Placa</th>
                  <th>Fornecedor</th>
                  <th>Operador</th>
                  <th>Tempo Total</th>
                  <th>Valor/Hora</th>
                  <th>Valor Total</th>
                  <th>Sessões</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.map(item => `
                  <tr>
                    <td><strong>${item.machine}</strong></td>
                    <td>${item.type} - ${item.model}</td>
                    <td>${item.plate}</td>
                    <td>${item.supplier}</td>
                    <td>${item.operator}</td>
                    <td>${Math.floor(item.totalMinutes / 60)}h ${item.totalMinutes % 60}m</td>
                    <td>€ ${item.rate.toFixed(2)}</td>
                    <td><strong>€ ${item.cost.toFixed(2)}</strong></td>
                    <td>${item.sessions}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${reportData.filter(item => item.detailedSessions.length > 0).map(item => `
              <div class="machine-section">
                <h3>Detalhes de Sessões - ${item.machine}</h3>
                <table class="sessions-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Início</th>
                      <th>Fim</th>
                      <th>Duração</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${item.detailedSessions.map(session => {
                      const sessionMinutes = parseInt(session.duration.split('h')[0]) * 60 + parseInt(session.duration.split('h')[1].split('m')[0]);
                      const sessionValue = (sessionMinutes / 60) * item.rate;
                      return `
                        <tr>
                          <td>${session.date}</td>
                          <td>${session.startTime.split(' ')[1]}</td>
                          <td>${session.endTime.includes('Em andamento') ? session.endTime : session.endTime.split(' ')[1]}</td>
                          <td>${session.duration}</td>
                          <td>€ ${sessionValue.toFixed(2)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
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
            <h1 className="text-3xl font-bold text-gray-900">Controle de Aluguel</h1>
            <p className="text-gray-600">Gerencie máquinas alugadas com QR Code</p>
          </div>
        </div>

        <Tabs defaultValue="machines" className="space-y-6">
          <TabsList>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="machines" className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar máquinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Máquina
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Registrar Máquina Alugada</DialogTitle>
                    <DialogDescription>
                      Registre uma nova máquina na obra
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Máquina</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Escavadeira CAT" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Escavadeira" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 320D" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="plate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placa</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="operator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Operador</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do operador" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Valor por Hora (€)</FormLabel>
                             <FormControl>
                               <Input 
                                 type="number" 
                                 step="0.01"
                                 placeholder="Insira o valor..." 
                                 {...field}
                                 value={field.value || ""}
                                 onChange={(e) => {
                                   const value = e.target.value;
                                   field.onChange(value === "" ? undefined : parseFloat(value));
                                 }}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Registrar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Machine Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map((machine) => (
                <Card key={machine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{machine.name}</CardTitle>
                      <Badge className={getStatusColor(machine.status)}>
                        {getStatusLabel(machine.status)}
                      </Badge>
                    </div>
                    <CardDescription>{machine.type} - {machine.model}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Fornecedor:</p>
                          <p className="font-medium">{machine.supplier}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Placa:</p>
                          <p className="font-medium">{machine.plate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Operador:</p>
                          <p className="font-medium">{machine.operator}</p>
                        </div>
                         <div>
                           <p className="text-gray-600">€/Hora:</p>
                           <p className="font-medium">€ {machine.hourlyRate.toFixed(2)}</p>
                         </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Trabalhado:</span>
                          <span className="font-bold">{formatHours(machine.totalHours)}</span>
                        </div>
                        {machine.status === 'working' && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-green-600">Sessão Atual:</span>
                            <span className="font-bold text-green-600">{getCurrentSessionTime(machine)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Valor Acumulado:</span>
                           <span className="font-bold text-blue-600">
                             € {(machine.totalHours * machine.hourlyRate).toFixed(2)}
                           </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {machine.status === 'idle' ? (
                          <Button 
                            onClick={() => startWork(machine.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => stopWork(machine.id)}
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Parar
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMachine(machine);
                            setQrModalOpen(true);
                          }}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Report Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros do Relatório</CardTitle>
                <CardDescription>Selecione o período para gerar o relatório</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mês</SelectItem>
                        <SelectItem value="custom">Período Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportPeriod === 'custom' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data Início</label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data Fim</label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={printReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Imprimir Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(() => {
                const reportData = generateReport();
                const totalCost = reportData.reduce((acc, item) => acc + item.cost, 0);
                const totalHours = reportData.reduce((acc, item) => acc + item.hours, 0);
                const activeMachines = reportData.filter(item => item.hours > 0).length;

                return (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total de Horas</p>
                            <p className="text-2xl font-bold">{formatHours(totalHours)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-8 h-8 text-green-500" />
                          <div>
                             <p className="text-sm font-medium text-gray-600">Valor Total</p>
                             <p className="text-2xl font-bold">€ {totalCost.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-8 h-8 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Máquinas Ativas</p>
                            <p className="text-2xl font-bold">{activeMachines}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-8 h-8 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Média/Hora</p>
                             <p className="text-2xl font-bold">
                               € {totalHours > 0 ? (totalCost / totalHours).toFixed(2) : '0.00'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>

            {/* Report Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Máquina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                     <thead>
                       <tr className="border-b">
                         <th className="text-left p-2">Máquina</th>
                         <th className="text-left p-2">Tipo</th>
                         <th className="text-left p-2">Placa</th>
                         <th className="text-left p-2">Fornecedor</th>
                         <th className="text-left p-2">Operador</th>
                         <th className="text-right p-2">Tempo</th>
                         <th className="text-right p-2">Valor/Hora</th>
                         <th className="text-right p-2">Total</th>
                         <th className="text-center p-2">Sessões</th>
                       </tr>
                     </thead>
                    <tbody>
                       {generateReport().map((item, index) => (
                         <tr key={index} className="border-b hover:bg-gray-50">
                           <td className="p-2 font-medium">{item.machine}</td>
                           <td className="p-2">{item.type} - {item.model}</td>
                           <td className="p-2">{item.plate}</td>
                           <td className="p-2">{item.supplier}</td>
                           <td className="p-2">{item.operator}</td>
                           <td className="p-2 text-right">{Math.floor(item.totalMinutes / 60)}h {item.totalMinutes % 60}m</td>
                           <td className="p-2 text-right">€ {item.rate.toFixed(2)}</td>
                           <td className="p-2 text-right font-bold">€ {item.cost.toFixed(2)}</td>
                           <td className="p-2 text-center">{item.sessions}</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code - {selectedMachine?.name}</DialogTitle>
              <DialogDescription>
                Use este QR Code para iniciar/parar a máquina
              </DialogDescription>
            </DialogHeader>
            {selectedMachine && (
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={selectedMachine.qrCode} 
                  alt="QR Code" 
                  className="w-64 h-64 border"
                />
                <div className="text-center">
                  <p className="font-medium">{selectedMachine.name}</p>
                  <p className="text-sm text-gray-600">{selectedMachine.plate}</p>
                  <p className="text-sm text-gray-600">Operador: {selectedMachine.operator}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}