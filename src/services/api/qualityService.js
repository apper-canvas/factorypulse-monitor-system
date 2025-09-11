import qualityMetricsData from "@/services/mockData/qualityMetrics.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let qualityMetrics = [...qualityMetricsData];

export const getAll = async () => {
  await delay(200);
  return [...qualityMetrics];
};

export const getById = async (id) => {
  await delay(150);
  const metric = qualityMetrics.find(item => item.Id === parseInt(id));
  if (!metric) {
    throw new Error("Quality metric not found");
  }
  return { ...metric };
};

export const getByLineId = async (lineId) => {
  await delay(200);
  const metrics = qualityMetrics.filter(item => item.lineId === lineId.toString());
  return metrics.map(metric => ({ ...metric }));
};

export const create = async (metricData) => {
  await delay(300);
  const maxId = Math.max(...qualityMetrics.map(item => item.Id), 0);
  const newMetric = {
    Id: maxId + 1,
    ...metricData,
    timestamp: new Date().toISOString()
  };
  qualityMetrics.push(newMetric);
  return { ...newMetric };
};

export const update = async (id, updates) => {
  await delay(250);
  const index = qualityMetrics.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Quality metric not found");
  }
  qualityMetrics[index] = { 
    ...qualityMetrics[index], 
    ...updates,
    timestamp: new Date().toISOString()
  };
  return { ...qualityMetrics[index] };
};

export const remove = async (id) => {
  await delay(200);
  const index = qualityMetrics.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Quality metric not found");
  }
  const deleted = qualityMetrics.splice(index, 1)[0];
  return { ...deleted };
};