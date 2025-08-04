import QRCode from 'qrcode';

// Configurações otimizadas para QR codes de alta legibilidade
export const QR_CONFIG = {
  // Margem maior para melhor detecção
  margin: 4,
  // Tamanho mínimo para garantir legibilidade
  width: 400,
  // Correção de erro alta para resistir a danos/má qualidade
  errorCorrectionLevel: 'H' as const,
  // Cor de fundo branca para máximo contraste
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  // Tipo de módulo mais espesso
  type: 'image/png' as const,
  // Qualidade máxima
  quality: 1.0
};

// Configurações para scanner otimizado
export const SCANNER_CONFIG = {
  video: {
    facingMode: 'environment',
    // Configurações para melhor qualidade de captura
    width: { ideal: 1920, min: 640 },
    height: { ideal: 1080, min: 480 },
    // Configurações para câmeras de baixa qualidade
    frameRate: { ideal: 30, min: 15 },
    // Foco automático
    focusMode: 'continuous',
    // Exposição automática
    exposureMode: 'continuous',
    // Redução de ruído
    noiseSuppression: true,
    // Sharpness para melhor detecção
    sharpness: 0.8
  }
};

/**
 * Gera QR code otimizado para leitura rápida e confiável
 */
export const generateOptimizedQR = async (data: any): Promise<string> => {
  try {
    // Simplificar dados para QR menor e mais legível
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Gerar QR code com configurações otimizadas
    const qrCodeDataURL = await QRCode.toDataURL(qrData, QR_CONFIG);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Erro ao gerar QR Code otimizado:', error);
    throw new Error('Falha ao gerar QR Code');
  }
};

/**
 * Gera QR code específico para funcionários
 */
export const generateEmployeeQR = async (employee: any): Promise<string> => {
  const qrData = {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    department: employee.department,
    type: "employee_card",
    v: "2.0" // Versão para compatibilidade
  };
  
  return generateOptimizedQR(qrData);
};

/**
 * Gera QR code específico para equipamentos
 */
export const generateEquipmentQR = async (equipment: any): Promise<string> => {
  const qrData = {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    category: "equipment",
    v: "2.0"
  };
  
  return generateOptimizedQR(qrData);
};

/**
 * Gera QR code específico para máquinas
 */
export const generateMachineQR = async (machine: any): Promise<string> => {
  const qrData = {
    id: machine.id,
    name: machine.name,
    type: machine.type,
    category: "machine",
    v: "2.0"
  };
  
  return generateOptimizedQR(qrData);
};

/**
 * Valida e parse dados do QR code
 */
export const parseQRData = (qrString: string): any => {
  try {
    const data = JSON.parse(qrString);
    
    // Validar estrutura básica
    if (!data.id || !data.name) {
      throw new Error('QR Code inválido: dados incompletos');
    }
    
    return data;
  } catch (error) {
    // Tentar como string simples se JSON falhar
    return { raw: qrString };
  }
};