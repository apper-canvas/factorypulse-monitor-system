import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-secondary mt-1">
            Configure company settings, machine parameters, and system preferences
          </p>
        </div>
        <Button icon="Save" variant="primary" size="lg">
          Save Changes
        </Button>
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md w-full text-center">
          <Card.Content className="p-12">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="Settings" className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Settings Module Coming Soon
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Comprehensive system configuration, machine setup, and company preference management tools.
            </p>
            <div className="space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Building" className="w-4 h-4 text-slate-600" />
                <span>Company Profile & Information</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Wrench" className="w-4 h-4 text-slate-600" />
                <span>Machine Configuration & Setup</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Bell" className="w-4 h-4 text-slate-600" />
                <span>Notification & Alert Settings</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Shield" className="w-4 h-4 text-slate-600" />
                <span>Security & Access Controls</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;