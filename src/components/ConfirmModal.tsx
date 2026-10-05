import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Konfirmasi Tindakan",
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 text-center transform transition-all animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            isDestructive
              ? "bg-rose-50 text-rose-600 border border-rose-100 ring-4 ring-rose-50/50"
              : "bg-amber-50 text-amber-600 border border-amber-100 ring-4 ring-amber-50/50"
          }`}
        >
          {isDestructive ? (
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6 px-1">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-full border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-white shadow-md transition ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
