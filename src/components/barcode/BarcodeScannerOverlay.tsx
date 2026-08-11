import React from 'react';

export const BarcodeScannerOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Semi-transparent dark overlay around the focus frame */}
      <div className="absolute inset-0 bg-slate-900/50" />

      {/* Focus Box */}
      <div className="relative w-80 h-48 border-2 border-white/80 rounded-2xl overflow-hidden z-20 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        {/* Laser Line */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_#ef4444]"
          style={{
            animation: 'laser-sweep 2s ease-in-out infinite',
          }}
        />

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-sm" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-sm" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-sm" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-sm" />
      </div>

      <style>{`
        @keyframes laser-sweep {
          0% { top: 8%; }
          50% { top: 92%; }
          100% { top: 8%; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScannerOverlay;
