import { cn } from "@/utils/cn";

const StatusDot = ({ status, size = "md", animated = true, className }) => {
  const statusColors = {
    online: "bg-success",
    running: "bg-success",
    active: "bg-success",
    offline: "bg-slate-400",
    stopped: "bg-slate-400",
    inactive: "bg-slate-400",
    warning: "bg-warning",
    maintenance: "bg-warning",
    error: "bg-error",
    down: "bg-error",
    critical: "bg-error"
  };

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const color = statusColors[status.toLowerCase()] || statusColors.offline;

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0",
        sizes[size],
        color,
        animated && (status === "online" || status === "running" || status === "active") && "animate-pulse-dot",
        className
      )}
    />
  );
};

export default StatusDot;