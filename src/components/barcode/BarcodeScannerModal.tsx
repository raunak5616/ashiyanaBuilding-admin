import React, { useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import CloseIcon from '@mui/icons-material/Close';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import BarcodeScannerOverlay from './BarcodeScannerOverlay';

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

const playSuccessBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep tone
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (error) {
    console.warn('AudioContext beep blocked or not supported:', error);
  }
};

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  open,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSuccess = (text: string) => {
    // 1. Synth Beep Sound
    playSuccessBeep();

    // 2. Trigger Device Haptic Vibration (Android Chrome etc)
    if (navigator.vibrate) {
      try {
        navigator.vibrate(150);
      } catch (e) {
        // Ignored by browser policies
      }
    }

    // 3. Callback
    onScanSuccess(text);
  };

  const {
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
  } = useBarcodeScanner({
    onSuccess: handleSuccess,
  });

  // Start scanning when dialog opens and videoRef is bound
  useEffect(() => {
    let active = true;
    let timer: any = null;

    if (open) {
      // Delay slightly to allow dialog rendering transition
      timer = setTimeout(() => {
        if (active && videoRef.current) {
          startScan(videoRef.current);
        }
      }, 350);
    } else {
      stopScan();
    }

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      stopScan();
    };
    // Only run when open state changes to avoid infinite loop renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRetry = () => {
    if (videoRef.current) {
      startScan(videoRef.current);
    }
  };

  const handleClose = () => {
    stopScan();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-1 border border-slate-100 shadow-2xl overflow-hidden',
        },
      }}
      aria-labelledby="barcode-scanner-dialog-title"
    >
      <DialogTitle className="!flex !justify-between !items-center !pb-2 !pt-3 !px-4 select-none">
        <Typography id="barcode-scanner-dialog-title" className="!font-heading !font-black !text-md !text-slate-800">
          Scan Product Barcode
        </Typography>
        <IconButton onClick={handleClose} size="small" className="hover:bg-slate-50">
          <CloseIcon className="h-5 w-5 text-slate-500" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-0 !m-0 !overflow-hidden relative bg-slate-950 flex flex-col justify-between aspect-video min-h-[280px]">
        {/* Loading Overlay */}
        {loading && (
          <Box className="absolute inset-0 flex flex-col gap-3 justify-center items-center bg-slate-950/80 z-30 pointer-events-none">
            <CircularProgress color="primary" size={36} />
            <Typography className="!text-xs !font-bold text-slate-300 font-sans tracking-wide">
              Initializing camera stream...
            </Typography>
          </Box>
        )}

        {/* Error States */}
        {error && !loading && (
          <Box className="absolute inset-0 p-6 flex flex-col justify-center items-center bg-slate-900/95 z-30 text-center">
            <VideocamOffIcon className="text-rose-500 w-12 h-12 mb-3" />
            <Typography variant="subtitle2" className="!text-white !font-bold font-sans mb-1.5">
              {permissionDenied
                ? 'Camera Access Denied'
                : noCamera
                ? 'No Camera Detected'
                : 'Camera Connection Failed'}
            </Typography>
            <Typography className="!text-xs text-slate-400 font-sans max-w-[280px] mb-4">
              {error}
            </Typography>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClose}
                className="!text-white !border-slate-700 !text-xs !py-1.5 !px-4 !rounded-xl"
              >
                Close
              </Button>
              {!noCamera && (
                <Button
                  variant="contained"
                  onClick={handleRetry}
                  className="!bg-primary !text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
                >
                  Retry Access
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Timeout Error */}
        {timeoutReached && !loading && (
          <Box className="absolute inset-0 p-6 flex flex-col justify-center items-center bg-slate-900/95 z-30 text-center">
            <RefreshIcon className="text-amber-500 w-12 h-12 mb-3 animate-spin duration-3000" />
            <Typography variant="subtitle2" className="!text-white !font-bold font-sans mb-1.5">
              Scanning Timeout
            </Typography>
            <Typography className="!text-xs text-slate-400 font-sans max-w-[300px] mb-4">
              No barcode detected within 30 seconds. Please try again or type it manually.
            </Typography>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClose}
                className="!text-white !border-slate-700 !text-xs !py-1.5 !px-4 !rounded-xl"
              >
                Enter Manually
              </Button>
              <Button
                variant="contained"
                onClick={handleRetry}
                className="!bg-primary !text-white !text-xs !py-1.5 !px-4 !rounded-xl !font-bold"
              >
                Retry Scan
              </Button>
            </Box>
          </Box>
        )}

        {/* Live Camera Feed */}
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          playsInline
          muted
          autoPlay
        />

        {/* Laser Overlay Box */}
        {isScanning && !loading && <BarcodeScannerOverlay />}
      </DialogContent>

      <DialogActions className="!p-3 !flex !justify-between !items-center !bg-slate-50 border-t border-slate-100">
        {/* Device Camera Selector */}
        {cameraDevices.length > 1 && isScanning ? (
          <FormControl size="small" className="min-w-[160px] !m-0">
            <InputLabel id="camera-select-label" className="!text-xs !font-bold !font-sans">Camera</InputLabel>
            <Select
              labelId="camera-select-label"
              value={activeDeviceId || ''}
              label="Camera"
              onChange={(e) => changeCamera(e.target.value)}
              className="!text-xs !font-bold !font-sans !bg-white !rounded-xl"
              classes={{ select: '!py-1.5 !px-3' }}
            >
              {cameraDevices.map((device, index) => (
                <MenuItem key={device.deviceId} value={device.deviceId} className="!text-xs !font-sans">
                  {device.label || `Camera ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography className="!text-xs text-slate-500 font-sans">
            Align barcode inside the scan frame
          </Typography>
        )}

        <Button
          variant="text"
          onClick={handleClose}
          className="!text-slate-600 !text-xs !font-bold !py-1.5 !px-4 hover:bg-slate-100 !rounded-xl"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScannerModal;
