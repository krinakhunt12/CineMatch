import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
  </div>
);