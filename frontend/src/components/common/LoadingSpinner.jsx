import React from 'react';

export default function LoadingSpinner({ message = 'Loading listings...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}