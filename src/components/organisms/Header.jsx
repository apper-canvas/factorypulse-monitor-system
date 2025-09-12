import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";
import Production from "@/components/pages/Production";
import Dashboard from "@/components/pages/Dashboard";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, lastUpdated }) => {
  const [showRefreshTooltip, setShowRefreshTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
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

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="hover:bg-slate-100"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <ApperIcon name="ChevronDown" className="w-4 h-4" />
              </div>
            </Button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
              >
                <div className="p-4 border-b border-slate-200">
                  <p className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-secondary">{user?.emailAddress}</p>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-error hover:bg-red-50"
                    icon="LogOut"
                  >
                    Logout
                  </Button>
                </div>
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
