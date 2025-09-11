import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available", 
  message = "There's nothing to display right now. Try adjusting your filters or check back later.", 
  action = null,
  icon = "Database",
  className = "" 
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-full p-8 mb-6">
        <ApperIcon 
          name={icon} 
          className="w-16 h-16 text-slate-400" 
        />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title}
      </h3>
      
      <p className="text-secondary text-base mb-8 max-w-md leading-relaxed">
        {message}
      </p>
      
      {action && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Empty;