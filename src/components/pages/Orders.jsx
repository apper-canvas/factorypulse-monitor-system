import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Orders = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-secondary mt-1">
            Track customer orders, manage fulfillment, and monitor delivery status
          </p>
        </div>
        <Button icon="Plus" variant="primary" size="lg">
          New Order
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
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-8 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <ApperIcon name="ShoppingCart" className="w-12 h-12 text-warning" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Order Module Coming Soon
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Complete order management system with customer tracking, fulfillment workflows, and delivery monitoring.
            </p>
            <div className="space-y-3 text-left text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Users" className="w-4 h-4 text-warning" />
                <span>Customer Order Processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="CheckSquare" className="w-4 h-4 text-warning" />
                <span>Order Fulfillment Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="Truck" className="w-4 h-4 text-warning" />
                <span>Shipping & Delivery Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <ApperIcon name="CreditCard" className="w-4 h-4 text-warning" />
                <span>Payment Status & Invoicing</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Orders;