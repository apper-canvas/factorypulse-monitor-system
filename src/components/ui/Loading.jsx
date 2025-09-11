import { motion } from "framer-motion";

const Loading = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
        <div className="h-6 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-md"></div>
      </div>

      {/* Metrics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
            </div>
            <div className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2"></div>
            <div className="h-3 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
          </motion.div>
        ))}
      </div>

      {/* Production lines skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              <div className="h-6 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              <div className="h-2 w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
                <div className="h-3 w-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity feed skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="h-6 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
              <div className="h-4 flex-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              <div className="h-3 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;