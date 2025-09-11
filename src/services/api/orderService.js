import ordersData from "@/services/mockData/orders.json";
import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

// In-memory storage for runtime changes
let orders = [...ordersData];
let nextId = Math.max(...orders.map(o => o.Id)) + 1;

export const orderService = {
  // Get all orders with optional filtering
  getAll: async (filters = {}) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredOrders = [...orders];
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.customerName.toLowerCase().includes(searchTerm) ||
          order.product.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filteredOrders = filteredOrders.filter(order => 
          order.status.toLowerCase() === filters.status.toLowerCase()
        );
      }
      
      // Apply date range filter
      if (filters.startDate) {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.orderDate) >= new Date(filters.startDate)
        );
      }
      
      if (filters.endDate) {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.orderDate) <= new Date(filters.endDate)
        );
      }
      
      // Sort by order date (newest first)
      filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      return filteredOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to load orders');
    }
  },

  // Get order by ID
  getById: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const order = orders.find(o => o.Id === parseInt(id));
      if (!order) {
        throw new Error(`Order with ID ${id} not found`);
      }
      return { ...order };
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  // Create new order
  create: async (orderData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newOrder = {
Id: nextId++,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        product: orderData.product,
        quantity: orderData.quantity,
        unitPrice: orderData.unitPrice,
        totalAmount: orderData.quantity * orderData.unitPrice,
        // Enhanced pricing breakdown
pricingBreakdown: {
          materialsCost: orderData.unitPrice * 0.45, // 45% materials
          laborCost: orderData.unitPrice * 0.35,     // 35% labor
          overheadCost: orderData.unitPrice * 0.20,  // 20% overhead
          subtotal: orderData.unitPrice,
          totalAmount: orderData.quantity * orderData.unitPrice
        },
        // Product specifications
        specifications: {
          customRequirements: orderData.customRequirements || 'Standard specifications',
          materialGrade: orderData.materialGrade || 'Standard Grade',
          finishType: orderData.finishType || 'Standard Finish',
          toleranceLevel: orderData.toleranceLevel || '±0.01mm',
          certificationRequired: orderData.certificationRequired || false
},
        status: 'New',
        priority: orderData.priority || 'Normal',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: orderData.deliveryDate,
notes: orderData.notes || '',
        timeline: [
          {
            status: 'New',
            timestamp: new Date().toISOString(),
            user: 'System',
            notes: 'Order created'
          }
        ],
        productionAssignment: null,
        qualityRequirements: {
          inspectionPoints: [
            { name: 'Incoming Material Inspection', required: true, status: 'Pending' },
            { name: 'In-Process Quality Check', required: true, status: 'Pending' },
            { name: 'Final Product Inspection', required: true, status: 'Pending' },
            { name: 'Packaging Quality Check', required: false, status: 'Pending' }
          ],
          qualityStandards: 'ISO 9001:2015',
          testingProcedures: []
        },
        shippingInfo: {
          method: 'Standard Ground',
          carrier: 'FedEx',
          trackingNumber: null,
          estimatedDelivery: null,
          deliveryPreferences: {
            signatureRequired: false,
            deliveryInstructions: ''
          }
        }
      };
      
      orders.unshift(newOrder);
      toast.success(`Order ${newOrder.orderNumber} created successfully`);
      return { ...newOrder };
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
      throw error;
    }
  },

  // Update order status
  updateStatus: async (id, newStatus, notes = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const orderIndex = orders.findIndex(o => o.Id === parseInt(id));
      if (orderIndex === -1) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const order = orders[orderIndex];
      const oldStatus = order.status;
      
// Update order status and handle workflow automation
      order.status = newStatus;
      
      // Handle status-specific automation
      if (newStatus === 'In Production' && oldStatus === 'New') {
        // Create work order automatically
        try {
          const { create: createWorkOrder } = await import('@/services/api/workOrderService');
          const workOrder = await createWorkOrder({
            orderId: order.Id,
            productName: order.product,
            quantity: order.quantity,
            customerName: order.customerName,
            priority: order.priority || 'Normal',
            dueDate: order.deliveryDate,
            assignedLine: 'Assembly Line A'
          });
          
          order.productionAssignment = {
            workOrderId: workOrder.Id,
            workOrderNumber: workOrder.jobId,
            assignedLine: workOrder.assignedLine,
            estimatedCompletion: workOrder.dueDate,
            progress: 0
          };
          
          // Reserve inventory for this order
          try {
            const inventoryService = await import('@/services/api/inventoryService');
            await inventoryService.default.reserveForOrder(order.Id, order.product, order.quantity);
          } catch (invError) {
            console.warn('Could not reserve inventory for order:', invError);
          }
          
        } catch (error) {
          console.error('Failed to create work order for order:', error);
        }
      }
      
      // Update shipping info based on status
      if (newStatus === 'Shipped') {
        const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
        order.shippingInfo.trackingNumber = trackingNumber;
        order.shippingInfo.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Update quality requirements status
      if (newStatus === 'Ready') {
        order.qualityRequirements.inspectionPoints.forEach(point => {
          if (point.required) {
            point.status = 'Passed';
            point.completedAt = new Date().toISOString();
            point.completedBy = 'QC Team';
          }
        });
      }
      
      // Add timeline entry
      order.timeline = order.timeline || [];
      order.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        user: 'Current User',
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`
      });
      
      toast.success(`Order ${order.orderNumber} status updated to ${newStatus}`);
      return { ...order };
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      toast.error('Failed to update order status');
      throw error;
    }
  },

  // Delete order
  delete: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const orderIndex = orders.findIndex(o => o.Id === parseInt(id));
      if (orderIndex === -1) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const deletedOrder = orders[orderIndex];
      orders.splice(orderIndex, 1);
      
      toast.success(`Order ${deletedOrder.orderNumber} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to delete order ${id}:`, error);
      toast.error('Failed to delete order');
      throw error;
    }
  },

// Get order statistics
  getStats: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stats = {
        total: orders.length,
        new: orders.filter(o => o.status === 'New').length,
        inProduction: orders.filter(o => o.status === 'In Production').length,
        ready: orders.filter(o => o.status === 'Ready').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        overdue: orders.filter(o => {
          const deliveryDate = new Date(o.deliveryDate);
          const today = new Date();
          return deliveryDate < today && !['Shipped', 'Delivered'].includes(o.status);
        }).length,
        totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        avgDeliveryTime: calculateAverageDeliveryTime(orders),
        onTimeDeliveryRate: calculateOnTimeDeliveryRate(orders)
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw error;
    }
  }
};

// Helper function to calculate average delivery time
const calculateAverageDeliveryTime = (orders) => {
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' && o.timeline);
  if (deliveredOrders.length === 0) return 0;
  
  const totalDays = deliveredOrders.reduce((sum, order) => {
    const createdEvent = order.timeline.find(t => t.status === 'New');
    const deliveredEvent = order.timeline.find(t => t.status === 'Delivered');
    if (createdEvent && deliveredEvent) {
      const daysDiff = Math.ceil((new Date(deliveredEvent.timestamp) - new Date(createdEvent.timestamp)) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }
    return sum;
  }, 0);
  
  return Math.round(totalDays / deliveredOrders.length);
};

// Helper function to calculate on-time delivery rate
const calculateOnTimeDeliveryRate = (orders) => {
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  if (deliveredOrders.length === 0) return 100;
  
  const onTimeOrders = deliveredOrders.filter(o => {
    const deliveredEvent = o.timeline.find(t => t.status === 'Delivered');
    if (deliveredEvent && o.deliveryDate) {
      return new Date(deliveredEvent.timestamp) <= new Date(o.deliveryDate);
    }
    return true;
  });
  
  return Math.round((onTimeOrders.length / deliveredOrders.length) * 100);
};