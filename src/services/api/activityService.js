import activitiesData from "@/services/mockData/activities.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let activities = [...activitiesData];

export const getAll = async () => {
  await delay(200);
  // Sort by timestamp (newest first)
  return [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

export const getById = async (id) => {
  await delay(150);
  const activity = activities.find(item => item.Id === parseInt(id));
  if (!activity) {
    throw new Error("Activity not found");
  }
  return { ...activity };
};

export const getRecent = async (limit = 10) => {
  await delay(200);
  const sorted = [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  return sorted.slice(0, limit);
};

export const getByType = async (type) => {
  await delay(200);
  const filtered = activities.filter(activity => 
    activity.type.toLowerCase() === type.toLowerCase()
  );
  return filtered.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

export const create = async (activityData) => {
  await delay(300);
  const maxId = Math.max(...activities.map(item => item.Id), 0);
  const newActivity = {
    Id: maxId + 1,
    ...activityData,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity); // Add to beginning for newest first
  return { ...newActivity };
};

export const update = async (id, updates) => {
  await delay(250);
  const index = activities.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Activity not found");
  }
  activities[index] = { 
    ...activities[index], 
    ...updates
  };
  return { ...activities[index] };
};

export const remove = async (id) => {
  await delay(200);
  const index = activities.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Activity not found");
  }
  const deleted = activities.splice(index, 1)[0];
  return { ...deleted };
};