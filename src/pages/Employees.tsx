import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Edit, Trash2, User, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import QRCode from "qrcode";
import { EmployeeCard } from "@/components/EmployeeCard";
import html2canvas from "html2canvas";
import { useRef } from "react";

const employeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "supervisor", "worker", "visitor"]),
  department: z.string().min(2, "Departamento é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  photo: z.string().optional(),
});

type Employee = z.infer<typeof employeeSchema> & {
  id: string;
  status: "active" | "inactive";
  createdAt: string;
  photo?: string;
};

export default function Employees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@tecnobra.com",
      role: "supervisor",
      department: "Produção",
      phone: "(11) 99999-9999",
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@tecnobra.com",
      role: "worker",
      department: "Qualidade",
      phone: "(11) 88888-8888",
      status: "active",
      createdAt: "2024-01-20"
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "worker",
      department: "",
      phone: "",
    },
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateEmployeeQR = async (employee: Employee) => {
    try {
      const qrData = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        createdAt: employee.createdAt,
        type: "employee_card"
      };
      
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeUrl;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  };

  const sendEmployeeCard = async (employee: Employee) => {
    try {
      const qrCodeUrl = await generateEmployeeQR(employee);
      if (!qrCodeUrl) {
        throw new Error('Erro ao gerar QR Code');
      }

      // Save QR code to localStorage for demo
      const employeeCards = JSON.parse(localStorage.getItem('tecnobra_employee_cards') || '{}');
      employeeCards[employee.id] = {
        ...employee,
        qrCodeUrl,
        generatedAt: new Date().toISOString()
      };
      localStorage.setItem('tecnobra_employee_cards', JSON.stringify(employeeCards));

      // Render employee card and convert to image
      const cardElement = document.createElement('div');
      cardElement.style.position = 'absolute';
      cardElement.style.left = '-9999px';
      document.body.appendChild(cardElement);

      // Create a temporary React root to render the card
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(cardElement);
      
      await new Promise<void>((resolve) => {
        root.render(
          <EmployeeCard employee={employee} qrCodeUrl={qrCodeUrl} />
        );
        setTimeout(resolve, 1000); // Wait for render
      });

      // Convert to canvas and get image
      const canvas = await html2canvas(cardElement.firstChild as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Clean up
      document.body.removeChild(cardElement);

      // Create download link for the card image
      const cardImageUrl = URL.createObjectURL(imageBlob);
      const cardDownloadLink = `${window.location.origin}/cartao/${employee.id}`;

      // Create WhatsApp message with download link
      const whatsappMessage = `🏗️ *TECNOBRA - Cartão de Funcionário*

Olá ${employee.name}!

Seu cartão de funcionário foi gerado com sucesso. 

📲 *Baixe seu cartão aqui:* ${cardDownloadLink}

Use o QR Code do cartão para:
✅ Marcar presença na obra
✅ Retirar equipamentos
✅ Identificação no local

*Instruções:*
• Apresente este cartão na entrada da obra
• Use o QR Code nos pontos de controle
• Mantenha sempre visível durante o trabalho

ID Funcionário: ${employee.id}
Departamento: ${employee.department}
Função: ${employee.role}

Para dúvidas, entre em contato com o RH.`;

      const phoneNumber = employee.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      const link = document.createElement('a');
      link.href = cardImageUrl;
      link.download = `cartao_${employee.name.replace(/\s+/g, '_')}.png`;

      toast({
        title: "Cartão QR Gerado!",
        description: `Cartão de ${employee.name} criado com sucesso.`,
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => link.click()}>
              Baixar
            </Button>
            <Button size="sm" onClick={() => window.open(whatsappUrl, '_blank')}>
              WhatsApp
            </Button>
          </div>
        ),
      });
    } catch (error) {
      console.error('Erro ao gerar cartão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o cartão QR",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: z.infer<typeof employeeSchema>) => {
    if (editingEmployee) {
      const updatedEmployee = { ...editingEmployee, ...data };
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? updatedEmployee
          : emp
      ));
      toast({
        title: "Funcionário atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    } else {
      const newEmployee: Employee = {
        ...data,
        id: Date.now().toString(),
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setEmployees(prev => [...prev, newEmployee]);
      
      // Generate and send employee card automatically
      await sendEmployeeCard(newEmployee);
      
      toast({
        title: "Funcionário cadastrado!",
        description: "Novo funcionário adicionado e cartão QR gerado!",
      });
    }
    setIsDialogOpen(false);
    setEditingEmployee(null);
    form.reset();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast({
      title: "Funcionário removido",
      description: "O funcionário foi removido do sistema.",
    });
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      supervisor: "Supervisor", 
      worker: "Trabalhador",
      visitor: "Visitante"
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      supervisor: "bg-blue-100 text-blue-800",
      worker: "bg-green-100 text-green-800", 
      visitor: "bg-gray-100 text-gray-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
              <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
              <p className="text-gray-600">Gerencie os funcionários da empresa</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEmployee(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Atualize as informações do funcionário" : "Cadastre um novo funcionário no sistema"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Produção, Qualidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="worker">Trabalhador</SelectItem>
                            <SelectItem value="visitor">Visitante</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto do Funcionário</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  field.onChange(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-2">
                            <img 
                              src={field.value} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded-full border"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingEmployee ? "Atualizar" : "Cadastrar"}
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
              placeholder="Buscar funcionários..."
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
                <User className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Supervisores</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.role === 'supervisor').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Trabalhadores</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.role === 'worker').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => sendEmployeeCard(employee)}
                      title="Gerar/Reenviar Cartão QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{employee.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className={getRoleColor(employee.role)}>
                    {getRoleLabel(employee.role)}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    <strong>Departamento:</strong> {employee.department}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Telefone:</strong> {employee.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Cadastrado:</strong> {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
            <p className="text-gray-600">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando um novo funcionário"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}