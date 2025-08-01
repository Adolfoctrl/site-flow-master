import { forwardRef } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';

interface EmployeeCardProps {
  employee: any; // Simplified to avoid type issues
  qrCodeUrl?: string;
}

export const EmployeeCard = forwardRef<HTMLDivElement, EmployeeCardProps>(
  ({ employee, qrCodeUrl }, ref) => {
    const getRoleLabel = (role: string) => {
      const labels = {
        admin: "Administrador",
        supervisor: "Supervisor", 
        worker: "Trabalhador",
        visitor: "Visitante"
      };
      return labels[role as keyof typeof labels] || role;
    };

    return (
      <div ref={ref} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg -mx-6 -mt-6 mb-6">
            <h2 className="text-xl font-bold">TECNOBRA</h2>
            <p className="text-sm opacity-90">Cartão de Funcionário</p>
          </div>
        </div>

        {/* Employee Photo */}
        <div className="flex justify-center mb-4">
          {employee.photo ? (
            <img 
              src={employee.photo} 
              alt={employee.name}
              className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg font-bold text-gray-800">{employee.name}</h3>
          <p className="text-sm text-gray-600">{getRoleLabel(employee.role)}</p>
          <p className="text-sm text-gray-600">{employee.department}</p>
          <p className="text-xs text-gray-500">ID: {employee.id}</p>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center mb-4">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-32 h-32 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>Use este QR para marcar presença</p>
          <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    );
  }
);

EmployeeCard.displayName = 'EmployeeCard';