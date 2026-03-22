import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeftRight, History, Settings, Hexagon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ConnectWallet from "@/components/ConnectWallet";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Swap", icon: ArrowLeftRight, path: "/swap" },
  { label: "History", icon: History, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-sidebar border-r border-sidebar-border flex flex-col p-6 z-10">
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
              onClick={() => navigate(item.path)}
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
    </aside>
  );
};

export default DashboardSidebar;
