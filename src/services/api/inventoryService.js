import mockMaterials from "@/services/mockData/materials.json";

// ApperClient for database operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

let materialsData = [...mockMaterials];
// Database table name for finished goods
const FINISHED_GOODS_TABLE = 'finished_good_c';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Get stock level status
const getStockLevel = (current, reorder) => {
  if (current <= reorder * 0.5) return 'critical';
  if (current <= reorder) return 'low';
  return 'adequate';
};

// Order fulfillment tracking
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
const getMaterials = async () => {
  await delay(800);
  return materialsData.map(material => ({
    ...material,
    stockLevel: getStockLevel(material.currentStock, material.reorderLevel),
    reservations: orderReservations.filter(r => r.productName.toLowerCase().includes(material.name.toLowerCase()))
  }));
};

const getMaterialById = async (id) => {
  await delay(400);
  const material = materialsData.find(m => m.Id === parseInt(id));
  if (!material) return null;
    ...material,
    stockLevel: getStockLevel(material.currentStock, material.reorderLevel),
    reservations: orderReservations.filter(r => r.productName.toLowerCase().includes(material.name.toLowerCase()))
  }));
};

const getMaterialById = async (id) => {
  await delay(400);
  const material = materialsData.find(m => m.Id === parseInt(id));
  if (!material) return null;
  return {
    ...material,
    stockLevel: getStockLevel(material.currentStock, material.reorderLevel)
  };
};

const addMaterial = async (materialData) => {
  await delay(600);
  const newId = Math.max(...materialsData.map(m => m.Id), 0) + 1;
  const newMaterial = {
    ...materialData,
    Id: newId,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  materialsData.push(newMaterial);
  return {
    ...newMaterial,
    stockLevel: getStockLevel(newMaterial.currentStock, newMaterial.reorderLevel)
  };
};

const updateMaterial = async (id, data) => {
  await delay(600);
  const index = materialsData.findIndex(m => m.Id === parseInt(id));
  if (index === -1) throw new Error('Material not found');
  
  materialsData[index] = { ...materialsData[index], ...data, Id: parseInt(id) };
  return {
    ...materialsData[index],
    stockLevel: getStockLevel(materialsData[index].currentStock, materialsData[index].reorderLevel)
  };
};
// Bulk operations
async function bulkUpdateQuantities(updates) {
  await delay(800);
  
  try {
    const materials = await getMaterials();
    let updatedCount = 0;
    
    const updatedMaterials = materials.map(material => {
      const update = updates.find(u => u.id === material.Id);
      if (update && update.quantity !== undefined) {
        updatedCount++;
        return {
          ...material,
          currentStock: update.quantity,
          stockLevel: getStockLevel(update.quantity, material.reorderLevel),
          lastUpdated: new Date().toLocaleDateString()
        };
      }
      return material;
    });
    
    // Simulate saving to storage
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    return { success: true, updatedCount };
  } catch (error) {
    throw new Error('Failed to update quantities in bulk');
  }
}

async function bulkUpdateReorderPoints(updates) {
  await delay(800);
  
  try {
    const materials = await getMaterials();
    let updatedCount = 0;
    
    const updatedMaterials = materials.map(material => {
      const update = updates.find(u => u.id === material.Id);
      if (update && update.reorderLevel !== undefined) {
        updatedCount++;
        return {
          ...material,
          reorderLevel: update.reorderLevel,
          stockLevel: getStockLevel(material.currentStock, update.reorderLevel),
          lastUpdated: new Date().toLocaleDateString()
        };
      }
      return material;
    });
    
    // Simulate saving to storage
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    return { success: true, updatedCount };
  } catch (error) {
    throw new Error('Failed to update reorder points in bulk');
  }
}

async function adjustStock(materialId, adjustment, reason = '') {
  await delay(500);
  
  try {
    const materials = await getMaterials();
    const materialIndex = materials.findIndex(m => m.Id === materialId);
    
    if (materialIndex === -1) {
      throw new Error('Material not found');
    }
    
    const material = materials[materialIndex];
    const newStock = Math.max(0, material.currentStock + adjustment);
    
    materials[materialIndex] = {
      ...material,
      currentStock: newStock,
      stockLevel: getStockLevel(newStock, material.reorderLevel),
      lastUpdated: new Date().toLocaleDateString()
    };
    
    // Simulate saving to storage
    localStorage.setItem('materials', JSON.stringify(materials));
    
    // Log adjustment (in real app, this would go to audit log)
    const adjustmentLog = {
      materialId,
      materialName: material.name,
      previousStock: material.currentStock,
      adjustment,
      newStock,
      reason,
      timestamp: new Date().toISOString(),
      user: 'Current User'
    };
    
    return { success: true, newStock, adjustmentLog };
  } catch (error) {
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
  
  // Return mock status for now - this would typically check order records
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
      Id: Date.now(), // Simple ID generation for mock
      productName: product.name_c || product.Name,
      productId: productId,
      quantity: quantity,
      priority: priority,
      status: 'planned',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
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
  // For now, return mock data showing material demand
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