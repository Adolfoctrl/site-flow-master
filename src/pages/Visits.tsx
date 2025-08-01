import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, UserCheck, Clock, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const visitSchema = z.object({
  visitorName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  company: z.string().min(2, "Empresa é obrigatória"),
  purpose: z.string().min(5, "Propósito deve ter pelo menos 5 caracteres"),
  hostEmployee: z.string().min(2, "Funcionário responsável é obrigatório"),
  expectedDuration: z.string().min(1, "Duração esperada é obrigatória"),
  licensePlate: z.string().optional(),
});

type Visit = z.infer<typeof visitSchema> & {
  id: string;
  checkInTime: string;
  checkOutTime?: string;
  status: "pending" | "active" | "completed";
  createdAt: string;
  licensePlate?: string;
};

export default function Visits() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [visits, setVisits] = useState<Visit[]>([
    {
      id: "1",
      visitorName: "Carlos Mendes",
      company: "ABC Construções",
      purpose: "Inspeção de qualidade dos materiais",
      hostEmployee: "João Silva",
      expectedDuration: "2 horas",
      checkInTime: "2024-01-15T08:30:00",
      checkOutTime: "2024-01-15T10:45:00",
      status: "completed",
      createdAt: "2024-01-15",
      licensePlate: "AB-1234-CD"
    },
    {
      id: "2",
      visitorName: "Ana Costa",
      company: "XYZ Engenharia",
      purpose: "Reunião sobre novos projetos",
      hostEmployee: "Maria Santos",
      expectedDuration: "3 horas",
      checkInTime: "2024-01-15T14:00:00",
      status: "active",
      createdAt: "2024-01-15",
      licensePlate: "XY-5678-EF"
    },
    {
      id: "3",
      visitorName: "Pedro Oliveira",
      company: "Tech Solutions",
      purpose: "Apresentação de novo sistema",
      hostEmployee: "Carlos Lima",
      expectedDuration: "1 hora",
      checkInTime: "",
      status: "pending",
      createdAt: "2024-01-16"
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitorName: "",
      company: "",
      purpose: "",
      hostEmployee: "",
      expectedDuration: "",
      licensePlate: "",
    },
  });

  const filteredVisits = visits.filter(visit =>
    visit.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.hostEmployee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (data: z.infer<typeof visitSchema>) => {
    const newVisit: Visit = {
      ...data,
      id: Date.now().toString(),
      checkInTime: "",
      status: "pending",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVisits(prev => [...prev, newVisit]);
    
    toast({
      title: "Visita agendada!",
      description: "Nova visita foi registrada no sistema.",
    });
    
    setIsDialogOpen(false);
    form.reset();
  };

  const handleCheckIn = (id: string) => {
    setVisits(prev => prev.map(visit => 
      visit.id === id 
        ? { ...visit, status: "active" as const, checkInTime: new Date().toISOString() }
        : visit
    ));
    toast({
      title: "Check-in realizado!",
      description: "Visitante registrado como presente.",
    });
  };

  const handleCheckOut = (id: string) => {
    setVisits(prev => prev.map(visit => 
      visit.id === id 
        ? { ...visit, status: "completed" as const, checkOutTime: new Date().toISOString() }
        : visit
    ));
    toast({
      title: "Check-out realizado!",
      description: "Visita finalizada com sucesso.",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Agendada",
      active: "Em andamento",
      completed: "Finalizada"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Visitas</h1>
            <p className="text-gray-600">Gerencie visitantes e acompanhantes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => form.reset()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Visita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Visita</DialogTitle>
                <DialogDescription>
                  Registre uma nova visita no sistema
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="visitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Visitante</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propósito da Visita</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Reunião, inspeção, apresentação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hostEmployee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funcionário Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do funcionário responsável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração Esperada</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 2 horas, 30 minutos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula do Veículo (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: AB-1234-CD" {...field} />
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
                      Agendar Visita
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar visitas..."
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
                <UserCheck className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{visits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendadas</p>
                  <p className="text-2xl font-bold">{visits.filter(v => v.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold">{visits.filter(v => v.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Finalizadas</p>
                  <p className="text-2xl font-bold">{visits.filter(v => v.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{visit.visitorName}</CardTitle>
                  <Badge className={getStatusColor(visit.status)}>
                    {getStatusLabel(visit.status)}
                  </Badge>
                </div>
                <CardDescription>{visit.company}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Propósito:</strong> {visit.purpose}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Responsável:</strong> {visit.hostEmployee}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duração:</strong> {visit.expectedDuration}
                  </p>
                  {visit.licensePlate && (
                    <p className="text-sm text-gray-600">
                      <strong>Matrícula:</strong> {visit.licensePlate}
                    </p>
                  )}
                  {visit.checkInTime && (
                    <p className="text-sm text-gray-600">
                      <strong>Entrada:</strong> {new Date(visit.checkInTime).toLocaleString('pt-BR')}
                    </p>
                  )}
                  {visit.checkOutTime && (
                    <p className="text-sm text-gray-600">
                      <strong>Saída:</strong> {new Date(visit.checkOutTime).toLocaleString('pt-BR')}
                    </p>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    {visit.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCheckIn(visit.id)}
                        className="flex-1"
                      >
                        Check-in
                      </Button>
                    )}
                    {visit.status === "active" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCheckOut(visit.id)}
                        className="flex-1"
                      >
                        Check-out
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVisits.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma visita encontrada</h3>
            <p className="text-gray-600">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Comece agendando uma nova visita"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}