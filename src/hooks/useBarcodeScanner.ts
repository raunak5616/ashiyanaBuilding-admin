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
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const timeoutIdRef = useRef<any | null>(null);

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

    // Stop camera controls and release media stream
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner controls:', err);
      }
      controlsRef.current = null;
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

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser does not support camera access (MediaDevices API missing).');
        setLoading(false);
        return;
      }

      try {
        const reader = getReader();

        // 1. Get devices list
        let devices: MediaDeviceInfo[] = [];
        try {
          devices = await reader.listVideoInputDevices();
          setCameraDevices(devices);
        } catch (deviceErr) {
          console.warn('Failed listing video input devices:', deviceErr);
        }

        if (devices.length === 0) {
          setNoCamera(true);
          setError('No camera was detected on this device.');
          setLoading(false);
          return;
        }

        // 2. Select active device id
        const targetDeviceId = deviceId || activeDeviceId || devices[0].deviceId;
        setActiveDeviceId(targetDeviceId);

        // 3. Start decoding from video device
        const controls = await reader.decodeFromVideoDevice(
          targetDeviceId,
          videoElement,
          (result, _err) => {
            if (result) {
              const text = result.getText();
              const format = result.getBarcodeFormat();

              // Verify the decoded format is supported
              if (SUPPORTED_BARCODE_FORMATS.includes(format)) {
                // Stop scanning and trigger success callback
                stopScan();
                onSuccess(text);
              }
            }
            // Ignore normal non-match framing errors from ZXing library
          }
        );

        controlsRef.current = controls;
        setIsScanning(true);
        setLoading(false);

        // 4. Start 30-second timeout timer
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
