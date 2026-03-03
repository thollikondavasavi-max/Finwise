import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    if (!email || !password || (!isLogin && !name)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    // Simulate network request
    setTimeout(() => {
      localStorage.setItem("finwise_auth_token", "mock_token_" + Date.now());
      localStorage.setItem("finwise_user", JSON.stringify({ email, name: isLogin ? "User" : name }));
      
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: "Successfully logged in.",
      });
      
      setLocation("/");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] mix-blend-multiply" />
      
      <div className="w-full max-w-md glass-card p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">FinWise</h1>
          <p className="text-muted-foreground">Smart personal finance tracker</p>
        </div>

        <div className="flex p-1 bg-muted/50 rounded-xl mb-8">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-white/50 focus:bg-white transition-colors"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white/50 focus:bg-white transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/50 focus:bg-white transition-colors"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all mt-6 active:scale-[0.98]">
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
