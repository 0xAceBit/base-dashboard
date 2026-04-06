import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeftRight, History, Settings, Hexagon, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ConnectWallet from "@/components/ConnectWallet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Swap", icon: ArrowLeftRight, path: "/swap" },
  { label: "History", icon: History, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 mb-10">
        <Hexagon className="w-7 h-7 text-primary" strokeWidth={1.5} />
        <span className="text-lg font-semibold text-foreground tracking-tight">Base Layer</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, ease: [0.23, 1, 0.32, 1] }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate(item.path);
                onNavigate?.();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <ConnectWallet />
      </div>
    </>
  );
};

export const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-2.5">
        <Hexagon className="w-6 h-6 text-primary" strokeWidth={1.5} />
        <span className="text-base font-semibold text-foreground tracking-tight">Base Layer</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] bg-sidebar p-6 flex flex-col">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
};

const DashboardSidebar = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-sidebar border-r border-sidebar-border flex-col p-6 z-10 hidden md:flex">
      <SidebarContent />
    </aside>
  );
};

export default DashboardSidebar;
