// Activity service using Apper Backend database integration
const tableName = 'activity_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const getAll = async () => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "type_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "timestamp_c"}},
        {"field": {"Name": "user_c"}},
        {"field": {"Name": "related_entity_c"}}
      ],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch activities:', error?.response?.data?.message || error);
    throw new Error('Failed to load activities');
  }
};

export const getById = async (id) => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "type_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "timestamp_c"}},
        {"field": {"Name": "user_c"}},
        {"field": {"Name": "related_entity_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (!response.data) {
      throw new Error("Activity not found");
    }
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch activity ${id}:`, error?.response?.data?.message || error);
    throw error;
  }
};

export const getRecent = async (limit = 10) => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "type_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "timestamp_c"}},
        {"field": {"Name": "user_c"}},
        {"field": {"Name": "related_entity_c"}}
      ],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": limit, "offset": 0}
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch recent activities:', error?.response?.data?.message || error);
    throw new Error('Failed to load recent activities');
  }
};

export const getByType = async (type) => {
  try {
    const apperClient = getApperClient();
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "type_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "timestamp_c"}},
        {"field": {"Name": "user_c"}},
        {"field": {"Name": "related_entity_c"}}
      ],
      where: [{"FieldName": "type_c", "Operator": "EqualTo", "Values": [type]}],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch activities by type:', error?.response?.data?.message || error);
    throw new Error('Failed to load activities by type');
  }
};

export const create = async (activityData) => {
  try {
    const apperClient = getApperClient();
    const params = {
      records: [{
        Name: activityData.Name || activityData.name || 'New Activity',
        Tags: activityData.Tags || activityData.tags || '',
        type_c: activityData.type_c || activityData.type,
        description_c: activityData.description_c || activityData.description,
        timestamp_c: new Date().toISOString(),
        user_c: activityData.user_c || activityData.user || 'System',
        related_entity_c: activityData.related_entity_c || activityData.related_entity || ''
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} activities:${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        return successful[0].data;
      }
    }
    
    throw new Error('Failed to create activity');
  } catch (error) {
    console.error('Failed to create activity:', error?.response?.data?.message || error);
    throw error;
  }
};

export const update = async (id, updates) => {
  try {
    const apperClient = getApperClient();
    const updateData = {
      Id: parseInt(id)
    };
    
    // Only include updateable fields
    if (updates.Name !== undefined) updateData.Name = updates.Name;
    if (updates.Tags !== undefined) updateData.Tags = updates.Tags;
    if (updates.type_c !== undefined) updateData.type_c = updates.type_c;
    if (updates.description_c !== undefined) updateData.description_c = updates.description_c;
    if (updates.timestamp_c !== undefined) updateData.timestamp_c = updates.timestamp_c;
    if (updates.user_c !== undefined) updateData.user_c = updates.user_c;
    if (updates.related_entity_c !== undefined) updateData.related_entity_c = updates.related_entity_c;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} activities:${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      if (successful.length > 0) {
        return successful[0].data;
      }
    }
    
    throw new Error('Failed to update activity');
  } catch (error) {
    console.error(`Failed to update activity ${id}:`, error?.response?.data?.message || error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const apperClient = getApperClient();
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} activities:${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successful.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to delete activity ${id}:`, error?.response?.data?.message || error);
    throw error;
  }
};