import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { customerService } from "@/services/api/customerService";
import { format, isAfter, parseISO } from "date-fns";
import { orderService } from "@/services/api/orderService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Production from "@/components/pages/Production";
import * as productionService from "@/services/api/productionService";
import * as qualityService from "@/services/api/qualityService";
import * as alertService from "@/services/api/alertService";
import * as machineService from "@/services/api/machineService";
import * as activityService from "@/services/api/activityService";
import * as workOrderService from "@/services/api/workOrderService";
import * as inventoryService from "@/services/api/inventoryService";
// Utility functions for styling - positioned at module level for global accessibility
const isOverdue = (deliveryDate, status) => {
  if (status === 'Delivered') return false;
  return isAfter(new Date(), parseISO(deliveryDate));
};

const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in progress':
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-success-100 text-success-600';
    case 'cancelled':
    case 'canceled':
      return 'bg-red-100 text-red-800';
    case 'on hold':
    case 'on-hold':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  if (!priority) return 'bg-gray-100 text-gray-800';
  
  switch (priority.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
    case 'normal':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  // Load orders with current filters
  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        status: statusFilter
      };
      const ordersData = await orderService.getAll(filters);
      setOrders(ordersData);
      
// Auto-select first order if none selected
      if (orders.length > 0 && !selectedOrder) {
        setSelectedOrder(orders[0]);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await customerService.getAll();
      setCustomers(customersData);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const newOrder = await orderService.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
      setShowNewOrderModal(false);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, notes = '') => {
    try {
      const updatedOrder = await orderService.updateStatus(orderId, newStatus, notes);
      setOrders(prev => prev.map(order => 
        order.Id === orderId ? updatedOrder : order
      ));
      if (selectedOrder?.Id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Orders</h3>
        <p className="text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-secondary mt-1">
            Track customer orders, manage fulfillment, and monitor delivery status
          </p>
        </div>
        <Button 
          icon="Plus" 
          variant="primary" 
          size="lg"
          onClick={() => setShowNewOrderModal(true)}
        >
          New Order
        </Button>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Order List Panel (30%) */}
        <div className="col-span-4 space-y-4">
          <Card className="h-full flex flex-col">
            <Card.Content className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 mb-6">
                {/* Search */}
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search orders or customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
<option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in production">In Production</option>
                  <option value="ready">Ready</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              {/* Order List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.Id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedOrder?.Id === order.Id
                        ? 'border-primary bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${isOverdue(order.deliveryDate, order.status) ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    
<div className="space-y-1 text-sm">
                      <div className="font-medium text-slate-800">{order.customerName}</div>
                      <div className="text-secondary">{order.product}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Qty: {order.quantity}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      {order.productionAssignment && (
                        <div className="text-xs text-slate-500">
                          WO: {order.productionAssignment.workOrderNumber}
                        </div>
                      )}
                      <div className="text-secondary">
                        Delivery: {format(parseISO(order.deliveryDate), 'MMM dd, yyyy')}
                        {isOverdue(order.deliveryDate, order.status) && (
                          <span className="text-red-600 ml-2 font-semibold">OVERDUE</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <ApperIcon name="ShoppingCart" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-secondary">No orders found</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Order Details Panel (45%) */}
        <div className="col-span-5">
{selectedOrder ? (
            <OrderDetails 
              order={selectedOrder} 
              onStatusUpdate={handleStatusUpdate}
              onRefresh={() => loadOrders()}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <Card.Content className="text-center p-8">
                <ApperIcon name="FileText" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select an Order</h3>
                <p className="text-secondary">Choose an order from the list to view details</p>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* Timeline Panel (25%) */}
        <div className="col-span-3">
          {selectedOrder ? (
            <OrderTimeline order={selectedOrder} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <Card.Content className="text-center p-6">
                <ApperIcon name="Clock" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Timeline</h3>
                <p className="text-secondary text-sm">Select an order to view timeline</p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal
          customers={customers}
          onClose={() => setShowNewOrderModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}
    </div>
  );
};

// Order Details Component
const OrderDetails = ({ order, onStatusUpdate }) => {
  const [customerDetails, setCustomerDetails] = useState(null);

  // Fetch customer details when order changes
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (order?.customerId) {
        try {
          const customer = await customerService.getById(order.customerId);
          setCustomerDetails(customer);
        } catch (error) {
          console.error('Failed to fetch customer details:', error);
        }
      }
    };
    fetchCustomerDetails();
  }, [order?.customerId]);

const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onStatusUpdate(order.Id, newStatus);
    setUpdating(false);
  };

const canStartProduction = order.status === 'New';
  const canMarkReady = order.status === 'In Production';
  const canShip = order.status === 'Ready';
  const canDeliver = order.status === 'Shipped';

const [activeTab, setActiveTab] = useState('details');

  return (
    <Card className="h-full">
<Card.Content className="p-6">
        <div className="space-y-6">
          {/* Order Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">{order.orderNumber}</h2>
              <div className="flex space-x-2">
                {canDeliver && (
                  <Button 
                    variant="success" 
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange('Delivered')}
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary">Status: </span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div>
                <span className="text-secondary">Priority: </span>
                <Badge className={getPriorityColor(order.priority)}>
                  {order.priority}
                </Badge>
              </div>
            </div>
          </div>
{/* Customer Information */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="font-medium text-slate-900 mb-2">{order.customerName}</div>
              <div className="text-secondary text-sm space-y-1">
                <div>Customer ID: {order.customerId}</div>
                {customerDetails && (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <ApperIcon name="Mail" size={14} />
                      <span>{customerDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Phone" size={14} />
                      <span>{customerDetails.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <ApperIcon name="MapPin" size={14} className="mt-0.5" />
                      <span className="text-xs leading-relaxed">{customerDetails.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ApperIcon name="Building2" size={14} />
                      <span className="text-xs">{customerDetails.industry}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
{/* Status Update Buttons */}
          <div className="flex items-center space-x-2 mb-6">
            {canStartProduction && (
              <Button
                size="sm"
                variant="primary"
                icon="Play"
                onClick={() => handleStatusChange('In Production')}
              >
                Start Production
              </Button>
            )}
            {canMarkReady && (
              <Button
                size="sm"
                variant="success"
                icon="CheckCircle"
                onClick={() => handleStatusChange('Ready')}
              >
                Mark Ready
              </Button>
            )}
            {canShip && (
              <Button
                size="sm"
                variant="primary"
                icon="Truck"
                onClick={() => handleStatusChange('Shipped')}
              >
                Ship Order
              </Button>
            )}
            {canDeliver && (
              <Button
                size="sm"
                variant="success"
                icon="Package"
                onClick={() => handleStatusChange('Delivered')}
              >
                Mark Delivered
              </Button>
            )}
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-6">
            {[
              { id: 'details', label: 'Order Details', icon: 'FileText' },
              { id: 'production', label: 'Production', icon: 'Cog' },
              { id: 'quality', label: 'Quality', icon: 'CheckCircle2' },
              { id: 'shipping', label: 'Shipping', icon: 'Truck' },
              { id: 'timeline', label: 'Timeline', icon: 'Clock' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <ApperIcon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Customer and Product Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary">Customer</p>
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Product</p>
                    <p className="font-medium text-slate-900">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Quantity</p>
                    <p className="font-medium text-slate-900">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Priority</p>
                    <Badge variant={order.priority === 'High' ? 'error' : order.priority === 'Medium' ? 'warning' : 'default'}>
                      {order.priority}
                    </Badge>
                  </div>
                </div>
                
                {/* Order Value */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Order Value</span>
                    <span className="text-xl font-semibold text-slate-900">
                      ${order.totalAmount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  {order.unitPrice && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-secondary">Unit Price</span>
                      <span className="text-sm text-slate-600">
                        ${order.unitPrice} × {order.quantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'production' && (
              <div className="space-y-6">
                {order.productionAssignment ? (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Production Assignment</h4>
                    <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-secondary">Work Order</p>
                          <p className="font-medium text-slate-900">{order.productionAssignment.workOrderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Assigned Line</p>
                          <p className="font-medium text-slate-900">{order.productionAssignment.assignedLine}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Progress</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${order.productionAssignment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {order.productionAssignment.progress || 0}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-secondary">Est. Completion</p>
                          <p className="font-medium text-slate-900">
                            {order.productionAssignment.estimatedCompletion 
                              ? format(new Date(order.productionAssignment.estimatedCompletion), 'MMM dd, yyyy')
                              : 'TBD'
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon="ExternalLink"
                        onClick={() => {
                          toast.info('Production details view coming soon');
                        }}
                      >
                        View Work Order Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ApperIcon name="AlertCircle" className="mx-auto h-8 w-8 text-slate-400 mb-4" />
                    <p className="text-slate-500">No production assignment yet</p>
                    <p className="text-sm text-slate-400 mt-1">Work order will be created when order enters production</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'quality' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-900">Quality Requirements</h4>
                
                {/* Quality Standards */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-secondary mb-1">Quality Standards</p>
                  <p className="font-medium text-slate-900">{order.qualityRequirements?.qualityStandards || 'Standard Quality Controls'}</p>
                </div>
                
                {/* Inspection Points */}
                <div>
                  <h5 className="text-md font-medium text-slate-900 mb-3">Inspection Checkpoints</h5>
                  <div className="space-y-3">
                    {(order.qualityRequirements?.inspectionPoints || []).map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            point.status === 'Passed' ? 'bg-green-500' :
                            point.status === 'Failed' ? 'bg-red-500' :
                            'bg-slate-300'
                          }`} />
                          <div>
                            <p className="font-medium text-slate-900">{point.name}</p>
                            {point.completedBy && (
                              <p className="text-xs text-slate-500">
                                Completed by {point.completedBy} • {format(new Date(point.completedAt), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              point.status === 'Passed' ? 'success' :
                              point.status === 'Failed' ? 'error' :
                              'default'
                            }
                            size="sm"
                          >
                            {point.status}
                          </Badge>
                          {point.required && (
                            <Badge variant="outline" size="sm">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-900">Shipping Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary">Shipping Method</p>
                    <p className="font-medium text-slate-900">{order.shippingInfo?.method || 'Standard Ground'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Carrier</p>
                    <p className="font-medium text-slate-900">{order.shippingInfo?.carrier || 'FedEx'}</p>
                  </div>
                  {order.shippingInfo?.trackingNumber && (
                    <div className="col-span-2">
                      <p className="text-sm text-secondary">Tracking Number</p>
                      <p className="font-medium text-slate-900">{order.shippingInfo.trackingNumber}</p>
                    </div>
                  )}
                  {order.shippingInfo?.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-secondary">Est. Delivery</p>
                      <p className="font-medium text-slate-900">
                        {format(new Date(order.shippingInfo.estimatedDelivery), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Delivery Preferences */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h5 className="text-sm font-medium text-slate-900 mb-3">Delivery Preferences</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Signature Required</span>
                      <Badge variant={order.shippingInfo?.deliveryPreferences?.signatureRequired ? 'warning' : 'default'} size="sm">
                        {order.shippingInfo?.deliveryPreferences?.signatureRequired ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {order.shippingInfo?.deliveryPreferences?.deliveryInstructions && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Special Instructions</p>
                        <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded">
                          {order.shippingInfo.deliveryPreferences.deliveryInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
{activeTab === 'timeline' && <OrderTimeline order={order} />}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

// Order Timeline Component
const OrderTimeline = ({ order }) => {
  const timeline = order.timeline || [];

const getTimelineIcon = (status) => {
    switch (status) {
      case 'New': return 'Plus';
      case 'In Production': return 'Cog';
      case 'Ready': return 'CheckCircle';
      case 'Shipped': return 'Truck';
      case 'Delivered': return 'Package';
      default: return 'Circle';
    }
  };

  const getTimelineColor = (status) => {
    switch (status) {
      case 'New': return 'text-yellow-600';
      case 'In Production': return 'text-orange-600';
      case 'Ready': return 'text-green-600';
      case 'Shipped': return 'text-blue-600';
      case 'Delivered': return 'text-purple-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <Card className="h-full">
      <Card.Content className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Order Timeline</h3>
        
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={index} className="flex space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100`}>
                <ApperIcon 
                  name={getTimelineIcon(event.status)} 
                  className={`w-4 h-4 ${getTimelineColor(event.status)}`} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">
{event.status}
                </div>
                <div className="text-xs text-secondary">
                  {format(parseISO(event.timestamp), 'MMM dd, yyyy HH:mm')}
                </div>
                <div className="text-xs text-secondary">
                  by {event.user}
                </div>
                {event.notes && (
                  <div className="text-xs text-slate-700 mt-1">
                    {event.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {timeline.length === 0 && (
          <div className="text-center py-8">
            <ApperIcon name="Clock" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-secondary text-sm">No timeline events</p>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

// New Order Modal Component
const NewOrderModal = ({ customers, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    product: '',
    quantity: '',
    unitPrice: '',
priority: 'Medium',
    deliveryDate: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.product || !formData.quantity || !formData.unitPrice || !formData.deliveryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        totalAmount: parseInt(formData.quantity) * parseFloat(formData.unitPrice)
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.Id === parseInt(customerId));
    setFormData(prev => ({
      ...prev,
      customerId: customerId,
      customerName: customer ? customer.company : ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Create New Order</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select customer...</option>
              {customers.map(customer => (
                <option key={customer.Id} value={customer.Id}>
                  {customer.company} - {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product *
            </label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unit Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
</div>
  );
};

export default Orders;