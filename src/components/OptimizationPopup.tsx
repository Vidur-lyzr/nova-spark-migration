import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface OptimizationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  optimizations: string[];
}

export function OptimizationPopup({ isOpen, onClose, optimizations }: OptimizationPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            Prompt Optimizations for Amazon Nova
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {optimizations.length === 0 ? (
            <p className="text-muted-foreground">No optimizations were applied.</p>
          ) : (
            optimizations.map((optimization, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass-card">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{optimization}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-center pt-4">
          <Badge variant="outline" className="text-accent border-accent/30">
            {optimizations.length} optimizations applied for Amazon Nova
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}