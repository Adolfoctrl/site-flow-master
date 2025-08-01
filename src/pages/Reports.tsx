import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Calendar, Users, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Company logo placeholder - use a simple colored rectangle

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

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add company logo placeholder
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(15, 15, 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPRESA', 35, 27, { align: 'center' });
    
    // Add title
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const reportTitle = reportTypes.find(r => r.value === reportType)?.label || 'Relatório';
    doc.text(reportTitle, pageWidth / 2, 50, { align: 'center' });
    
    // Add period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${dateFrom} a ${dateTo}`, pageWidth / 2, 65, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 75, { align: 'center' });
      
      // Prepare data based on report type
      let headers: string[] = [];
      let data: string[][] = [];
      
      switch (reportType) {
        case "attendance":
          headers = ['Nome', 'Data', 'Entrada', 'Saída', 'Horas Trabalhadas'];
          data = [
            ['João Silva', '15/01/2024', '08:00', '17:00', '8h'],
            ['Maria Santos', '15/01/2024', '08:15', '17:15', '8h'],
            ['Carlos Lima', '15/01/2024', '07:45', '16:45', '8h'],
            ['Ana Costa', '15/01/2024', '08:30', '17:30', '8h'],
          ];
          break;
        case "equipment":
          headers = ['Equipamento', 'Funcionário', 'Data Retirada', 'Data Devolução', 'Status'];
          data = [
            ['Martelo Elétrico', 'João Silva', '15/01/2024 08:30', '15/01/2024 17:00', 'Devolvido'],
            ['Furadeira', 'Maria Santos', '15/01/2024 09:00', '15/01/2024 16:30', 'Devolvido'],
            ['Serra Circular', 'Carlos Lima', '15/01/2024 07:45', '15/01/2024 16:45', 'Devolvido'],
            ['Parafusadeira', 'Ana Costa', '15/01/2024 08:30', 'Em uso', 'Em uso'],
          ];
          break;
        case "machines":
          headers = ['Máquina', 'Operador', 'Tempo de Uso', 'Eficiência', 'Data'];
          data = [
            ['Linha de Produção A', 'João Silva', '8h', '92%', '15/01/2024'],
            ['Prensa Automática B', 'Maria Santos', '6h', '87%', '15/01/2024'],
            ['Torno CNC', 'Carlos Lima', '7h', '95%', '15/01/2024'],
            ['Fresadora', 'Ana Costa', '5h', '89%', '15/01/2024'],
          ];
          break;
        case "productivity":
          headers = ['Funcionário', 'Produção', 'Qualidade', 'Eficiência', 'Data'];
          data = [
            ['João Silva', '120 peças', '98%', '95%', '15/01/2024'],
            ['Maria Santos', '110 peças', '99%', '93%', '15/01/2024'],
            ['Carlos Lima', '125 peças', '97%', '94%', '15/01/2024'],
            ['Ana Costa', '105 peças', '99%', '91%', '15/01/2024'],
          ];
          break;
      }
      
      // Add table with autoTable
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 90,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 15, right: 15 },
      });
      
      // Add summary footer
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Este relatório foi gerado automaticamente pelo sistema.', pageWidth / 2, finalY, { align: 'center' });
      
    // Save PDF
    doc.save(`relatorio_${reportType}_${dateFrom}_${dateTo}.pdf`);
    
    toast({
      title: "Relatório Gerado!",
      description: `Relatório em PDF de ${reportTitle} foi baixado com sucesso.`,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Gere relatórios detalhados do sistema</p>
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