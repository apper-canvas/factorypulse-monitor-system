import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { orderService } from "@/services/api/orderService";
import { customerService } from "@/services/api/customerService";
import { format, isAfter, parseISO } from "date-fns";
import * as activityService from "@/services/api/activityService";
import * as workOrderService from "@/services/api/workOrderService";
import * as productionService from "@/services/api/productionService";
import * as qualityService from "@/services/api/qualityService";
import * as alertService from "@/services/api/alertService";
import * as machineService from "@/services/api/machineService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
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
      if (ordersData.length > 0 && !selectedOrder) {
        setSelectedOrder(ordersData[0]);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (deliveryDate, status) => {
    if (status === 'Delivered') return false;
    return isAfter(new Date(), parseISO(deliveryDate));
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
                  <option value="confirmed">Confirmed</option>
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

  const canConfirm = order.status === 'New';
  const canDeliver = order.status === 'Confirmed';

  return (
    <Card className="h-full">
      <Card.Content className="p-6">
        <div className="space-y-6">
          {/* Order Header */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">{order.orderNumber}</h2>
              <div className="flex space-x-2">
                {canConfirm && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange('Confirmed')}
                  >
                    Confirm Order
                  </Button>
                )}
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
                <span className="text-secondary">Status:</span>
                <Badge className={`ml-2 ${order.status === 'New' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {order.status}
                </Badge>
              </div>
              <div>
                <span className="text-secondary">Priority:</span>
                <Badge className={`ml-2 ${order.priority === 'High' ? 'bg-red-100 text-red-800' : 
                  order.priority === 'Normal' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
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
          
          {/* Product Specifications */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Product Specifications</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary">Product:</span>
                  <span className="font-medium">{order.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Quantity:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                {order.specifications && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary">Material Grade:</span>
                        <span className="font-medium">{order.specifications.materialGrade}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary">Finish Type:</span>
                        <span className="font-medium">{order.specifications.finishType}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary">Tolerance:</span>
                        <span className="font-medium">{order.specifications.toleranceLevel}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary">Certification:</span>
                        <span className="font-medium">
                          {order.specifications.certificationRequired ? 'Required' : 'Not Required'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-secondary text-sm mb-1">Custom Requirements:</div>
                      <div className="text-sm bg-white rounded p-2 border">
                        {order.specifications.customRequirements}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Pricing Breakdown</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="space-y-3">
                {order.pricingBreakdown ? (
                  <>
<div className="flex justify-between text-sm">
                      <span className="text-secondary">Materials Cost:</span>
                      <span className="font-medium">${order.pricingBreakdown.materialsCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Labor Cost:</span>
                      <span className="font-medium">${order.pricingBreakdown.laborCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Overhead Cost:</span>
                      <span className="font-medium">${order.pricingBreakdown.overheadCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-sm">
                      <span className="text-secondary">Unit Price:</span>
                      <span className="font-medium">${order.pricingBreakdown.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Total Amount:</span>
                      <span className="font-bold text-lg">${order.pricingBreakdown.totalAmount?.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-secondary">Unit Price:</span>
                      <span className="font-medium">${order.unitPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold text-slate-900">Total Amount:</span>
                      <span className="font-bold text-lg">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Dates */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Important Dates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Order Date:</span>
                <span className="font-medium">{format(parseISO(order.orderDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Delivery Date:</span>
                <span className={`font-medium ${isAfter(new Date(), parseISO(order.deliveryDate)) && order.status !== 'Delivered' ? 'text-red-600' : ''}`}>
                  {format(parseISO(order.deliveryDate), 'MMM dd, yyyy')}
                  {isAfter(new Date(), parseISO(order.deliveryDate)) && order.status !== 'Delivered' && (
                    <span className="ml-2 text-red-600 text-sm font-semibold">OVERDUE</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Notes</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700">{order.notes}</p>
              </div>
            </div>
          )}
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
      case 'Confirmed': return 'CheckCircle';
      case 'Delivered': return 'Truck';
      default: return 'Clock';
    }
  };

  const getTimelineColor = (status) => {
    switch (status) {
      case 'New': return 'text-yellow-600';
      case 'Confirmed': return 'text-green-600';
      case 'Delivered': return 'text-blue-600';
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
    priority: 'Normal',
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
        unitPrice: parseFloat(formData.unitPrice)
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