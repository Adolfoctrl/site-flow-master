import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Camera, Square } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function QRScanner({ onScan, isActive, onToggle }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

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

  const startScanner = async () => {
    try {
      setError('');
      
      // Solicitar permissão da câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Câmera traseira preferencialmente
        } 
      });
      
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Inicializar o leitor QR
        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader();
        }
        
        // Começar a detectar QR codes
        readerRef.current.decodeFromVideoDevice(
          undefined, // Usar dispositivo padrão
          videoRef.current,
          (result, error) => {
            if (result) {
              onScan(result.getText());
              stopScanner();
              onToggle(); // Fechar scanner após sucesso
            }
          }
        );
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Erro ao acessar câmera. Verifique as permissões.');
      setHasPermission(false);
    }
  };

  const stopScanner = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

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
          className="w-full h-64 bg-black rounded-lg object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Square className="h-32 w-32 text-white opacity-50" strokeWidth={2} />
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
      
      {hasPermission === false && (
        <div className="text-red-600 text-sm text-center">
          Permissão da câmera negada. Ative a câmera nas configurações do navegador.
        </div>
      )}
      
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="w-full"
      >
        Fechar Scanner
      </Button>
    </div>
  );
}