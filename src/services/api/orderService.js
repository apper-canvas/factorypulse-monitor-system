import ordersData from '@/services/mockData/orders.json';
import { toast } from 'react-toastify';

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
          materialsKost: orderData.unitPrice * 0.45, // 45% materials
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
        ]
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
      
      // Update order status
      order.status = newStatus;
      
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
        confirmed: orders.filter(o => o.status === 'Confirmed').length,
        overdue: orders.filter(o => {
          const deliveryDate = new Date(o.deliveryDate);
          const today = new Date();
          return deliveryDate < today && o.status !== 'Delivered';
        }).length,
        totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw error;
    }
  }
};