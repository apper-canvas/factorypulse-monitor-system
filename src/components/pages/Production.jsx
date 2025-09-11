import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Production = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Management</h1>
          <p className="text-secondary mt-1">
            Manage work orders, job scheduling, and production workflows
          </p>
        </div>
        <Button icon="Plus" variant="primary" size="lg">
          New Work Order
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
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="Cog" className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Production Module Coming Soon
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Advanced production planning, work order management, and job scheduling features are currently in development.
            </p>
            <div className="space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Clock" className="w-4 h-4 text-primary" />
                <span>Job Scheduling & Timeline Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="FileText" className="w-4 h-4 text-primary" />
                <span>Work Order Creation & Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Users" className="w-4 h-4 text-primary" />
                <span>Resource & Personnel Assignment</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="BarChart" className="w-4 h-4 text-primary" />
                <span>Production Capacity Planning</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Production;