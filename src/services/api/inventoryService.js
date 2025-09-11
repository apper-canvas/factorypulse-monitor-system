// Mock data for materials
const mockMaterials = [
  { Id: 1, name: 'Steel Sheet', currentStock: 150, unit: 'kg', reorderLevel: 100, supplier: 'MetalCorp Inc', lastUpdated: '2024-01-15', cost: 25.50 },
  { Id: 2, name: 'Aluminum Rod', currentStock: 75, unit: 'pieces', reorderLevel: 50, supplier: 'AluminumCo', lastUpdated: '2024-01-14', cost: 12.75 },
  { Id: 3, name: 'Copper Wire', currentStock: 25, unit: 'm', reorderLevel: 100, supplier: 'WireTech Ltd', lastUpdated: '2024-01-13', cost: 8.20 },
  { Id: 4, name: 'Plastic Pellets', currentStock: 200, unit: 'kg', reorderLevel: 150, supplier: 'PolyPlastics', lastUpdated: '2024-01-16', cost: 15.30 },
  { Id: 5, name: 'Rubber Gaskets', currentStock: 45, unit: 'pieces', reorderLevel: 80, supplier: 'RubberWorks', lastUpdated: '2024-01-12', cost: 3.45 },
  { Id: 6, name: 'Titanium Alloy', currentStock: 12, unit: 'kg', reorderLevel: 20, supplier: 'TitaniumTech', lastUpdated: '2024-01-11', cost: 125.00 }
];

// Mock data for finished goods
const mockFinishedGoods = [
  { Id: 1, name: 'Precision Valve A', available: 45, reserved: 5, total: 50, location: 'Warehouse A-1', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop' },
  { Id: 2, name: 'Motor Housing B', available: 28, reserved: 12, total: 40, location: 'Warehouse A-2', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&h=100&fit=crop' },
  { Id: 3, name: 'Control Panel C', available: 15, reserved: 3, total: 18, location: 'Warehouse B-1', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop' },
  { Id: 4, name: 'Hydraulic Pump D', available: 8, reserved: 2, total: 10, location: 'Warehouse B-2', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&h=100&fit=crop' },
  { Id: 5, name: 'Sensor Array E', available: 22, reserved: 8, total: 30, location: 'Warehouse C-1', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop' },
  { Id: 6, name: 'Safety Switch F', available: 35, reserved: 15, total: 50, location: 'Warehouse C-2', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&h=100&fit=crop' }
];

let materialsData = [...mockMaterials];
let finishedGoodsData = [...mockFinishedGoods];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get stock level status
const getStockLevel = (current, reorder) => {
  if (current <= reorder * 0.5) return 'critical';
  if (current <= reorder) return 'low';
  return 'adequate';
};

// Materials service methods
const getMaterials = async () => {
  await delay(800);
  return materialsData.map(material => ({
    ...material,
    stockLevel: getStockLevel(material.currentStock, material.reorderLevel)
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
  link.href = url;
  link.download = `materials-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  return { success: true, recordCount: materials.length };
}
// Finished goods service methods
const getFinishedGoods = async () => {
  await delay(800);
  return [...finishedGoodsData];
};

const getFinishedGoodById = async (id) => {
  await delay(400);
  return finishedGoodsData.find(fg => fg.Id === parseInt(id)) || null;
};

// Low stock alerts
const getLowStockAlerts = async () => {
  await delay(600);
  const materials = await getMaterials();
  const lowStockMaterials = materials.filter(m => m.stockLevel !== 'adequate');
  
  return lowStockMaterials.map(material => ({
    Id: material.Id,
    type: 'material',
    name: material.name,
    currentStock: material.currentStock,
    reorderLevel: material.reorderLevel,
    stockLevel: material.stockLevel,
    supplier: material.supplier,
    unit: material.unit
  }));
};

export const inventoryService = {
  getMaterials,
  getMaterialById,
  addMaterial,
updateMaterial,
  bulkUpdateQuantities,
  bulkUpdateReorderPoints,
  adjustStock,
  exportMaterialsData,
  getFinishedGoods,
  getFinishedGoodById,
  getLowStockAlerts
};