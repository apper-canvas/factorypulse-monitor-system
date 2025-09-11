import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

const ActivityItem = ({ activity, className }) => {
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "production_start":
        return "Play";
      case "production_complete":
        return "CheckCircle";
      case "machine_maintenance":
        return "Wrench";
      case "quality_check":
        return "Shield";
      case "material_received":
        return "Package";
      case "order_shipped":
        return "Truck";
      default:
        return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type.toLowerCase()) {
      case "production_start":
        return "text-blue-600";
      case "production_complete":
        return "text-success";
      case "machine_maintenance":
        return "text-warning";
      case "quality_check":
        return "text-purple-600";
      case "material_received":
        return "text-indigo-600";
      case "order_shipped":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-start space-x-3 py-3", className)}
    >
      <div className={cn(
        "flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-slate-100",
        getActivityColor(activity.type).replace("text-", "bg-").replace("-600", "-100")
      )}>
        <ApperIcon
          name={getActivityIcon(activity.type)}
          className={cn("w-3 h-3", getActivityColor(activity.type))}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900">
          {activity.description}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-secondary">
            {activity.user}
          </span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs text-secondary">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityItem;