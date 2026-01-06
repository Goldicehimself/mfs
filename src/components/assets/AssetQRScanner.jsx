import React, { useEffect, useRef, useState } from 'react';
import Modal from '../common/Modal';
import { X } from 'lucide-react';

export default function AssetQRScanner({ open = false, onClose = () => {}, onScan = () => {} }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [detectorAvailable, setDetectorAvailable] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    if (!open) return;
    init();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedDeviceId]);

  const init = async () => {
    setError('');
    setResult(null);

    // Check BarcodeDetector support
    if ('BarcodeDetector' in window && window.BarcodeDetector.getSupportedFormats) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        setDetectorAvailable(supported.includes('qr_code'));
      } catch (err) {
        setDetectorAvailable(false);
      }
    } else {
      setDetectorAvailable(false);
    }

    // enumerate devices
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (!selectedDeviceId && cams.length > 0) setSelectedDeviceId(cams[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate devices', err);
    }

    // start camera
    startCamera();
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'environment' }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      tick();
    } catch (err) {
      console.error('Camera error', err);
      setError('Unable to access camera. Please allow camera access or upload an image.');
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const cleanup = () => {
    stopCamera();
    setError('');
    setResult(null);
  };

  const tick = async () => {
    if (!scanning) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (detectorAvailable) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          // createImageBitmap is supported in modern browsers
          try {
            const bitmap = await createImageBitmap(canvas);
            const codes = await detector.detect(bitmap);
            if (codes && codes.length > 0) {
              const raw = codes[0].rawValue || codes[0].rawText || (codes[0].rawValue && String(codes[0].rawValue));
              setResult(raw);
              onScan(raw);
              stopCamera();
              return;
            }
          } catch (err) {
            // ignore detection errors and continue
            // console.warn('detection err', err);
          }
        }
      }
    } catch (err) {
      console.error('Scan tick error', err);
    }

    setTimeout(() => requestAnimationFrame(tick), 500);
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const bitmap = await createImageBitmap(file);
      if ('BarcodeDetector' in window && window.BarcodeDetector.getSupportedFormats) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const codes = await detector.detect(bitmap);
          if (codes && codes.length > 0) {
            const raw = codes[0].rawValue || codes[0].rawText || (codes[0].rawValue && String(codes[0].rawValue));
            setResult(raw);
            onScan(raw);
            return;
          }
        } catch (err) {
          console.error('File detection error', err);
        }
      }
      setError('Could not detect a QR code in the provided image.');
    } catch (err) {
      console.error('File read error', err);
      setError('Failed to read file');
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!open) return null;

  return (
    <Modal>
      <div className="max-w-3xl w-[95vw] bg-card p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button className="p-2 rounded hover:bg-gray-100 text-gray-600" onClick={handleClose}><X size={18} /></button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-h-[320px] bg-black rounded-md overflow-hidden relative">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover block" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 px-3 py-1 rounded font-semibold">Align QR code inside the frame</div>
          </div>

          <div className="w-72 flex flex-col gap-3">
            <div>
              {devices.length > 0 && (
                <select value={selectedDeviceId || ''} onChange={(e) => setSelectedDeviceId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-card">
                  {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm block mb-1">Or upload an image</label>
              <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm" />
            </div>

            <div className="space-y-2">
              {error && <div className="text-red-600 font-semibold">{error}</div>}
              {result && <div className="text-green-700 font-bold">Scanned: <strong>{result}</strong></div>}
              {!result && !detectorAvailable && <div className="text-amber-700 font-semibold">QR scanning not supported in your browser. Try uploading an image or use a Chrome-based browser.</div>}
            </div>

            <div className="mt-auto flex">
              <button className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}