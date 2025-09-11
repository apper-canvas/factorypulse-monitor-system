import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import GaugeChart from "@/components/molecules/GaugeChart";
import ActivityItem from "@/components/molecules/ActivityItem";
import MetricCard from "@/components/molecules/MetricCard";
import ProductionLineCard from "@/components/molecules/ProductionLineCard";
import AlertItem from "@/components/molecules/AlertItem";
import Card from "@/components/atoms/Card";
import Header from "@/components/organisms/Header";
import Production from "@/components/pages/Production";
import Orders from "@/components/pages/Orders";
import * as productionService from "@/services/api/productionService";
import * as qualityService from "@/services/api/qualityService";
import * as alertService from "@/services/api/alertService";
import * as machineService from "@/services/api/machineService";
import * as activityService from "@/services/api/activityService";
import * as workOrderService from "@/services/api/workOrderService";

const Dashboard = () => {
const Dashboard = () => {
  const [productionLines, setProductionLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [
        productionData,
        machineData,
        qualityData,
        alertData,
        activityData
      ] = await Promise.all([
        productionService.getAll(),
        machineService.getAll(),
        qualityService.getAll(),
        alertService.getAll(),
        activityService.getAll()
      ]);

      setProductionLines(productionData);
      setMachines(machineData);
      setQualityMetrics(qualityData);
      setAlerts(alertData);
      setActivities(activityData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await alertService.update(alertId, { acknowledged: true });
      setAlerts(prev => prev.map(alert => 
        alert.Id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      toast.success("Alert acknowledged");
    } catch (err) {
      toast.error("Failed to acknowledge alert");
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate metrics
  const totalProduction = productionLines.reduce((sum, line) => sum + line.actualOutput, 0);
  const totalTarget = productionLines.reduce((sum, line) => sum + line.targetOutput, 0);
  const averageEfficiency = productionLines.length > 0 
    ? productionLines.reduce((sum, line) => sum + line.efficiency, 0) / productionLines.length 
    : 0;
  const activeLines = productionLines.filter(line => line.status === "Running").length;
  const averageUtilization = machines.length > 0
    ? machines.reduce((sum, machine) => sum + machine.utilization, 0) / machines.length
    : 0;
  const totalDefectRate = qualityMetrics.length > 0
    ? qualityMetrics.reduce((sum, metric) => sum + metric.defectRate, 0) / qualityMetrics.length
    : 0;
  
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Production"
          value={totalProduction.toLocaleString()}
          unit="units"
          trend="up"
          trendValue="12%"
          icon="TrendingUp"
          variant="success"
        />
        <MetricCard
          title="Active Production Lines"
          value={activeLines}
          unit={`/ ${productionLines.length}`}
          trend="neutral"
          icon="Factory"
          variant="primary"
        />
        <MetricCard
          title="Overall Efficiency"
          value={`${averageEfficiency.toFixed(1)}%`}
          trend={averageEfficiency >= 85 ? "up" : averageEfficiency >= 75 ? "neutral" : "down"}
          trendValue={averageEfficiency >= 85 ? "Good" : averageEfficiency >= 75 ? "Fair" : "Low"}
          icon="Gauge"
          variant={averageEfficiency >= 85 ? "success" : averageEfficiency >= 75 ? "warning" : "error"}
        />
        <MetricCard
          title="Quality Rate"
          value={`${(100 - totalDefectRate).toFixed(1)}%`}
          trend={totalDefectRate <= 2 ? "up" : totalDefectRate <= 5 ? "neutral" : "down"}
          trendValue={`${totalDefectRate.toFixed(1)}% defects`}
          icon="Shield"
          variant={totalDefectRate <= 2 ? "success" : totalDefectRate <= 5 ? "warning" : "error"}
        />
      </div>

<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Production Lines */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Production Lines Status</h2>
            {productionLines.length === 0 ? (
              <Empty
                title="No Production Lines"
                message="No production lines are currently configured."
                icon="Factory"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {productionLines.map((line) => (
                  <ProductionLineCard key={line.Id} line={line} />
                ))}
              </div>
            )}
          </div>

          {/* Work Order Summary */}
          <div>
            <WorkOrderSummary />
          </div>
        </div>

        {/* Machine Utilization */}
        <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Machine Utilization</h2>
            {machines.length === 0 ? (
              <Empty
                title="No Machines"
                message="No machines are currently being monitored."
                icon="Cog"
              />
            ) : (
              <Card>
                <Card.Content className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {machines.map((machine) => (
                      <div key={machine.Id} className="text-center">
                        <GaugeChart
                          value={machine.utilization}
                          max={100}
                          title={machine.name}
                          variant={machine.utilization >= 80 ? "success" : machine.utilization >= 60 ? "primary" : "warning"}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </Card.Content>
</Card>
            )}
        </div>
      </div>
      
      {/* Sidebar - Alerts & Activity */}
      <div className="space-y-6">
        {/* Alerts */}
        <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Priority Alerts
              </h2>
              {unacknowledgedAlerts.length > 0 && (
                <span className="px-2 py-1 bg-error text-white text-xs font-medium rounded-full">
                  {unacknowledgedAlerts.length} active
                </span>
              )}
            </div>
            
            <Card className="max-h-96 overflow-y-auto">
              <Card.Content className="p-4">
                {unacknowledgedAlerts.length === 0 ? (
                  <Empty
                    title="No Active Alerts"
                    message="All systems are running normally."
                    icon="CheckCircle"
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-3">
                    {unacknowledgedAlerts.map((alert) => (
                      <AlertItem
                        key={alert.Id}
                        alert={alert}
                        onAcknowledge={handleAcknowledgeAlert}
                      />
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <Card className="max-h-80 overflow-y-auto">
              <Card.Content className="p-4">
                {recentActivities.length === 0 ? (
                  <Empty
                    title="No Recent Activity"
                    message="No recent production activities to display."
                    icon="Activity"
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-1">
                    {recentActivities.map((activity) => (
                      <ActivityItem key={activity.Id} activity={activity} />
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
</div>
      </div>

      {/* Production Target Progress */}
      <Card>
        <Card.Header>
          <Card.Title>Daily Production Progress</Card.Title>
          <Card.Description>
            Current progress towards daily production targets
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Progress</span>
              <span className="text-secondary">
                {totalProduction.toLocaleString()} / {totalTarget.toLocaleString()} units
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalProduction / totalTarget) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>0%</span>
              <span className="font-medium">
                {((totalProduction / totalTarget) * 100).toFixed(1)}% Complete
              </span>
              <span>100%</span>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Work Order Summary Component
const WorkOrderSummary = () => {
  const [workOrderMetrics, setWorkOrderMetrics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkOrderMetrics();
  }, []);

  const loadWorkOrderMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await workOrderService.getMetrics();
      setWorkOrderMetrics(metrics);
    } catch (err) {
      console.error('Failed to load work order metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content className="p-6 flex items-center justify-center">
          <Loading />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Work Order Status</Card.Title>
        <Card.Description>
          Current work order progress and completion metrics
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{workOrderMetrics.total}</div>
            <div className="text-xs text-secondary">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{workOrderMetrics.inProgress}</div>
            <div className="text-xs text-secondary">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{workOrderMetrics.completed}</div>
            <div className="text-xs text-secondary">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{workOrderMetrics.overdue}</div>
            <div className="text-xs text-secondary">Overdue</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Completion Rate</span>
            <span className="text-secondary">{workOrderMetrics.completionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-success to-success-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${workOrderMetrics.completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
export default Dashboard;