import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Inventory = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-secondary mt-1">
            Track raw materials, finished goods, and manage stock levels
          </p>
        </div>
        <Button icon="Plus" variant="primary" size="lg">
          Add Stock Item
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
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="Package" className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Inventory Module Coming Soon
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Comprehensive inventory tracking, stock management, and automated reorder features are being developed.
            </p>
            <div className="space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Boxes" className="w-4 h-4 text-success" />
                <span>Raw Materials & Stock Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="TrendingDown" className="w-4 h-4 text-success" />
                <span>Automated Reorder Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="MapPin" className="w-4 h-4 text-success" />
                <span>Warehouse Location Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="AlertTriangle" className="w-4 h-4 text-success" />
                <span>Low Stock Alerts & Notifications</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Inventory;