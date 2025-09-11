import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const GaugeChart = ({ 
  value = 0, 
  max = 100, 
  title, 
  unit = "%", 
  size = "md",
  variant = "primary",
  className 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const angle = (percentage / 100) * 180 - 90; // Convert to angle for semi-circle
  
  const variants = {
    primary: {
      bg: "stroke-slate-200",
      fill: "stroke-primary"
    },
    success: {
      bg: "stroke-slate-200", 
      fill: "stroke-success"
    },
    warning: {
      bg: "stroke-slate-200",
      fill: "stroke-warning"
    },
    error: {
      bg: "stroke-slate-200",
      fill: "stroke-error"
    }
  };

  const sizes = {
    sm: { width: 120, height: 80, strokeWidth: 8, textSize: "text-lg" },
    md: { width: 160, height: 100, strokeWidth: 10, textSize: "text-2xl" },
    lg: { width: 200, height: 120, strokeWidth: 12, textSize: "text-3xl" }
  };

  const sizeConfig = sizes[size];
  const radius = (sizeConfig.width - sizeConfig.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={sizeConfig.width}
          height={sizeConfig.height}
          viewBox={`0 0 ${sizeConfig.width} ${sizeConfig.height}`}
          className="transform -rotate-90"
        >
          {/* Background arc */}
          <path
            d={`M ${sizeConfig.strokeWidth/2} ${sizeConfig.height - sizeConfig.strokeWidth/2} A ${radius} ${radius} 0 0 1 ${sizeConfig.width - sizeConfig.strokeWidth/2} ${sizeConfig.height - sizeConfig.strokeWidth/2}`}
            fill="none"
            strokeWidth={sizeConfig.strokeWidth}
            className={variants[variant].bg}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d={`M ${sizeConfig.strokeWidth/2} ${sizeConfig.height - sizeConfig.strokeWidth/2} A ${radius} ${radius} 0 0 1 ${sizeConfig.width - sizeConfig.strokeWidth/2} ${sizeConfig.height - sizeConfig.strokeWidth/2}`}
            fill="none"
            strokeWidth={sizeConfig.strokeWidth}
            className={variants[variant].fill}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className={cn("font-bold text-slate-900", sizeConfig.textSize)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-secondary mt-1">{unit}</span>
        </div>
      </div>
      
      {title && (
        <p className="text-sm font-medium text-slate-700 mt-2 text-center">
          {title}
        </p>
      )}
    </div>
  );
};

export default GaugeChart;