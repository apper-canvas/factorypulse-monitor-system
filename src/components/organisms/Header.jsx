import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { formatDistanceToNow } from "date-fns";

const Header = ({ onMenuClick, lastUpdated }) => {
  const [showRefreshTooltip, setShowRefreshTooltip] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="md"
            onClick={onMenuClick}
            className="lg:hidden"
            icon="Menu"
          />
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-slate-900">
              Production Dashboard
            </h1>
            <p className="text-sm text-secondary">
              Real-time manufacturing metrics and status
            </p>
          </div>
        </div>

        {/* Right side - Status + Actions */}
        <div className="flex items-center space-x-4">
          {/* Last Updated */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-secondary">
            <ApperIcon name="Clock" className="w-4 h-4" />
            <span>
              Updated {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : "just now"}
            </span>
          </div>

          {/* Refresh Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="md"
              onClick={handleRefresh}
              icon="RefreshCw"
              onMouseEnter={() => setShowRefreshTooltip(true)}
              onMouseLeave={() => setShowRefreshTooltip(false)}
              className="hover:bg-slate-100"
            />
            
            {showRefreshTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-10"
              >
                Refresh dashboard
              </motion.div>
            )}
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-success/10 to-success/20 border border-success/20 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-dot" />
            <span className="text-xs font-medium text-success">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;