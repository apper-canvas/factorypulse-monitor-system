// Production line data will be fetched from Apper Backend using ApperClient

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Production lines data array
let productionLines = [
  {
    Id: 1,
    name: "Line A",
    status: "active",
    efficiency: 92,
    lastUpdate: new Date().toISOString()
  },
  {
    Id: 2,
    name: "Line B",
    status: "active",
    efficiency: 88,
    lastUpdate: new Date().toISOString()
  },
  {
    Id: 3,
    name: "Line C",
    status: "maintenance",
    efficiency: 0,
    lastUpdate: new Date().toISOString()
  }
];

export const getAll = async () => {
  await delay(300);
  return [...productionLines];
};

export const getById = async (id) => {
  await delay(200);
  const line = productionLines.find(item => item.Id === parseInt(id));
  if (!line) {
    throw new Error("Production line not found");
  }
  return { ...line };
};

export const create = async (lineData) => {
  await delay(400);
  const maxId = Math.max(...productionLines.map(item => item.Id), 0);
  const newLine = {
    Id: maxId + 1,
    ...lineData,
    lastUpdate: new Date().toISOString()
  };
  productionLines.push(newLine);
  return { ...newLine };
};

export const update = async (id, updates) => {
  await delay(300);
  const index = productionLines.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Production line not found");
  }
  productionLines[index] = { 
    ...productionLines[index], 
    ...updates,
    lastUpdate: new Date().toISOString()
  };
  return { ...productionLines[index] };
};

export const remove = async (id) => {
  await delay(250);
  const index = productionLines.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Production line not found");
  }
  const deleted = productionLines.splice(index, 1)[0];
  return { ...deleted };
};

// Re-export work order service functions for integrated access
export { 
  getAll as getAllWorkOrders,
  getById as getWorkOrderById,
  create as createWorkOrder,
  update as updateWorkOrder,
  remove as removeWorkOrder,
  getMetrics as getWorkOrderMetrics
} from '@/services/api/workOrderService';