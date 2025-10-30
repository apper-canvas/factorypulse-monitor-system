import { getApperClient } from '@apper/core';

const apperClient = getApperClient();
const MATERIAL_TABLE = 'material_c';
const FINISHED_GOODS_TABLE = 'finished_good_c';

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Get stock level status
const getStockLevel = (current, reorder) => {
if (current <= reorder * 0.5) return 'critical';
  if (current <= reorder) return 'low';
  return 'adequate';
};

// Order fulfillment tracking (business logic layer - not database backed)
const orderReservations = [];

const reserveForOrder = async (orderId, productName, quantity) => {
  await delay(300);
  const reservation = {
    orderId: parseInt(orderId),
    productName,
    quantity: parseInt(quantity),
    reservedAt: new Date().toISOString(),
    status: 'Reserved'
  };
  orderReservations.push(reservation);
  return reservation;
};

const releaseOrderReservation = async (orderId) => {
  await delay(300);
  const index = orderReservations.findIndex(r => r.orderId === parseInt(orderId));
  if (index > -1) {
    orderReservations.splice(index, 1);
    return { success: true, message: `Reservation for order ${orderId} released` };
  }
  return { success: false, message: `No reservation found for order ${orderId}` };
};

const getMaterials = async () => {
  await delay(800);
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "current_stock_c"}},
        {"field": {"Name": "unit_c"}},
        {"field": {"Name": "reorder_level_c"}},
        {"field": {"Name": "supplier_c"}},
        {"field": {"Name": "last_updated_c"}}
      ],
      orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
    };
    
    const response = await apperClient.fetchRecords(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to fetch materials:', response.message);
      return [];
    }
    
    return (response.data || []).map(material => ({
      ...material,
      currentStock: material.current_stock_c || 0,
      reorderLevel: material.reorder_level_c || 0,
      name: material.name_c || '',
      stockLevel: getStockLevel(material.current_stock_c || 0, material.reorder_level_c || 0),
      reservations: orderReservations.filter(r => 
        r.productName.toLowerCase().includes((material.name_c || '').toLowerCase())
      )
    }));
  } catch (error) {
    console.error('Failed to fetch materials:', error);
    return [];
  }
};

const getMaterialById = async (id) => {
  await delay(400);
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "category_c"}},
        {"field": {"Name": "current_stock_c"}},
        {"field": {"Name": "unit_c"}},
        {"field": {"Name": "reorder_level_c"}},
        {"field": {"Name": "supplier_c"}},
        {"field": {"Name": "last_updated_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(MATERIAL_TABLE, parseInt(id), params);
    
    if (!response.success || !response.data) {
      return null;
    }
    
    const material = response.data;
    return {
      ...material,
      currentStock: material.current_stock_c || 0,
      reorderLevel: material.reorder_level_c || 0,
      name: material.name_c || '',
      stockLevel: getStockLevel(material.current_stock_c || 0, material.reorder_level_c || 0)
    };
  } catch (error) {
    console.error('Failed to get material by ID:', error);
    return null;
  }
};

const addMaterial = async (materialData) => {
  await delay(600);
  try {
    const params = {
      records: [{
        name_c: materialData.name || materialData.name_c,
        category_c: materialData.category || materialData.category_c,
        current_stock_c: materialData.currentStock || materialData.current_stock_c || 0,
        unit_c: materialData.unit || materialData.unit_c,
        reorder_level_c: materialData.reorderLevel || materialData.reorder_level_c || 0,
        supplier_c: materialData.supplier || materialData.supplier_c,
        last_updated_c: new Date().toISOString().split('T')[0]
      }]
    };
    
    const response = await apperClient.createRecord(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to create material:', response.message);
      throw new Error(response.message || 'Failed to create material');
    }
    
    const newMaterial = response.results[0].data;
    return {
      ...newMaterial,
      currentStock: newMaterial.current_stock_c || 0,
      reorderLevel: newMaterial.reorder_level_c || 0,
      name: newMaterial.name_c || '',
      stockLevel: getStockLevel(newMaterial.current_stock_c || 0, newMaterial.reorder_level_c || 0)
    };
  } catch (error) {
    console.error('Failed to add material:', error);
    throw error;
  }
};

const updateMaterial = async (id, data) => {
  await delay(600);
  try {
    const updateData = {
      Id: parseInt(id)
    };
    
    if (data.name !== undefined || data.name_c !== undefined) {
      updateData.name_c = data.name || data.name_c;
    }
    if (data.category !== undefined || data.category_c !== undefined) {
      updateData.category_c = data.category || data.category_c;
    }
    if (data.currentStock !== undefined || data.current_stock_c !== undefined) {
      updateData.current_stock_c = data.currentStock || data.current_stock_c;
    }
    if (data.unit !== undefined || data.unit_c !== undefined) {
      updateData.unit_c = data.unit || data.unit_c;
    }
    if (data.reorderLevel !== undefined || data.reorder_level_c !== undefined) {
      updateData.reorder_level_c = data.reorderLevel || data.reorder_level_c;
    }
    if (data.supplier !== undefined || data.supplier_c !== undefined) {
      updateData.supplier_c = data.supplier || data.supplier_c;
    }
    updateData.last_updated_c = new Date().toISOString().split('T')[0];
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to update material:', response.message);
      throw new Error(response.message || 'Material not found');
    }
    
    const updatedMaterial = response.results[0].data;
    return {
      ...updatedMaterial,
      currentStock: updatedMaterial.current_stock_c || 0,
      reorderLevel: updatedMaterial.reorder_level_c || 0,
      name: updatedMaterial.name_c || '',
      stockLevel: getStockLevel(updatedMaterial.current_stock_c || 0, updatedMaterial.reorder_level_c || 0)
    };
  } catch (error) {
    console.error('Failed to update material:', error);
    throw error;
  }
};
// Bulk operations
async function bulkUpdateQuantities(updates) {
  await delay(800);
  
  try {
    const updateRecords = updates.map(update => ({
      Id: parseInt(update.id),
      current_stock_c: update.quantity,
      last_updated_c: new Date().toISOString().split('T')[0]
    }));
    
    const params = {
      records: updateRecords
    };
    
    const response = await apperClient.updateRecord(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to bulk update quantities:', response.message);
      throw new Error(response.message || 'Failed to update quantities in bulk');
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} material quantities:`, failed);
      }
      
      return { success: true, updatedCount: successful.length };
    }
    
    return { success: true, updatedCount: updates.length };
  } catch (error) {
    console.error('Failed to bulk update quantities:', error);
    throw new Error('Failed to update quantities in bulk');
  }
}

async function bulkUpdateReorderPoints(updates) {
  await delay(800);
  
  try {
    const updateRecords = updates.map(update => ({
      Id: parseInt(update.id),
      reorder_level_c: update.reorderLevel,
      last_updated_c: new Date().toISOString().split('T')[0]
    }));
    
    const params = {
      records: updateRecords
    };
    
    const response = await apperClient.updateRecord(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to bulk update reorder points:', response.message);
      throw new Error(response.message || 'Failed to update reorder points in bulk');
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} material reorder points:`, failed);
      }
      
      return { success: true, updatedCount: successful.length };
    }
    
    return { success: true, updatedCount: updates.length };
  } catch (error) {
    console.error('Failed to bulk update reorder points:', error);
    throw new Error('Failed to update reorder points in bulk');
  }
}

async function adjustStock(materialId, adjustment, reason = '') {
  await delay(500);
  
  try {
    const material = await getMaterialById(materialId);
    
    if (!material) {
      throw new Error('Material not found');
    }
    
    const previousStock = material.current_stock_c || 0;
    const newStock = Math.max(0, previousStock + adjustment);
    
    const params = {
      records: [{
        Id: parseInt(materialId),
        current_stock_c: newStock,
        last_updated_c: new Date().toISOString().split('T')[0]
      }]
    };
    
    const response = await apperClient.updateRecord(MATERIAL_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to adjust stock:', response.message);
      throw new Error(response.message || 'Failed to adjust stock');
    }
    
    const adjustmentLog = {
      materialId,
      materialName: material.name_c || material.name,
      previousStock,
      adjustment,
      newStock,
      reason,
      timestamp: new Date().toISOString(),
      user: 'Current User'
    };
    
    return { success: true, newStock, adjustmentLog };
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    throw new Error(`Failed to adjust stock: ${error.message}`);
  }
}

function exportMaterialsData(materials, selectedFields = []) {
  const defaultFields = ['name', 'currentStock', 'unit', 'reorderLevel', 'supplier', 'stockLevel', 'lastUpdated'];
  const fieldsToExport = selectedFields.length > 0 ? selectedFields : defaultFields;
  
  // Create CSV header
  const header = fieldsToExport.map(field => {
    const fieldLabels = {
      name: 'Material Name',
      currentStock: 'Current Stock',
      unit: 'Unit',
      reorderLevel: 'Reorder Level', 
      supplier: 'Supplier',
      stockLevel: 'Stock Status',
      lastUpdated: 'Last Updated'
    };
    return fieldLabels[field] || field;
  });
  
  // Create CSV rows
  const rows = materials.map(material => {
    return fieldsToExport.map(field => {
      let value = material[field];
      if (field === 'stockLevel') {
        const statusMap = {
          'adequate': 'Good',
          'low': 'Low',
          'critical': 'Critical'
        };
        value = statusMap[value] || value;
      }
      return `"${value || ''}"`;
    });
  });
  
  // Combine header and rows
  const csvContent = [header, ...rows]
    .map(row => Array.isArray(row) ? row.join(',') : row)
    .join('\n');
  
  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `materials-export-${new Date().toISOString().split('T')[0]}.csv`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(url);

return { success: true, filename: link.download };
}

// Finished goods service methods
async function getFinishedGoods() {
  await delay(800);
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "available_c"}},
        {"field": {"Name": "reserved_c"}},
        {"field": {"Name": "total_c"}},
        {"field": {"Name": "location_c"}},
        {"field": {"Name": "image_url_c"}},
        {"field": {"Name": "batches_c"}}
      ],
      orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
    };
    
    const response = await apperClient.fetchRecords(FINISHED_GOODS_TABLE, params);
    
    if (!response.success) {
      console.error('Failed to fetch finished goods:', response.message);
      return [];
    }
    
    return (response.data || []).map(product => ({
      ...product,
      reservations: orderReservations.filter(r => 
        r.productName.toLowerCase() === product.name.toLowerCase()
      ),
      availableForOrder: product.available - orderReservations
        .filter(r => r.productName.toLowerCase() === product.name.toLowerCase())
        .reduce((sum, r) => sum + r.quantity, 0)
    }));
  } catch (error) {
    console.error('Failed to fetch finished goods:', error);
    return [];
  }
}
async function getFinishedGoodById(id) {
  await delay(500);
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "available_c"}},
        {"field": {"Name": "reserved_c"}},
        {"field": {"Name": "total_c"}},
        {"field": {"Name": "batches_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(FINISHED_GOODS_TABLE, parseInt(id), params);
    
    if (!response.success || !response.data) {
      return null;
    }
    
    const product = response.data;
    const reservations = orderReservations.filter(r => 
      r.productName.toLowerCase() === product.name_c?.toLowerCase()
    );
    const reservedQuantity = reservations.reduce((sum, r) => sum + r.quantity, 0);
    
    return {
      ...product,
      reservations,
      availableForOrder: (product.available_c || 0) - reservedQuantity
    };
  } catch (error) {
    console.error('Failed to get finished good by ID:', error);
    return null;
  }
}

async function adjustFinishedGoodStock(productId, adjustments, reason = "") {
  await delay(1000);
  
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "available_c"}},
        {"field": {"Name": "reserved_c"}},
        {"field": {"Name": "total_c"}},
{"field": {"Name": "location_c"}},
        {"field": {"Name": "image_url_c"}},
        {"field": {"Name": "batches_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(FINISHED_GOODS_TABLE, parseInt(productId), params);
    
    if (!response.success || !response.data) {
      console.error(`Product ${productId} not found:`, response.message);
      return null;
    }
    
    const product = response.data;
    
    // Parse batches from JSON string
    let batches = [];
    try {
      batches = JSON.parse(product.batches_c || '[]');
    } catch (e) {
      console.warn('Invalid batch data, using empty array');
    }

    // Update quantities based on batch adjustments
    adjustments.forEach(adj => {
      const batch = batches.find(b => b.batchNumber === adj.batchNumber);
      if (batch) {
        batch.quantity = Math.max(0, batch.quantity + adj.adjustment);
      }
    });

    // Recalculate totals
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
    const newAvailable = Math.max(0, (product.available_c || 0) + totalAdjustment);
    const newTotal = Math.max(0, (product.total_c || 0) + totalAdjustment);

    // Update the product record
    const updateParams = {
      records: [{
        Id: parseInt(productId),
        available_c: newAvailable,
        total_c: newTotal,
        batches_c: JSON.stringify(batches)
      }]
    };
    
    const updateResponse = await apperClient.updateRecord(FINISHED_GOODS_TABLE, updateParams);
    
    if (!updateResponse.success) {
      throw new Error(updateResponse.message || 'Failed to update stock');
    }

    // Log adjustment for audit trail
    console.log(`Stock adjustment for ${product.name_c}:`, {
      adjustments,
      reason,
      newAvailable,
      timestamp: new Date().toISOString()
    });

    return { 
      ...product,
      available_c: newAvailable,
      total_c: newTotal,
      batches_c: JSON.stringify(batches)
    };
  } catch (error) {
    console.error('Stock adjustment failed:', error);
    throw error;
  }
}

// Order fulfillment functions
async function fulfillOrder(orderId, productName, quantity) {
  await delay(600);
  
  try {
    // Find product by name
    const findParams = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "available_c"}},
        {"field": {"Name": "reserved_c"}}
      ],
      where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [productName]}]
    };
    
    const findResponse = await apperClient.fetchRecords(FINISHED_GOODS_TABLE, findParams);
    
    if (!findResponse.success || !findResponse.data || findResponse.data.length === 0) {
      throw new Error(`Product ${productName} not found`);
    }
    
    const product = findResponse.data[0];
    
    if ((product.available_c || 0) < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.available_c || 0}, Required: ${quantity}`);
    }
    
    // Update quantities (reduce available, reduce reserved)
    const updateParams = {
      records: [{
        Id: product.Id,
        available_c: (product.available_c || 0) - quantity,
        reserved_c: Math.max(0, (product.reserved_c || 0) - quantity)
      }]
    };
    
    const updateResponse = await apperClient.updateRecord(FINISHED_GOODS_TABLE, updateParams);
    
    if (!updateResponse.success) {
      throw new Error(updateResponse.message || 'Failed to fulfill order');
    }
    
    // Release reservation if exists
    await releaseOrderReservation(orderId);
    
    return {
      success: true,
      orderId: parseInt(orderId),
      productName,
      quantityFulfilled: quantity,
      remainingInventory: (product.available_c || 0) - quantity,
      fulfilledAt: new Date().toISOString(),
      message: `Order ${orderId} fulfilled: ${quantity} units of ${productName}`
    };
  } catch (error) {
    console.error('Order fulfillment failed:', error);
    throw error;
  }
}

// Get order fulfillment status
async function getOrderFulfillmentStatus(orderId) {
  await delay(200);
  
  const reservation = orderReservations.find(r => r.orderId === parseInt(orderId));
  
  if (!reservation) {
    return { 
      status: 'Not Reserved', 
      orderId: parseInt(orderId) 
    };
  }
  
  // Return status based on reservation
  return {
    orderId: parseInt(orderId),
    status: reservation.status || 'Reserved',
    productName: reservation.productName,
    reservedQuantity: reservation.quantity,
    reservedAt: reservation.reservedAt,
    fulfilledAt: new Date().toISOString(),
    items: []
  };
}

// Get batches for a specific product
async function getBatchesForProduct(productId) {
  await delay(300);
  
  try {
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "batches_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(FINISHED_GOODS_TABLE, parseInt(productId), params);
    
    if (!response.success || !response.data) {
      console.error(`Product ${productId} not found:`, response.message);
      return [];
    }
    
    const product = response.data;
    
    // Parse batches from the product's batches_c field (MultilineText)
    try {
      const batchesText = product.batches_c || '[]';
      const batches = JSON.parse(batchesText);
      return batches.map(batch => ({
        batchNumber: batch.batchNumber || `BATCH-${Date.now()}`,
        quantity: batch.quantity || 0,
        productionDate: batch.productionDate || new Date().toISOString().split('T')[0],
        expiryDate: batch.expiryDate || null,
        location: batch.location || 'Unknown'
      }));
    } catch (parseError) {
      console.warn('Failed to parse batch data:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Failed to get batches:', error);
    return [];
  }
}

// Create work order for product
async function createWorkOrderForProduct(productId, quantity, priority = 'normal') {
  await delay(500);
  
  try {
    const product = await getFinishedGoodById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Create work order object
    const workOrder = {
      Id: Date.now(),
      productName: product.name_c || product.Name,
      productId: productId,
      quantity: quantity,
      priority: priority,
      status: 'planned',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('Work order created:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('Failed to create work order:', error);
    throw error;
  }
}

// Low stock alerts service method
const getLowStockAlerts = async () => {
  await delay(500);
  const materials = await getMaterials();
  return materials.filter(material => 
    material.stockLevel === 'critical' || material.stockLevel === 'low'
  ).map(material => ({
    ...material,
    alertType: material.stockLevel === 'critical' ? 'critical' : 'warning',
    message: `${material.name} is ${material.stockLevel === 'critical' ? 'critically' : ''} low on stock`
  }));
};

// Calculate total material requirements for pending work orders
const getMaterialRequirementsForWorkOrders = async () => {
  await delay(200);
  
  // This would integrate with workOrderService to get pending work orders
  // For now, return mock data showing material demand (business logic calculation)
  return [
    { materialId: 1, materialName: "Steel Sheets", totalRequired: 150, pendingWorkOrders: 3 },
    { materialId: 2, materialName: "Aluminum Rods", totalRequired: 75, pendingWorkOrders: 2 },
    { materialId: 3, materialName: "Copper Wire", totalRequired: 500, pendingWorkOrders: 4 }
  ];
};

// Get materials with work order demand information
const getMaterialsWithDemand = async () => {
  await delay(300);
  
  const materials = await getMaterials();
  const demandData = await getMaterialRequirementsForWorkOrders();
  
  return materials.map(material => {
    const demand = demandData.find(d => d.materialId === material.Id);
    return {
      ...material,
      pendingDemand: demand?.totalRequired || 0,
      pendingWorkOrders: demand?.pendingWorkOrders || 0,
      projectedShortfall: Math.max(0, (demand?.totalRequired || 0) - material.currentStock)
    };
  });
};

// Named exports for individual functions
export {
  getMaterials,
  getMaterialById,
  addMaterial,
  updateMaterial,
  bulkUpdateQuantities,
  bulkUpdateReorderPoints,
  adjustStock,
  exportMaterialsData,
  getLowStockAlerts,
  getFinishedGoods,
  getFinishedGoodById,
  adjustFinishedGoodStock,
  getBatchesForProduct,
  createWorkOrderForProduct,
  fulfillOrder,
  getOrderFulfillmentStatus,
  reserveForOrder,
  releaseOrderReservation,
  getMaterialRequirementsForWorkOrders,
  getMaterialsWithDemand
};

// Default export object containing all functions
const inventoryService = {
  getMaterials,
  getMaterialById,
  addMaterial,
  updateMaterial,
  bulkUpdateQuantities,
  bulkUpdateReorderPoints,
  adjustStock,
  exportMaterialsData,
  getLowStockAlerts,
  getFinishedGoods,
  getFinishedGoodById,
  adjustFinishedGoodStock,
  getBatchesForProduct,
  createWorkOrderForProduct,
  fulfillOrder,
  getOrderFulfillmentStatus,
  reserveForOrder,
  releaseOrderReservation,
  getMaterialRequirementsForWorkOrders,
  getMaterialsWithDemand
};

export default inventoryService;