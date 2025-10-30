// ApperClient initialization function
function getApperClient() {
  if (!window.ApperSDK) {
    console.warn('ApperSDK not available on window object');
    return null;
  }

  const { ApperClient } = window.ApperSDK;
  const projectId = import.meta.env.VITE_APPER_PROJECT_ID;
  const publicKey = import.meta.env.VITE_APPER_PUBLIC_KEY;

  if (!projectId) {
    console.error('VITE_APPER_PROJECT_ID is required');
    return null;
  }

  return new ApperClient({
    apperProjectId: projectId,
    apperPublicKey: publicKey,
  });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Machine service using ApperClient for database operations
const tableName = 'machine_c';

// In-memory storage for machines
let machines = [];
export const getAll = async () => {
  await delay(250);
  return [...machines];
};

export const getById = async (id) => {
  await delay(200);
  const machine = machines.find(item => item.Id === parseInt(id));
  if (!machine) {
    throw new Error("Machine not found");
  }
  return { ...machine };
};

export const create = async (machineData) => {
  await delay(400);
  const maxId = Math.max(...machines.map(item => item.Id), 0);
  const newMachine = {
    Id: maxId + 1,
    ...machineData,
    lastMaintenance: new Date().toISOString()
  };
  machines.push(newMachine);
  return { ...newMachine };
};

export const update = async (id, updates) => {
  await delay(300);
  const index = machines.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Machine not found");
  }
  machines[index] = { 
    ...machines[index], 
    ...updates
  };
  return { ...machines[index] };
};

export const remove = async (id) => {
  await delay(250);
  const index = machines.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Machine not found");
  }
  const deleted = machines.splice(index, 1)[0];
  return { ...deleted };
};