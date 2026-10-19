import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    accent: 'bg-success',
    iconColor: 'text-success',
    surface: 'border-success-border',
  },
  error: {
    icon: XCircle,
    accent: 'bg-danger',
    iconColor: 'text-danger',
    surface: 'border-danger-border',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'bg-warning',
    iconColor: 'text-warning',
    surface: 'border-warning-border',
  },
  info: {
    icon: Info,
    accent: 'bg-primary',
    iconColor: 'text-primary',
    surface: 'border-primary/40',
  },
};
