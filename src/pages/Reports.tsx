import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Calendar, Users, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const reportTypes = [
    { value: "attendance", label: "Relatório de Presença", icon: Users },
    { value: "equipment", label: "Relatório de Equipamentos", icon: Package },
    { value: "machines", label: "Relatório de Máquinas", icon: Clock },
    { value: "productivity", label: "Relatório de Produtividade", icon: FileText },
  ];

  const generateReport = () => {
    if (!reportType || !dateFrom || !dateTo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos para gerar o relatório",
        variant: "destructive",
      });
      return;
    }

    // Simulate report generation
    const reportData = {
      type: reportType,
      period: `${dateFrom} a ${dateTo}`,
      generated: new Date().toISOString(),
    };

    // Create CSV content based on report type
    let csvContent = "";
    switch (reportType) {
      case "attendance":
        csvContent = "Nome,Data,Entrada,Saída,Horas Trabalhadas\n";
        csvContent += "João Silva,2024-01-15,08:00,17:00,8h\n";
        csvContent += "Maria Santos,2024-01-15,08:15,17:15,8h\n";
        break;
      case "equipment":
        csvContent = "Equipamento,Funcionário,Data Retirada,Data Devolução,Status\n";
        csvContent += "Martelo Elétrico,João Silva,2024-01-15 08:30,2024-01-15 17:00,Devolvido\n";
        csvContent += "Furadeira,Maria Santos,2024-01-15 09:00,2024-01-15 16:30,Devolvido\n";
        break;
      case "machines":
        csvContent = "Máquina,Operador,Tempo de Uso,Eficiência,Data\n";
        csvContent += "Linha de Produção A,João Silva,8h,92%,2024-01-15\n";
        csvContent += "Prensa Automática B,Maria Santos,6h,87%,2024-01-15\n";
        break;
      case "productivity":
        csvContent = "Funcionário,Produção,Qualidade,Eficiência,Data\n";
        csvContent += "João Silva,120 peças,98%,95%,2024-01-15\n";
        csvContent += "Maria Santos,110 peças,99%,93%,2024-01-15\n";
        break;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${reportType}_${dateFrom}_${dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório Gerado!",
      description: `Relatório de ${reportTypes.find(r => r.value === reportType)?.label} foi baixado com sucesso.`,
    });
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
              <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-600">Gere relatórios detalhados do sistema</p>
            </div>
          </div>
        </div>

        {/* Report Generator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerador de Relatórios</CardTitle>
            <CardDescription>Selecione o tipo de relatório e o período desejado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={generateReport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((type) => (
            <Card key={type.value} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <type.icon className="w-8 h-8 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                    <CardDescription>Relatório rápido</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReportType(type.value);
                    const today = new Date().toISOString().split('T')[0];
                    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setDateFrom(lastWeek);
                    setDateTo(today);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Últimos 7 dias
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}