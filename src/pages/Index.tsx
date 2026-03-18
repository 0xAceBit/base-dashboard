import DashboardSidebar from "@/components/DashboardSidebar";
import BalanceCard from "@/components/BalanceCard";
import ActionGrid from "@/components/ActionGrid";
import ActivityFeed from "@/components/ActivityFeed";
import NetworkStatus from "@/components/NetworkStatus";

const Index = () => {
  return (
    <div className="min-h-svh bg-background flex">
      <DashboardSidebar />
      
      {/* Main Content */}
      <main className="ml-[240px] flex-1 flex">
        <div className="flex-1 max-w-[800px] mx-auto px-8 py-12">
          <div className="mb-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Your home on Base.
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fast, cheap, and built for onchain.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <BalanceCard />
            <ActionGrid />
            <ActivityFeed />
          </div>
        </div>

        {/* Contextual Panel */}
        <aside className="w-[320px] border-l border-border p-6 hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <NetworkStatus />
            
            <div className="p-5 bg-secondary border border-border rounded-xl">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions</span>
                  <span className="text-sm font-mono-nums text-foreground">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Gas Spent</span>
                  <span className="text-sm font-mono-nums text-foreground">$2.84</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">First Tx</span>
                  <span className="text-sm text-muted-foreground">Mar 2024</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;
