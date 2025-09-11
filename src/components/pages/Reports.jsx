import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-secondary mt-1">
            Production analytics, performance trends, and business intelligence
          </p>
        </div>
        <Button icon="Download" variant="primary" size="lg">
          Export Report
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
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="BarChart3" className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Reports Module Coming Soon
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Advanced analytics dashboard with customizable reports, trend analysis, and business intelligence insights.
            </p>
            <div className="space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <ApperIcon name="TrendingUp" className="w-4 h-4 text-purple-600" />
                <span>Production Performance Trends</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="PieChart" className="w-4 h-4 text-purple-600" />
                <span>Efficiency & Quality Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Calendar" className="w-4 h-4 text-purple-600" />
                <span>Historical Data & Comparisons</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="FileSpreadsheet" className="w-4 h-4 text-purple-600" />
                <span>Custom Report Generation</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;