import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export function Header() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("finwise_auth_token");
    setLocation("/auth");
  };

  return (
    <header className="mb-8 w-full">
      <div className="glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">FinWise</h1>
            <p className="text-sm text-muted-foreground font-medium">Smart personal finance</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
