import { toast } from "react-toastify";

// Order service using Apper Backend database integration
const tableName = 'order_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const orderService = {
// Get all orders with optional filtering
  getAll: async (filters = {}) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "product_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "unit_price_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "delivery_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "timeline_c"}},
          {"field": {"Name": "production_assignment_c"}},
          {"field": {"Name": "quality_requirements_c"}},
          {"field": {"Name": "shipping_info_c"}},
          {"field": {"name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "order_date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      // Apply filters
      const whereConditions = [];
      
      if (filters.search) {
        whereConditions.push({
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "order_number_c", "operator": "Contains", "values": [filters.search]},
                {"fieldName": "customer_name_c", "operator": "Contains", "values": [filters.search]},
                {"fieldName": "product_c", "operator": "Contains", "values": [filters.search]}
              ],
              "operator": "OR"
            }
          ]
        });
      }
      
      if (filters.status && filters.status !== 'all') {
        params.where = [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [filters.status]}];
      }
      
      if (whereConditions.length > 0) {
        params.whereGroups = whereConditions;
      }
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch orders:', error?.response?.data?.message || error);
      throw new Error('Failed to load orders');
    }
  },

  // Get order by ID
// Get order by ID
  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "product_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "unit_price_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "delivery_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "timeline_c"}},
          {"field": {"Name": "production_assignment_c"}},
          {"field": {"Name": "quality_requirements_c"}},
          {"field": {"Name": "shipping_info_c"}},
          {"field": {"name": "customer_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{"FieldName": "Id", "Operator": "EqualTo", "Values": [id]}]
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      return response.data[0];
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

// Create new order
  create: async (orderData) => {
    try {
      const apperClient = getApperClient();
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      const recordData = {
        Name: orderNumber,
        order_number_c: orderNumber,
        customer_name_c: orderData.customerName,
        product_c: orderData.product,
        quantity_c: orderData.quantity,
        unit_price_c: orderData.unitPrice,
        total_amount_c: orderData.quantity * orderData.unitPrice,
        status_c: 'New',
        priority_c: orderData.priority || 'Normal',
        order_date_c: new Date().toISOString().split('T')[0],
        delivery_date_c: orderData.deliveryDate,
        notes_c: orderData.notes || '',
        timeline_c: JSON.stringify([
          {
            status: 'New',
            timestamp: new Date().toISOString(),
            user: 'System',
            notes: 'Order created'
          }
        ]),
        production_assignment_c: null,
        quality_requirements_c: JSON.stringify({
          inspectionPoints: [
            { name: 'Incoming Material Inspection', required: true, status: 'Pending' },
            { name: 'In-Process Quality Check', required: true, status: 'Pending' },
            { name: 'Final Product Inspection', required: true, status: 'Pending' },
            { name: 'Packaging Quality Check', required: false, status: 'Pending' }
          ],
          qualityStandards: 'ISO 9001:2015',
          testingProcedures: []
        }),
        shipping_info_c: JSON.stringify({
          method: 'Standard Ground',
          carrier: 'FedEx',
          trackingNumber: null,
          estimatedDelivery: null,
          deliveryPreferences: {
            signatureRequired: false,
            deliveryInstructions: ''
          }
        }),
        customer_id_c: orderData.customerId
      };
      
      const response = await apperClient.createRecord(tableName, recordData);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      toast.success(`Order ${orderNumber} created successfully`);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
      throw error;
    }
  },

// Update order status
  updateStatus: async (id, newStatus, notes = '') => {
    try {
      const apperClient = getApperClient();
      
      // First fetch the current order
      const fetchResponse = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "timeline_c"}},
          {"field": {"Name": "shipping_info_c"}},
          {"field": {"Name": "quality_requirements_c"}},
          {"field": {"Name": "product_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "delivery_date_c"}}
        ],
        where: [{"FieldName": "Id", "Operator": "EqualTo", "Values": [id]}]
      });
      
      if (!fetchResponse.success || !fetchResponse.data || fetchResponse.data.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const order = fetchResponse.data[0];
      const oldStatus = order.status_c;
      
      // Parse existing timeline or create new one
      let timeline = [];
      try {
        timeline = order.timeline_c ? JSON.parse(order.timeline_c) : [];
      } catch (e) {
        timeline = [];
      }
      
      // Add new timeline entry
      timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        user: 'Current User',
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`
      });
      
      // Handle shipping info updates
      let shippingInfo = {};
      try {
        shippingInfo = order.shipping_info_c ? JSON.parse(order.shipping_info_c) : {};
      } catch (e) {
        shippingInfo = {};
      }
      
      if (newStatus === 'Shipped') {
        const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
        shippingInfo.trackingNumber = trackingNumber;
        shippingInfo.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Handle quality requirements updates
      let qualityRequirements = {};
      try {
        qualityRequirements = order.quality_requirements_c ? JSON.parse(order.quality_requirements_c) : {};
      } catch (e) {
        qualityRequirements = {};
      }
      
      if (newStatus === 'Ready' && qualityRequirements.inspectionPoints) {
        qualityRequirements.inspectionPoints.forEach(point => {
          if (point.required) {
            point.status = 'Passed';
            point.completedAt = new Date().toISOString();
            point.completedBy = 'QC Team';
          }
        });
      }
      
      // Update the record
      const updateData = {
        status_c: newStatus,
        timeline_c: JSON.stringify(timeline),
        shipping_info_c: JSON.stringify(shippingInfo),
        quality_requirements_c: JSON.stringify(qualityRequirements)
      };
      
      const updateResponse = await apperClient.updateRecord(tableName, id, updateData);
      
      if (!updateResponse.success) {
        console.error(updateResponse.message);
        throw new Error(updateResponse.message);
      }
      
      // Handle status-specific automation
      if (newStatus === 'In Production' && oldStatus === 'New') {
        try {
          const { create: createWorkOrder } = await import('@/services/api/workOrderService');
          await createWorkOrder({
            orderId: id,
            productName: order.product_c,
            quantity: order.quantity_c,
            customerName: order.customer_name_c,
            priority: order.priority_c || 'Normal',
            dueDate: order.delivery_date_c,
            assignedLine: 'Assembly Line A'
          });
        } catch (error) {
          console.warn('Failed to create work order for order:', error);
        }
      }
      
      toast.success(`Order ${order.order_number_c} status updated to ${newStatus}`);
      return updateResponse.data;
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      toast.error('Failed to update order status');
      throw error;
    }
  },

// Delete order
  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      
      // First fetch the order to get its details for the success message
      const fetchResponse = await apperClient.fetchRecords(tableName, {
        fields: [{"field": {"Name": "order_number_c"}}],
        where: [{"FieldName": "Id", "Operator": "EqualTo", "Values": [id]}]
      });
      
      if (!fetchResponse.success || !fetchResponse.data || fetchResponse.data.length === 0) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const orderNumber = fetchResponse.data[0].order_number_c;
      
      const response = await apperClient.deleteRecord(tableName, id);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      toast.success(`Order ${orderNumber} deleted successfully`);
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
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "delivery_date_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "timeline_c"}}
        ],
        pagingInfo: {"limit": 1000, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const orders = response.data || [];
      const today = new Date();
      
      const stats = {
        total: orders.length,
        new: orders.filter(o => o.status_c === 'New').length,
        inProduction: orders.filter(o => o.status_c === 'In Production').length,
        ready: orders.filter(o => o.status_c === 'Ready').length,
        shipped: orders.filter(o => o.status_c === 'Shipped').length,
        delivered: orders.filter(o => o.status_c === 'Delivered').length,
        overdue: orders.filter(o => {
          const deliveryDate = new Date(o.delivery_date_c);
          return deliveryDate < today && !['Shipped', 'Delivered'].includes(o.status_c);
        }).length,
        totalValue: orders.reduce((sum, o) => sum + (parseFloat(o.total_amount_c) || 0), 0),
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
  const deliveredOrders = orders.filter(o => o.status_c === 'Delivered' && o.timeline_c);
  if (deliveredOrders.length === 0) return 0;
  
  const totalDays = deliveredOrders.reduce((sum, order) => {
    try {
      const timeline = JSON.parse(order.timeline_c);
      const createdEvent = timeline.find(t => t.status === 'New');
      const deliveredEvent = timeline.find(t => t.status === 'Delivered');
      if (createdEvent && deliveredEvent) {
        const daysDiff = Math.ceil((new Date(deliveredEvent.timestamp) - new Date(createdEvent.timestamp)) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }
    } catch (e) {
      console.warn('Could not parse timeline for order:', order.Id);
    }
    return sum;
  }, 0);
  
  return Math.round(totalDays / deliveredOrders.length);
};

// Helper function to calculate on-time delivery rate
const calculateOnTimeDeliveryRate = (orders) => {
  const deliveredOrders = orders.filter(o => o.status_c === 'Delivered');
  if (deliveredOrders.length === 0) return 100;
  
  const onTimeOrders = deliveredOrders.filter(o => {
    try {
      const timeline = o.timeline_c ? JSON.parse(o.timeline_c) : [];
      const deliveredEvent = timeline.find(t => t.status === 'Delivered');
      if (deliveredEvent && o.delivery_date_c) {
        return new Date(deliveredEvent.timestamp) <= new Date(o.delivery_date_c);
      }
    } catch (e) {
      console.warn('Could not parse timeline for order:', o.Id);
    }
    return true;
  });
  
  return Math.round((onTimeOrders.length / deliveredOrders.length) * 100);
};

export default orderService;