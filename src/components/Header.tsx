import lyzrLogo from "@/assets/lyzr-logo-actual.png";
import novaIcon from "@/assets/nova-logo-icon.png";
import novaText from "@/assets/nova-logo-text.png";

export function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Lyzr Logo */}
            <div className="flex items-center space-x-2">
              <img src={lyzrLogo} alt="Lyzr" className="w-8 h-8" />
              <span className="font-semibold text-lg text-foreground">Lyzr</span>
            </div>
            
            {/* Connector */}
            <div className="text-muted-foreground text-lg font-light">×</div>
            
            {/* Amazon Nova Logo */}
            <div className="flex items-center space-x-2">
              <img src={novaIcon} alt="Amazon Nova" className="w-8 h-8" />
              <img src={novaText} alt="Amazon Nova" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}