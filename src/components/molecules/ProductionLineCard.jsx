import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import StatusDot from "@/components/molecules/StatusDot";
import { cn } from "@/utils/cn";

const ProductionLineCard = ({ line, className }) => {
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "running":
      case "active":
        return "success";
      case "maintenance":
      case "warning":
        return "warning";
      case "stopped":
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const progressPercentage = line.targetOutput > 0 
    ? (line.actualOutput / line.targetOutput) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card hover>
        <Card.Content className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <StatusDot status={line.status} size="lg" />
              <div>
                <h3 className="font-semibold text-slate-900">{line.name}</h3>
                <p className="text-sm text-secondary">{line.currentJob}</p>
              </div>
            </div>
            <Badge variant={getStatusVariant(line.status)} size="md">
              {line.status}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Production Progress
                </span>
                <span className="text-sm text-secondary">
                  {line.actualOutput}/{line.targetOutput}
                </span>
              </div>
              <ProgressBar
                value={line.actualOutput}
                max={line.targetOutput}
                variant={progressPercentage >= 90 ? "success" : progressPercentage >= 70 ? "primary" : "warning"}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {line.efficiency}%
                </p>
                <p className="text-xs text-secondary">Efficiency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {((line.actualOutput / line.targetOutput) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-secondary">Target</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default ProductionLineCard;