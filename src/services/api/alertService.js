// Helper function to get ApperClient instance
function getApperClient() {
  if (!window.ApperSDK) {
    console.error('ApperSDK not available');
    return null;
  }
  
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
}

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const getAll = async () => {
  await delay(200);
  const apperClient = getApperClient();
  if (!apperClient) {
    throw new Error('ApperClient not initialized');
  }

  const params = {
    fields: [
      { field: { Name: "Id" } },
      { field: { Name: "message_c" } },
      { field: { Name: "priority_c" } },
      { field: { Name: "status_c" } },
      { field: { Name: "type_c" } },
      { field: { Name: "source_c" } },
      { field: { Name: "timestamp_c" } }
    ]
  };

  const response = await apperClient.getRecords('alert_c', params);
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch alerts');
  }

  const alerts = response.data || [];
  
  // Sort by timestamp (newest first) and then by priority
  const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
  return alerts.sort((a, b) => {
    const aStatus = a.status_c || 'unacknowledged';
    const bStatus = b.status_c || 'unacknowledged';
    const aAcknowledged = aStatus === 'acknowledged';
    const bAcknowledged = bStatus === 'acknowledged';
    
    if (aAcknowledged !== bAcknowledged) {
      return aAcknowledged - bAcknowledged; // Unacknowledged first
    }
    const aPriority = priorityOrder[a.priority_c] || 0;
    const bPriority = priorityOrder[b.priority_c] || 0;
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    const aTime = new Date(a.timestamp_c || 0);
    const bTime = new Date(b.timestamp_c || 0);
    return bTime - aTime; // Newer first
  });
};

export const getById = async (id) => {
  await delay(150);
const apperClient = getApperClient();
  if (!apperClient) {
    throw new Error('ApperClient not initialized');
  }

  const params = {
    fields: [
      { field: { Name: "Id" } },
      { field: { Name: "message_c" } },
      { field: { Name: "priority_c" } },
      { field: { Name: "status_c" } },
      { field: { Name: "type_c" } },
      { field: { Name: "source_c" } },
      { field: { Name: "timestamp_c" } }
    ]
  };

  const response = await apperClient.getRecordById('alert_c', id, params);
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch alert');
  }

  const alert = response.data;
  if (!alert) {
    throw new Error("Alert not found");
  }
  return { ...alert };
};

export const getUnacknowledged = async () => {
  await delay(200);
  const allAlerts = await getAll();
  const unacknowledged = allAlerts.filter(alert => {
    const status = alert.status_c || 'unacknowledged';
    return status !== 'acknowledged';
  });
  
  const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
  return unacknowledged.sort((a, b) => {
    const aPriority = priorityOrder[a.priority_c] || 0;
    const bPriority = priorityOrder[b.priority_c] || 0;
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    const aTime = new Date(a.timestamp_c || 0);
    const bTime = new Date(b.timestamp_c || 0);
    return bTime - aTime;
  });
};

export const create = async (alertData) => {
  await delay(300);
const apperClient = getApperClient();
  if (!apperClient) {
    throw new Error('ApperClient not initialized');
  }

  const params = {
    records: [{
      message_c: alertData.message,
      priority_c: alertData.priority,
      status_c: alertData.status || 'unacknowledged',
      type_c: alertData.type,
      source_c: alertData.source,
      timestamp_c: new Date().toISOString()
    }]
  };

  const response = await apperClient.createRecord('alert_c', params);
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to create alert');
  }

if (response.results && response.results.length > 0) {
    const result = response.results[0];
    if (!result.success) {
      throw new Error(result.message || 'Failed to create alert');
    }
    return result.data;
  }

  return response.data;
};

export const update = async (id, updates) => {
  await delay(250);
const apperClient = getApperClient();
  if (!apperClient) {
    throw new Error('ApperClient not initialized');
  }

const updateRecord = {
    Id: parseInt(id)
  };
  
  if (updates.message !== undefined) updateRecord.message_c = updates.message;
  if (updates.priority !== undefined) updateRecord.priority_c = updates.priority;
  if (updates.status !== undefined) updateRecord.status_c = updates.status;
  if (updates.type !== undefined) updateRecord.type_c = updates.type;
  if (updates.source !== undefined) updateRecord.source_c = updates.source;
  if (updates.acknowledged !== undefined) {
    updateRecord.status_c = updates.acknowledged ? 'acknowledged' : 'unacknowledged';
  }
  
  const params = {
    records: [updateRecord]
  };

  const response = await apperClient.updateRecord('alert_c', params);
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to update alert');
  }

  if (response.results && response.results.length > 0) {
    const result = response.results[0];
    if (!result.success) {
      throw new Error(result.message || 'Failed to update alert');
    }
    return result.data;
  }

  return response.data;
};

export const acknowledge = async (id) => {
  return update(id, { acknowledged: true });
};

export const remove = async (id) => {
  await delay(200);
const apperClient = getApperClient();
  if (!apperClient) {
    throw new Error('ApperClient not initialized');
  }

  const params = {
    RecordIds: [parseInt(id)]
  };

  const response = await apperClient.deleteRecord('alert_c', params);
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete alert');
  }

if (response.results && response.results.length > 0) {
    const result = response.results[0];
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete alert');
    }
    return true;
  }

  return true;
};