import alertsData from "@/services/mockData/alerts.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let alerts = [...alertsData];

export const getAll = async () => {
  await delay(200);
  // Sort by timestamp (newest first) and then by priority
  const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
  return [...alerts].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged - b.acknowledged; // Unacknowledged first
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]; // Higher priority first
    }
    return new Date(b.timestamp) - new Date(a.timestamp); // Newer first
  });
};

export const getById = async (id) => {
  await delay(150);
  const alert = alerts.find(item => item.Id === parseInt(id));
  if (!alert) {
    throw new Error("Alert not found");
  }
  return { ...alert };
};

export const getUnacknowledged = async () => {
  await delay(200);
  const unacknowledged = alerts.filter(alert => !alert.acknowledged);
  const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
  return unacknowledged.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
};

export const create = async (alertData) => {
  await delay(300);
  const maxId = Math.max(...alerts.map(item => item.Id), 0);
  const newAlert = {
    Id: maxId + 1,
    ...alertData,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };
  alerts.push(newAlert);
  return { ...newAlert };
};

export const update = async (id, updates) => {
  await delay(250);
  const index = alerts.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Alert not found");
  }
  alerts[index] = { 
    ...alerts[index], 
    ...updates
  };
  return { ...alerts[index] };
};

export const acknowledge = async (id) => {
  return update(id, { acknowledged: true });
};

export const remove = async (id) => {
  await delay(200);
  const index = alerts.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Alert not found");
  }
  const deleted = alerts.splice(index, 1)[0];
  return { ...deleted };
};