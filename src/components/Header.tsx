

export function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Lyzr Logo */}
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/7c1e3ec3-1bdb-44b3-b0e7-84fcac8fd4bc.png" alt="Lyzr" className="h-8 w-auto" />
            </div>
            
            {/* Connector */}
            <div className="text-muted-foreground text-lg font-light">×</div>
            
            {/* Amazon Nova Logo */}
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/a1969e4b-8da1-4949-950a-9e6e0169f7d6.png" alt="Amazon Nova" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}