import React from 'react';
import { PlatformStyle } from '../types';

interface DeviceFrameWrapperProps {
  deviceFrame: 'none' | 'iphone' | 'pixel';
  platform: PlatformStyle;
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({
  deviceFrame,
  platform,
  children,
}) => {
  if (deviceFrame === 'none') {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        {children}
      </div>
    );
  }

  const isIPhone = deviceFrame === 'iphone';

  return (
    <div className="min-h-screen bg-slate-900/90 dark:bg-black py-6 px-2 sm:px-6 flex flex-col items-center justify-center">
      {/* Frame Container */}
      <div
        className={`w-full max-w-[420px] h-[860px] max-h-[94vh] bg-black rounded-[52px] p-3 shadow-2xl relative border-4 flex flex-col ${
          isIPhone ? 'border-slate-700' : 'border-slate-800'
        }`}
        style={{
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Dynamic Island (iPhone) or Punch-hole camera (Pixel) */}
        {isIPhone ? (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>
        ) : (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black z-50 ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>
        )}

        {/* Screen Bezel */}
        <div className="w-full h-full rounded-[42px] overflow-hidden bg-white dark:bg-slate-950 flex flex-col relative">
          <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          {isIPhone && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 bg-slate-400 dark:bg-slate-600 rounded-full z-50 pointer-events-none opacity-60" />
          )}
        </div>
      </div>
    </div>
  );
};
