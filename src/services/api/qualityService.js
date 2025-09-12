// Initialize ApperClient for quality metrics operations
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Simple delay function for realistic API simulation
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Table name for quality metrics
const TABLE_NAME = 'quality_metric_c';

export async function getAll() {
  try {
    await delay(300);
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "line_id_c"}},
        {"field": {"Name": "defect_rate_c"}},
        {"field": {"Name": "pass_rate_c"}},
        {"field": {"Name": "total_inspected_c"}},
        {"field": {"Name": "total_defects_c"}},
        {"field": {"Name": "timestamp_c"}}
      ],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response?.success) {
      console.error('Error fetching quality metrics:', response?.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching quality metrics:', error?.message || error);
    return [];
  }
}

export async function getById(id) {
  try {
    await delay(200);
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "line_id_c"}},
        {"field": {"Name": "defect_rate_c"}},
        {"field": {"Name": "pass_rate_c"}},
        {"field": {"Name": "total_inspected_c"}},
        {"field": {"Name": "total_defects_c"}},
        {"field": {"Name": "timestamp_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
    
    if (!response?.success) {
      console.error(`Error fetching quality metric ${id}:`, response?.message);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching quality metric ${id}:`, error?.message || error);
    return null;
  }
}

export async function getByLineId(lineId) {
  try {
    await delay(300);
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "line_id_c"}},
        {"field": {"Name": "defect_rate_c"}},
        {"field": {"Name": "pass_rate_c"}},
        {"field": {"Name": "total_inspected_c"}},
        {"field": {"Name": "total_defects_c"}},
        {"field": {"Name": "timestamp_c"}}
      ],
      where: [{"FieldName": "line_id_c", "Operator": "ExactMatch", "Values": [lineId]}],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response?.success) {
      console.error(`Error fetching quality metrics for line ${lineId}:`, response?.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching quality metrics for line ${lineId}:`, error?.message || error);
    return [];
  }
}

export async function create(metricData) {
  try {
    await delay(400);
    const params = {
      records: [{
        Name: metricData.Name || `Quality Metric ${Date.now()}`,
        line_id_c: metricData.line_id_c,
        defect_rate_c: parseFloat(metricData.defect_rate_c) || 0.0,
        pass_rate_c: parseFloat(metricData.pass_rate_c) || 0.0,
        total_inspected_c: parseInt(metricData.total_inspected_c) || 0,
        total_defects_c: parseInt(metricData.total_defects_c) || 0,
        timestamp_c: metricData.timestamp_c || new Date().toISOString()
      }]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Error creating quality metric:', response.message);
      return null;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create quality metric:`, failed);
        return null;
      }
      
      return successful[0]?.data || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating quality metric:', error?.message || error);
    return null;
  }
}

export async function update(id, updateData) {
  try {
    await delay(350);
    const params = {
      records: [{
        Id: parseInt(id),
        ...(updateData.Name && { Name: updateData.Name }),
        ...(updateData.line_id_c && { line_id_c: updateData.line_id_c }),
        ...(updateData.defect_rate_c !== undefined && { defect_rate_c: parseFloat(updateData.defect_rate_c) }),
        ...(updateData.pass_rate_c !== undefined && { pass_rate_c: parseFloat(updateData.pass_rate_c) }),
        ...(updateData.total_inspected_c !== undefined && { total_inspected_c: parseInt(updateData.total_inspected_c) }),
        ...(updateData.total_defects_c !== undefined && { total_defects_c: parseInt(updateData.total_defects_c) }),
        ...(updateData.timestamp_c && { timestamp_c: updateData.timestamp_c })
      }]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Error updating quality metric:', response.message);
      return null;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update quality metric:`, failed);
        return null;
      }
      
      return successful[0]?.data || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating quality metric:', error?.message || error);
    return null;
  }
}

export async function remove(id) {
  try {
    await delay(300);
    const params = { 
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Error deleting quality metric:', response.message);
      return false;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete quality metric:`, failed);
        return false;
      }
      
      return successful.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting quality metric:', error?.message || error);
    return false;
  }
}

// Additional utility functions for quality metrics
export async function getQualityTrends(lineId, days = 7) {
  try {
    await delay(400);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "line_id_c"}},
        {"field": {"Name": "defect_rate_c"}},
        {"field": {"Name": "pass_rate_c"}},
        {"field": {"Name": "total_inspected_c"}},
        {"field": {"Name": "total_defects_c"}},
        {"field": {"Name": "timestamp_c"}}
      ],
      where: [
        {"FieldName": "line_id_c", "Operator": "ExactMatch", "Values": [lineId]},
        {"FieldName": "timestamp_c", "Operator": "GreaterThanOrEqualTo", "Values": [startDate.toISOString()]},
        {"FieldName": "timestamp_c", "Operator": "LessThanOrEqualTo", "Values": [endDate.toISOString()]}
      ],
      orderBy: [{"fieldName": "timestamp_c", "sorttype": "ASC"}]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response?.success) {
      console.error(`Error fetching quality trends for line ${lineId}:`, response?.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching quality trends for line ${lineId}:`, error?.message || error);
    return [];
  }
}

export async function getQualityOverview() {
  try {
    await delay(350);
const params = {
      fields: [
        {"field": {"Name": "total_inspected_c"}},
        {"field": {"Name": "total_defects_c"}},
        {"field": {"Name": "defect_rate_c"}},
        {"field": {"Name": "pass_rate_c"}},
        {"field": {"Name": "timestamp_c"}},
        {"field": {"Name": "line_id_c"}}
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response?.success) {
      console.error('Error fetching quality overview:', response?.message);
      return {
        overallDefectRate: 0,
        overallPassRate: 100,
        totalInspected: 0,
        totalDefects: 0,
        recentMetrics: []
      };
    }
    
    const metrics = response.data || [];
    const totalInspected = metrics.reduce((sum, m) => sum + (m.total_inspected_c || 0), 0);
    const totalDefects = metrics.reduce((sum, m) => sum + (m.total_defects_c || 0), 0);
    const overallDefectRate = totalInspected > 0 ? (totalDefects / totalInspected) * 100 : 0;
    const overallPassRate = 100 - overallDefectRate;
    
    const recentMetrics = metrics
      .sort((a, b) => new Date(b.timestamp_c) - new Date(a.timestamp_c))
      .slice(0, 10);
    
    return {
      overallDefectRate: Number(overallDefectRate.toFixed(2)),
      overallPassRate: Number(overallPassRate.toFixed(2)),
      totalInspected,
      totalDefects,
      recentMetrics
    };
  } catch (error) {
    console.error('Error fetching quality overview:', error?.message || error);
    return {
      overallDefectRate: 0,
      overallPassRate: 100,
      totalInspected: 0,
      totalDefects: 0,
      recentMetrics: []
    };
  }
}

export default {
  getAll,
  getById,
  getByLineId,
  create,
  update,
  remove,
  getQualityTrends,
  getQualityOverview
};