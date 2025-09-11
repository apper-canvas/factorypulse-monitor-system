import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

const AlertItem = ({ alert, onAcknowledge, className }) => {
  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "AlertTriangle";
      case "high":
        return "AlertCircle";
      case "medium":
        return "Info";
      case "low":
        return "Bell";
      default:
        return "Info";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200",
        alert.acknowledged 
          ? "bg-slate-50 border-slate-200" 
          : "bg-white border-orange-200 shadow-sm hover:shadow-md",
        className
      )}
    >
      <div className={cn(
        "flex-shrink-0 mt-0.5",
        !alert.acknowledged && "animate-pulse"
      )}>
        <ApperIcon
          name={getPriorityIcon(alert.priority)}
          className={cn(
            "w-4 h-4",
            alert.priority.toLowerCase() === "critical" && "text-error",
            alert.priority.toLowerCase() === "high" && "text-warning",
            alert.priority.toLowerCase() === "medium" && "text-info",
            alert.priority.toLowerCase() === "low" && "text-secondary",
            alert.acknowledged && "text-slate-400"
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge 
                variant={alert.acknowledged ? "default" : getPriorityVariant(alert.priority)} 
                size="sm"
              >
                {alert.priority}
              </Badge>
              <span className="text-xs text-secondary">
                {alert.source}
              </span>
            </div>
            <p className={cn(
              "text-sm",
              alert.acknowledged ? "text-slate-500" : "text-slate-900"
            )}>
              {alert.message}
            </p>
            <p className="text-xs text-secondary mt-1">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </p>
          </div>
          
          {!alert.acknowledged && onAcknowledge && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAcknowledge(alert.Id)}
              className="flex-shrink-0 ml-2"
            >
              <ApperIcon name="Check" className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AlertItem;