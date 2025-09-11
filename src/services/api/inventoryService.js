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
  getFinishedGoods,
  getFinishedGoodById,
  getLowStockAlerts
};