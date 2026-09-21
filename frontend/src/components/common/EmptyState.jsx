import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}