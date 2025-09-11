import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import StatusDot from "@/components/molecules/StatusDot";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import * as workOrderService from "@/services/api/workOrderService";
import { cn } from "@/utils/cn";

const Production = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workOrderService.getAll();
      setWorkOrders(data);
      if (data.length > 0 && !selectedWorkOrder) {
        setSelectedWorkOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
      setError(err.message);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async (workOrderData) => {
    try {
      const newWorkOrder = await workOrderService.create(workOrderData);
      setWorkOrders(prev => [...prev, newWorkOrder]);
      setSelectedWorkOrder(newWorkOrder);
      setShowCreateModal(false);
      toast.success('Work order created successfully');
    } catch (err) {
      console.error('Failed to create work order:', err);
      toast.error('Failed to create work order');
    }
  };

  const handleStageUpdate = async (stageIndex, stageData) => {
    if (!selectedWorkOrder) return;
    
    try {
      const updatedWorkOrder = await workOrderService.updateStage(
        selectedWorkOrder.Id, 
        stageIndex, 
        stageData
      );
      
      // Update work orders list
      setWorkOrders(prev => prev.map(wo => 
        wo.Id === updatedWorkOrder.Id ? updatedWorkOrder : wo
      ));
      
      // Update selected work order
      setSelectedWorkOrder(updatedWorkOrder);
      
      toast.success(`Stage ${updatedWorkOrder.stages[stageIndex].name} updated`);
    } catch (err) {
      console.error('Failed to update stage:', err);
      toast.error('Failed to update stage');
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedWorkOrders = [...workOrders].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "primary";
      case "complete":
        return "success";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "text-primary";
      case "complete":
        return "text-success";
      case "overdue":
        return "text-error";
      default:
        return "text-secondary";
    }
  };

  const getMaterialStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return "text-success";
      case "low":
        return "text-warning";
      case "critical":
        return "text-error";
      default:
        return "text-secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadWorkOrders} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Management</h1>
          <p className="text-secondary mt-1">
            Manage work orders, job scheduling, and production workflows
          </p>
        </div>
        <Button 
          icon="Plus" 
          variant="primary" 
          size="lg"
          onClick={() => setShowCreateModal(true)}
        >
          New Work Order
        </Button>
      </div>

      {/* Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-[600px]">
        {/* Left Panel - Work Order Queue (40%) */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <Card.Header>
              <Card.Title>Work Order Queue</Card.Title>
              <Card.Description>
                {workOrders.length} active work orders
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-0">
              {workOrders.length === 0 ? (
                <Empty
                  title="No Work Orders"
                  message="Create your first work order to get started"
                  icon="FileText"
                  className="py-12"
                />
              ) : (
                <div className="overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                    <div 
                      className="col-span-3 cursor-pointer flex items-center space-x-1"
                      onClick={() => handleSort('jobId')}
                    >
                      <span>Job ID</span>
                      <ApperIcon name="ArrowUpDown" className="w-3 h-3" />
                    </div>
                    <div 
                      className="col-span-3 cursor-pointer flex items-center space-x-1"
                      onClick={() => handleSort('productName')}
                    >
                      <span>Product</span>
                      <ApperIcon name="ArrowUpDown" className="w-3 h-3" />
                    </div>
                    <div 
                      className="col-span-2 cursor-pointer flex items-center space-x-1"
                      onClick={() => handleSort('quantity')}
                    >
                      <span>Qty</span>
                      <ApperIcon name="ArrowUpDown" className="w-3 h-3" />
                    </div>
                    <div 
                      className="col-span-2 cursor-pointer flex items-center space-x-1"
                      onClick={() => handleSort('priority')}
                    >
                      <span>Priority</span>
                      <ApperIcon name="ArrowUpDown" className="w-3 h-3" />
                    </div>
                    <div 
                      className="col-span-2 cursor-pointer flex items-center space-x-1"
                      onClick={() => handleSort('dueDate')}
                    >
                      <span>Due</span>
                      <ApperIcon name="ArrowUpDown" className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="max-h-[500px] overflow-y-auto">
                    {sortedWorkOrders.map((workOrder) => (
                      <motion.div
                        key={workOrder.Id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "grid grid-cols-12 gap-2 px-6 py-3 border-b border-slate-100 cursor-pointer transition-colors text-sm",
                          selectedWorkOrder?.Id === workOrder.Id 
                            ? "bg-primary/5 border-primary/20" 
                            : "hover:bg-slate-50"
                        )}
                        onClick={() => setSelectedWorkOrder(workOrder)}
                      >
                        <div className="col-span-3">
                          <div className="flex items-center space-x-2">
                            <StatusDot status={workOrder.status} size="sm" />
                            <span className="font-medium text-slate-900">
                              {workOrder.jobId}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className="text-slate-700 truncate block">
                            {workOrder.productName}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-900 font-medium">
                            {workOrder.quantity}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <Badge 
                            variant={workOrder.priority === 'High' ? 'error' : 
                                    workOrder.priority === 'Medium' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {workOrder.priority}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className={cn(
                            "text-xs",
                            new Date(workOrder.dueDate) < new Date() && workOrder.status !== 'Complete'
                              ? "text-error font-medium"
                              : "text-slate-600"
                          )}>
                            {formatDate(workOrder.dueDate)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Right Panel - Work Order Details (60%) */}
        <div className="lg:col-span-6">
          {selectedWorkOrder ? (
            <Card className="h-full">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title className="flex items-center space-x-3">
                      <span>{selectedWorkOrder.jobId}</span>
                      <Badge variant={getStatusVariant(selectedWorkOrder.status)}>
                        {selectedWorkOrder.status}
                      </Badge>
                    </Card.Title>
                    <Card.Description>
                      {selectedWorkOrder.productName} • {selectedWorkOrder.quantity} units
                    </Card.Description>
                  </div>
                  <div className="text-right text-sm text-secondary">
                    <p>Customer: {selectedWorkOrder.customerName}</p>
                    <p>Due: {formatDate(selectedWorkOrder.dueDate)}</p>
                  </div>
                </div>
              </Card.Header>

              <Card.Content className="space-y-6">
                {/* Production Stages */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Production Progress</h3>
                  <div className="space-y-4">
                    {selectedWorkOrder.stages.map((stage, index) => (
                      <div key={stage.name} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <StatusDot 
                              status={stage.status === 'Complete' ? 'active' : 
                                     stage.status === 'In Progress' ? 'warning' : 'inactive'} 
                              size="md" 
                            />
                            <span className="font-medium text-slate-900">{stage.name}</span>
                            <Badge 
                              variant={stage.status === 'Complete' ? 'success' : 
                                      stage.status === 'In Progress' ? 'primary' : 'default'}
                              size="sm"
                            >
                              {stage.status}
                            </Badge>
                          </div>
                          {stage.status === 'Pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStageUpdate(index, { 
                                status: 'In Progress', 
                                progress: 1 
                              })}
                            >
                              Start
                            </Button>
                          )}
                          {stage.status === 'In Progress' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStageUpdate(index, { 
                                status: 'Complete', 
                                progress: 100 
                              })}
                            >
                              Complete
                            </Button>
                          )}
                        </div>

                        <ProgressBar
                          value={stage.progress}
                          max={100}
                          variant={stage.status === 'Complete' ? 'success' : 
                                  stage.status === 'In Progress' ? 'primary' : 'default'}
                          size="md"
                          className="mb-2"
                        />

                        <div className="flex justify-between text-xs text-secondary">
                          <span>{stage.progress}% Complete</span>
                          {stage.startTime && (
                            <span>
                              Started: {new Date(stage.startTime).toLocaleDateString()}
                              {stage.endTime && ` • Completed: ${new Date(stage.endTime).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Material Requirements</h3>
                  <div className="space-y-3">
                    {selectedWorkOrder.materialRequirements.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            material.status === 'Available' ? 'bg-success' :
                            material.status === 'Low' ? 'bg-warning' : 'bg-error'
                          )} />
                          <span className="font-medium text-slate-900">{material.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">
                            {material.available}/{material.required}
                          </div>
                          <div className={cn("text-xs font-medium", getMaterialStatusColor(material.status))}>
                            {material.status}
                            {material.status !== 'Available' && material.required > material.available && (
                              <span> (-{material.required - material.available})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Order Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-secondary">Assigned Line</p>
                    <p className="font-medium text-slate-900">{selectedWorkOrder.assignedLine}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Current Stage</p>
                    <p className="font-medium text-slate-900">{selectedWorkOrder.currentStage}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <Card className="h-full">
              <Card.Content className="flex items-center justify-center h-full">
                <Empty
                  title="Select Work Order"
                  message="Choose a work order from the queue to view details"
                  icon="FileText"
                />
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <CreateWorkOrderModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateWorkOrder}
        />
      )}
    </div>
  );
};

// Create Work Order Modal Component
const CreateWorkOrderModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    priority: 'Medium',
    customerName: '',
    dueDate: '',
    assignedLine: 'Assembly Line A',
    materialRequirements: []
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.quantity || !formData.customerName || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const workOrderData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        materialRequirements: [
          {
            name: `${formData.productName} Components`,
            required: parseInt(formData.quantity),
            available: Math.floor(parseInt(formData.quantity) * 0.8), // Mock 80% availability
            status: 'Available'
          },
          {
            name: 'Packaging Materials',
            required: parseInt(formData.quantity),
            available: parseInt(formData.quantity) + 50,
            status: 'Available'
          }
        ]
      };
      
      await onSubmit(workOrderData);
    } catch (err) {
      console.error('Failed to create work order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Create Work Order</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon="X"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assigned Production Line
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.assignedLine}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedLine: e.target.value }))}
              >
                <option value="Assembly Line A">Assembly Line A</option>
                <option value="Assembly Line B">Assembly Line B</option>
                <option value="Quality Control Line">Quality Control Line</option>
                <option value="Packaging Line C">Packaging Line C</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon="Plus"
              >
                Create Work Order
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Production;