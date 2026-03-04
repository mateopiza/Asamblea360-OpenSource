import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (token: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";
  const lastScannedRef = useRef<string>("");

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }
      lastScannedRef.current = "";
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (decodedText !== lastScannedRef.current) {
            lastScannedRef.current = decodedText;
            onScanSuccess(decodedText);
          }
        },
        () => {} // ignore scan errors (no QR in frame)
      );
      setScanning(true);
    } catch (err: any) {
      setError(err?.message || "No se pudo acceder a la cámara");
      setScanning(false);
    }
  }, [onScanSuccess]);

  useEffect(() => {
    return () => {
      scannerRef.current?.isScanning && scannerRef.current.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        id={containerId}
        className="w-full rounded-lg overflow-hidden bg-muted"
        style={{ minHeight: scanning ? 300 : 0 }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        variant={scanning ? "destructive" : "default"}
        className="w-full"
        onClick={scanning ? stopScanner : startScanner}
      >
        {scanning ? (
          <><CameraOff className="h-4 w-4 mr-2" /> Detener cámara</>
        ) : (
          <><Camera className="h-4 w-4 mr-2" /> Activar cámara</>
        )}
      </Button>
    </div>
  );
}
