import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose, className }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: "LayoutDashboard"
    },
    {
      name: "Production",
      href: "/production", 
      icon: "Cog"
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: "Package"
    },
    {
      name: "Orders",
      href: "/orders",
      icon: "ShoppingCart"
    },
    {
      name: "Reports",
      href: "/reports",
      icon: "BarChart3"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: "Settings"
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Factory" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">FactoryPulse</h1>
            <p className="text-xs text-secondary">Manufacturing Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-primary/10 to-primary-600/10 text-primary border border-primary/20" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ApperIcon 
                name={item.icon} 
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-700",
                  "group-hover:scale-110"
                )}
              />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full ml-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center space-x-2 px-3 py-2">
          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-dot" />
          </div>
          <span className="text-xs font-medium text-slate-600">System Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-slate-200",
        className
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile Sidebar */}
          <motion.div
            className="relative flex flex-col w-64 bg-white shadow-xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>

            <SidebarContent />
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;