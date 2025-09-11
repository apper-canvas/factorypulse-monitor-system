import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  unit = "", 
  trend, 
  trendValue, 
  icon, 
  variant = "default",
  className 
}) => {
  const variants = {
    default: "text-slate-600",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    primary: "text-primary"
  };

  const trendColors = {
    up: "text-success bg-success/10",
    down: "text-error bg-error/10",
    neutral: "text-slate-500 bg-slate-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className={className}>
        <Card.Content className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary truncate">
              {title}
            </h3>
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br",
              variant === "success" && "from-success/10 to-success/20",
              variant === "warning" && "from-warning/10 to-warning/20",
              variant === "error" && "from-error/10 to-error/20",
              variant === "primary" && "from-primary/10 to-primary/20",
              variant === "default" && "from-slate/10 to-slate/20"
            )}>
              <ApperIcon 
                name={icon} 
                className={cn("w-5 h-5", variants[variant])}
              />
            </div>
          </div>
          
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-slate-900">
                {value}
              </span>
              {unit && (
                <span className="text-sm font-medium text-secondary">
                  {unit}
                </span>
              )}
            </div>
            
            {trend && trendValue && (
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                trendColors[trend]
              )}>
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
                  className="w-3 h-3" 
                />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default MetricCard;