import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ type = 'error', message, onClose }) {
    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-borderLine transition-all animate-fade-in">
        {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />
        ) : (
            <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />
        )}
        <span className="text-sm font-medium text-textMain">{message}</span>
        <button 
            onClick={onClose} 
            className="ml-2 text-textMuted hover:text-textMain transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
        </div>
    );
}