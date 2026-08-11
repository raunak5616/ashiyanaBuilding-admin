import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { SUPPORTED_BARCODE_FORMATS } from '../utils/barcodeFormats';

interface UseBarcodeScannerProps {
  onSuccess: (text: string) => void;
  onTimeout?: () => void;
}

export const useBarcodeScanner = ({ onSuccess, onTimeout }: UseBarcodeScannerProps) => {
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [noCamera, setNoCamera] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const timeoutIdRef = useRef<any | null>(null);
  const hasScannedRef = useRef<boolean>(false);

  // Initialize ZXing Reader with supported formats for faster decoding
  const getReader = useCallback(() => {
    if (!readerRef.current) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, SUPPORTED_BARCODE_FORMATS);
      readerRef.current = new BrowserMultiFormatReader(hints);
    }
    return readerRef.current;
  }, []);

  const stopScan = useCallback(() => {
    // Clear timeout timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Stop decoder controls
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner controls:', err);
      }
      controlsRef.current = null;
    }

    // Release camera MediaStream tracks immediately
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error stopping stream tracks:', err);
      }
      streamRef.current = null;
    }

    setIsScanning(false);
    setLoading(false);
  }, []);

  const startScan = useCallback(
    async (videoElement: HTMLVideoElement, deviceId?: string) => {
      stopScan();
      setLoading(true);
      setError(null);
      setPermissionDenied(false);
      setNoCamera(false);
      setTimeoutReached(false);
      videoElementRef.current = videoElement;
      hasScannedRef.current = false; // Reset scan state flag

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser does not support camera access (MediaDevices API missing).');
        setLoading(false);
        return;
      }

      try {
        // Configure getUserMedia constraints
        // Prefer rear camera ("environment") if no specific device is chosen
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: 'environment' } },
          audio: false,
        };

        // 1. Open the camera stream directly and bind it
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoElement.srcObject = stream;

        // 2. Decode from the active stream using ZXing
        const reader = getReader();
        const controls = await reader.decodeFromStream(
          stream,
          videoElement,
          (result, _err) => {
            if (result && !hasScannedRef.current) {
              const text = result.getText();
              const format = result.getBarcodeFormat();

              if (SUPPORTED_BARCODE_FORMATS.includes(format)) {
                hasScannedRef.current = true; // Set flag to block subsequent frames
                stopScan();
                onSuccess(text);
              }
            }
          }
        );

        controlsRef.current = controls;
        setIsScanning(true);
        setLoading(false);

        // 3. Update active device selection state from current track settings
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          const settings = videoTracks[0].getSettings();
          if (settings.deviceId) {
            setActiveDeviceId(settings.deviceId);
          }
        }

        // 4. Fetch the full list of cameras in the background to populate UI dropdown
        try {
          const devices = await reader.listVideoInputDevices();
          setCameraDevices(devices);
          if (devices.length === 0) {
            setNoCamera(true);
          }
        } catch (deviceErr) {
          console.warn('Failed listing camera devices in background:', deviceErr);
        }

        // 5. Start 30-second scan timeout timer
        timeoutIdRef.current = setTimeout(() => {
          stopScan();
          setTimeoutReached(true);
          if (onTimeout) onTimeout();
        }, 30000);
      } catch (err: any) {
        console.error('Camera initialization failed:', err);
        stopScan();

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setError('Camera permission was denied. Camera access is required to scan.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setNoCamera(true);
          setError('No camera was detected on this device.');
        } else {
          setError(`Camera access failed: ${err.message || 'Unknown error'}`);
        }
        setLoading(false);
      }
    },
    [activeDeviceId, getReader, onSuccess, onTimeout, stopScan]
  );

  const changeCamera = useCallback(
    (deviceId: string) => {
      setActiveDeviceId(deviceId);
      if (videoElementRef.current && isScanning) {
        startScan(videoElementRef.current, deviceId);
      }
    },
    [isScanning, startScan]
  );

  // Stop camera on unmount to prevent leaks
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);

  return {
    loading,
    isScanning,
    error,
    cameraDevices,
    activeDeviceId,
    permissionDenied,
    noCamera,
    timeoutReached,
    startScan,
    stopScan,
    changeCamera,
  };
};
