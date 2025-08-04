import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Camera, Square, Zap } from 'lucide-react';
import { SCANNER_CONFIG } from '@/utils/qrCodeUtils';
import { useToast } from '@/components/ui/use-toast';

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function QRScanner({ onScan, isActive, onToggle }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanCount, setScanCount] = useState<number>(0);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const handleSuccessfulScan = useCallback((result: string) => {
    setIsScanning(false);
    setScanCount(prev => prev + 1);
    
    toast({
      title: "QR Code detectado!",
      description: "Código lido com sucesso",
      duration: 2000,
    });
    
    onScan(result);
    stopScanner();
    onToggle();
  }, [onScan, onToggle, toast]);

  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);
      setScanCount(0);
      
      // Solicitar permissão da câmera com configurações otimizadas
      const stream = await navigator.mediaDevices.getUserMedia(SCANNER_CONFIG);
      
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Aguardar o vídeo carregar
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(void 0);
          }
        });
        
        // Inicializar o leitor QR otimizado
        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader();
        }
        
        // Usar o método oficial da biblioteca para scan contínuo
        readerRef.current.decodeFromVideoDevice(
          undefined, // Usar dispositivo padrão
          videoRef.current,
          (result, error) => {
            if (result) {
              handleSuccessfulScan(result.getText());
            }
            // Incrementar contador para mostrar atividade
            setScanCount(prev => prev + 1);
          }
        );
        
        // Timeout para evitar scan infinito
        scanTimeoutRef.current = setTimeout(() => {
          setIsScanning(false);
          stopScanner();
        }, 30000); // 30 segundos de timeout
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Erro ao acessar câmera. Verifique as permissões.');
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const stopScanner = useCallback(() => {
    setIsScanning(false);
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  if (!isActive) {
    return (
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="w-full"
      >
        <Camera className="h-4 w-4 mr-2" />
        Ativar Scanner QR
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-80 bg-black rounded-lg object-cover"
        />
        
        {/* Overlay de scanner melhorado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Frame principal do scanner */}
            <div className="w-48 h-48 border-4 border-white rounded-lg bg-transparent relative">
              {/* Cantos animados */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary animate-pulse"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary animate-pulse"></div>
              
              {/* Linha de scan */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
              )}
            </div>
            
            {/* Status do scanner */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              {isScanning ? (
                <div className="flex items-center space-x-2 text-white bg-black/50 px-4 py-2 rounded-lg">
                  <Zap className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Escaneando... {scanCount > 0 && `(${scanCount})`}</span>
                </div>
              ) : (
                <div className="text-white bg-black/50 px-4 py-2 rounded-lg">
                  <span className="text-sm">Posicione o QR Code no centro</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive text-sm text-center p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {hasPermission === false && (
        <div className="bg-destructive/10 border border-destructive text-destructive text-sm text-center p-3 rounded-lg">
          Permissão da câmera negada. Ative a câmera nas configurações do navegador.
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onToggle}
          className="flex-1"
        >
          Fechar Scanner
        </Button>
        {isScanning && (
          <Button 
            variant="secondary" 
            onClick={() => {
              stopScanner();
              setTimeout(startScanner, 500);
            }}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        )}
      </div>
    </div>
  );
}