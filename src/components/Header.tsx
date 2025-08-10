import { Sparkles, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Lyzr Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">Lyzr</span>
            </div>
            
            {/* Connector */}
            <div className="text-muted-foreground text-lg font-light">×</div>
            
            {/* Amazon Nova Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">Amazon Nova</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            AI Agent Migration Tool
          </div>
        </div>
      </div>
    </header>
  );
}