import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center font-medium transition-all duration-200";
  
  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    primary: "bg-gradient-to-r from-primary/10 to-primary-600/10 text-primary border border-primary/20",
    success: "bg-gradient-to-r from-success/10 to-green-600/10 text-success border border-success/20",
    warning: "bg-gradient-to-r from-warning/10 to-orange-600/10 text-warning border border-warning/20",
    error: "bg-gradient-to-r from-error/10 to-red-600/10 text-error border border-error/20",
    info: "bg-gradient-to-r from-info/10 to-blue-600/10 text-info border border-info/20"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-full",
    md: "px-2.5 py-1 text-xs rounded-full",
    lg: "px-3 py-1.5 text-sm rounded-full"
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;