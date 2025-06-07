import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function EmailCollection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been added to the NexusLinkAI mailing list.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Stay Updated with NexusLinkAI
        </CardTitle>
        <CardDescription className="text-base">
          Get notified about network updates, new features, and research breakthroughs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background/50 border-blue-500/30 focus:border-blue-500"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                "Join Waitlist"
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No spam</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Monthly updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Early access</span>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Join the community building the future of decentralized AI
          </div>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">2,500+</div>
              <div className="text-xs text-muted-foreground">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">1,089</div>
              <div className="text-xs text-muted-foreground">Active Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">847.3 TH/s</div>
              <div className="text-xs text-muted-foreground">Network Power</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}