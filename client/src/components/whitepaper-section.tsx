import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailCollection } from "@/components/email-collection";

export function WhitepaperSection() {
  return (
    <div className="bg-card rounded-xl p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          NexusLinkAI Technical Documentation
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive whitepaper detailing the Proof of Temporal Commitment consensus mechanism 
          and decentralized AI/ML training architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <i className="fas fa-file-alt text-blue-400 mr-3"></i>
              Whitepaper v2.1
            </CardTitle>
            <CardDescription>
              Complete technical specification of NexusLinkAI's decentralized training protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• Proof of Temporal Commitment Algorithm</div>
              <div>• 8-Node Network Architecture</div>
              <div>• 38-Step Training Process</div>
              <div>• Economic Model & Tokenomics</div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-download mr-2"></i>Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <i className="fas fa-code text-green-400 mr-3"></i>
              Implementation Guide
            </CardTitle>
            <CardDescription>
              Developer documentation for integrating with NexusLinkAI network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• API Reference</div>
              <div>• SDK Documentation</div>
              <div>• Node Setup Instructions</div>
              <div>• Smart Contract ABI</div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <i className="fas fa-external-link-alt mr-2"></i>View Docs
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <i className="fas fa-chart-line text-purple-400 mr-3"></i>
              Research Papers
            </CardTitle>
            <CardDescription>
              Academic publications and research findings on PoTC consensus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• Temporal Commitment Theory</div>
              <div>• Decentralized ML Optimization</div>
              <div>• Network Security Analysis</div>
              <div>• Performance Benchmarks</div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <i className="fas fa-graduation-cap mr-2"></i>Research Hub
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/20">
          <div>
            <h3 className="text-xl font-semibold mb-2">Join the NexusLinkAI Community</h3>
            <p className="text-muted-foreground mb-4">
              Connect with developers, researchers, and contributors building the future of decentralized AI.
            </p>
            <div className="flex space-x-4 mb-4">
              <Button variant="outline" className="border-blue-500/50 hover:bg-blue-500/10">
                <i className="fab fa-discord mr-2"></i>Discord
              </Button>
              <Button variant="outline" className="border-green-500/50 hover:bg-green-500/10">
                <i className="fab fa-github mr-2"></i>GitHub
              </Button>
            </div>
            <div className="text-right md:text-left">
              <div className="text-2xl font-bold text-blue-400">2,500+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
          </div>
        </div>
        
        <EmailCollection />
      </div>
    </div>
  );
}