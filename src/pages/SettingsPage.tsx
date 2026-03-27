import { motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Globe, Shield } from "lucide-react";

const SettingsPage = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-svh bg-background flex">
      <DashboardSidebar />
      <main className="mt-14 md:mt-0 md:ml-[240px] flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="max-w-[600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              Settings
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Manage your wallet and preferences.
            </p>

            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-foreground">Wallet</h3>
                </div>
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="text-sm font-mono-nums text-foreground">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network</span>
                      <span className="text-sm text-foreground">{chain?.name ?? "Unknown"}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => disconnect()}
                      className="w-full mt-2"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No wallet connected.</p>
                )}
              </div>

              {/* Network */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-foreground">Network</h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Chain</span>
                  <span className="text-sm text-foreground">Base Mainnet</span>
                </div>
              </div>

              {/* Security */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-foreground">Security</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This app never stores your private keys. All transactions are signed locally via your wallet.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
