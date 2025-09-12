import inventoryService from "@/services/api/inventoryService";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = 'work_order_c';

export const getAll = async () => {
  try {
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "job_id_c"}},
        {"field": {"Name": "product_name_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "customer_name_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "created_date_c"}},
        {"field": {"Name": "assigned_line_c"}},
        {"field": {"Name": "current_stage_c"}},
        {"field": {"Name": "stage_progress_c"}},
        {"field": {"Name": "material_requirements_c"}},
        {"field": {"Name": "stages_c"}},
        {"field": {"Name": "estimated_material_cost_c"}},
        {"field": {"Name": "order_id_c"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Failed to fetch work orders:', response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return [];
  }
};

export const getById = async (id) => {
  try {
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "job_id_c"}},
        {"field": {"Name": "product_name_c"}},
        {"field": {"Name": "quantity_c"}},
        {"field": {"Name": "priority_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "customer_name_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "created_date_c"}},
        {"field": {"Name": "assigned_line_c"}},
        {"field": {"Name": "current_stage_c"}},
        {"field": {"Name": "stage_progress_c"}},
        {"field": {"Name": "material_requirements_c"}},
        {"field": {"Name": "stages_c"}},
        {"field": {"Name": "estimated_material_cost_c"}},
        {"field": {"Name": "order_id_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
    
    if (!response.success) {
      console.error(`Failed to fetch work order ${id}:`, response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    return null;
  }
};

export const create = async (workOrderData) => {
  try {
    // Generate job ID
    const timestamp = Date.now();
    const jobId = `WO-2024-${String(timestamp).slice(-6)}`;
    
    // Check material availability and calculate requirements
    let materialRequirements = workOrderData.materialRequirements || [];
    
    // If no material requirements provided, generate realistic ones based on product
    if (!materialRequirements.length && workOrderData.product_name_c && workOrderData.quantity_c) {
      const baseRequirements = [
        {
          name: `${workOrderData.product_name_c} - Raw Materials`,
          required: parseInt(workOrderData.quantity_c),
          unit: 'units'
        },
        {
          name: `${workOrderData.product_name_c} - Components`,
          required: Math.ceil(parseInt(workOrderData.quantity_c) * 1.2), // 20% more components
          unit: 'units'
        },
        {
          name: 'Packaging Materials',
          required: parseInt(workOrderData.quantity_c),
          unit: 'units'
        }
      ];
      
      // Get real inventory data to check availability
      try {
        const materials = await inventoryService.getMaterials();
        materialRequirements = baseRequirements.map(req => {
          // Try to find matching material in inventory
          const inventoryMatch = materials.find(m => 
            m.name_c?.toLowerCase().includes(req.name.toLowerCase().split(' - ')[0]) ||
            req.name.toLowerCase().includes(m.name_c?.toLowerCase() || '')
          );
          
          if (inventoryMatch) {
            return {
              ...req,
              available: inventoryMatch.current_stock_c,
              materialId: inventoryMatch.Id,
              status: inventoryMatch.current_stock_c >= req.required ? 'Available' : 
                     inventoryMatch.current_stock_c > 0 ? 'Low' : 'Critical'
            };
          }
          
          // Mock availability for non-matching materials
          const mockAvailable = Math.floor(req.required * (0.6 + Math.random() * 0.4));
          return {
            ...req,
            available: mockAvailable,
            status: mockAvailable >= req.required ? 'Available' : 
                   mockAvailable > 0 ? 'Low' : 'Critical'
          };
        });
      } catch (error) {
        console.error('Failed to check material availability:', error);
        // Fallback to mock data
        materialRequirements = baseRequirements.map(req => ({
          ...req,
          available: Math.floor(req.required * 0.8),
          status: 'Available'
        }));
      }
    } else if (materialRequirements.length) {
      // Validate existing material requirements with inventory
      materialRequirements = await checkMaterialAvailability(materialRequirements);
    }

    // Calculate estimated costs
    const estimatedMaterialCost = materialRequirements.reduce((total, req) => {
      const unitCost = req.unitCost || (Math.random() * 50 + 10); // Random cost between $10-60
      return total + (req.required * unitCost);
    }, 0);

    // Create default stages
    const stages = [
      {
        name: "Setup",
        status: "Pending",
        progress: 0,
        startTime: null,
        endTime: null
      },
      {
        name: "Production",
        status: "Pending",
        progress: 0,
        startTime: null,
        endTime: null
      },
      {
        name: "Quality Check",
        status: "Pending",
        progress: 0,
        startTime: null,
        endTime: null
      },
      {
        name: "Complete",
        status: "Pending",
        progress: 0,
        startTime: null,
        endTime: null
      }
    ];
    
    const params = {
      records: [{
        Name: workOrderData.Name || `Work Order - ${workOrderData.product_name_c}`,
        job_id_c: jobId,
        product_name_c: workOrderData.product_name_c,
        quantity_c: parseInt(workOrderData.quantity_c),
        priority_c: workOrderData.priority_c || 'Medium',
        status_c: workOrderData.status_c || 'Pending',
        customer_name_c: workOrderData.customer_name_c,
        due_date_c: workOrderData.due_date_c,
        created_date_c: new Date().toISOString(),
        assigned_line_c: workOrderData.assigned_line_c || 'Line 1',
        current_stage_c: 'Setup',
        stage_progress_c: 0,
        material_requirements_c: JSON.stringify(materialRequirements),
        stages_c: JSON.stringify(stages),
        estimated_material_cost_c: estimatedMaterialCost,
        order_id_c: workOrderData.order_id_c || null
      }]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Failed to create work order:', response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create work order:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successful[0]?.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};

export const update = async (id, updates) => {
  try {
    // Only include updateable fields
    const updateData = {};
    const updateableFields = ['Name', 'job_id_c', 'product_name_c', 'quantity_c', 'priority_c', 'status_c', 'customer_name_c', 'due_date_c', 'created_date_c', 'assigned_line_c', 'current_stage_c', 'stage_progress_c', 'material_requirements_c', 'stages_c', 'estimated_material_cost_c', 'order_id_c'];
    
    updateableFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });
    
    const params = {
      records: [{
        Id: parseInt(id),
        ...updateData
      }]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Failed to update work order:', response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update work order:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successful[0]?.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
};

export const updateStage = async (id, stageIndex, stageData) => {
  try {
    // First get the current work order
    const workOrder = await getById(id);
    if (!workOrder) {
      throw new Error("Work order not found");
    }
    
    // Parse stages from database
    let stages = [];
    try {
      stages = workOrder.stages_c ? JSON.parse(workOrder.stages_c) : [];
    } catch (e) {
      console.error('Failed to parse stages:', e);
      stages = [];
    }
    
    // Update the specific stage
    if (stages[stageIndex]) {
      stages[stageIndex] = { ...stages[stageIndex], ...stageData };
      
      // Update current stage and overall progress
      if (stageData.status === "In Progress" && !stages[stageIndex].startTime) {
        stages[stageIndex].startTime = new Date().toISOString();
      }
      
      if (stageData.status === "Complete") {
        stages[stageIndex].endTime = new Date().toISOString();
        stages[stageIndex].progress = 100;
      }
    }
    
    // Update overall status based on stages
    const completedStages = stages.filter(stage => stage.status === "Complete").length;
    const inProgressStages = stages.filter(stage => stage.status === "In Progress").length;
    
    let status = "Pending";
    let currentStage = stages[0]?.name || "Setup";
    
    if (completedStages === stages.length) {
      status = "Complete";
      currentStage = "Complete";
    } else if (inProgressStages > 0) {
      status = "In Progress";
      // Find current active stage
      const activeStage = stages.find(stage => stage.status === "In Progress");
      if (activeStage) currentStage = activeStage.name;
    }
    
    // Calculate overall progress percentage
    const totalProgress = stages.reduce((sum, stage) => sum + (stage.progress || 0), 0);
    const stageProgress = Math.round(totalProgress / stages.length);
    
    // Check for overdue status
    const now = new Date();
    const dueDate = new Date(workOrder.due_date_c);
    if (now > dueDate && status !== "Complete") {
      status = "Overdue";
    }
    
    // Update the work order
    const updates = {
      stages_c: JSON.stringify(stages),
      status_c: status,
      current_stage_c: currentStage,
      stage_progress_c: stageProgress
    };
    
    const updatedWorkOrder = await update(id, updates);
    
    // Update linked order to Ready status when work order completes
    if (status === "Complete" && workOrder.order_id_c) {
      try {
        const { updateStatus } = await import('@/services/api/orderService');
        await updateStatus(workOrder.order_id_c, 'Ready', 'Production completed - ready for shipping');
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    }
    
    return updatedWorkOrder;
  } catch (error) {
    console.error('Error updating work order stage:', error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error('Failed to delete work order:', response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete work order:`, failed);
        failed.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successful.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting work order:', error);
    throw error;
  }
};

export const getMetrics = async () => {
  try {
    const workOrders = await getAll();
    const total = workOrders.length;
    const pending = workOrders.filter(wo => (wo.status_c || wo.status) === "Pending").length;
    const inProgress = workOrders.filter(wo => (wo.status_c || wo.status) === "In Progress").length;
    const completed = workOrders.filter(wo => (wo.status_c || wo.status) === "Complete").length;
    const overdue = workOrders.filter(wo => (wo.status_c || wo.status) === "Overdue").length;
    
    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error calculating work order metrics:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0
    };
  }
};

// Enhanced material availability check with real inventory integration
export const checkMaterialAvailability = async (materialRequirements) => {
  try {
    // Get current inventory data
    const materials = await inventoryService.getMaterials();
    
    return materialRequirements.map(requirement => {
      let available = requirement.available;
      let materialId = requirement.materialId;
      let costPerUnit = requirement.costPerUnit || 5;
      
      // Try to find matching material in current inventory
      if (requirement.materialId) {
        const inventoryItem = materials.find(m => m.Id === requirement.materialId);
        if (inventoryItem) {
          available = inventoryItem.current_stock_c || inventoryItem.currentStock;
          costPerUnit = inventoryItem.cost_c || inventoryItem.cost || costPerUnit;
        }
      } else if (requirement.name) {
        // Try name-based matching
        const inventoryMatch = materials.find(m => 
          (m.name_c || m.name || '').toLowerCase().includes(requirement.name.toLowerCase()) ||
          requirement.name.toLowerCase().includes((m.name_c || m.name || '').toLowerCase())
        );
        
        if (inventoryMatch) {
          available = inventoryMatch.current_stock_c || inventoryMatch.currentStock;
          materialId = inventoryMatch.Id;
          costPerUnit = inventoryMatch.cost_c || inventoryMatch.cost || costPerUnit;
        }
      }
      
      const availabilityRatio = available / requirement.required;
      let status = "Available";
      
      if (availabilityRatio === 0) {
        status = "Critical";
      } else if (availabilityRatio < 1) {
        status = "Low";
      }
      
      return {
        ...requirement,
        available,
        materialId,
        costPerUnit,
        status,
        shortfall: Math.max(0, requirement.required - available),
        totalCost: requirement.required * costPerUnit,
        availabilityPercentage: Math.round(Math.min(100, availabilityRatio * 100))
      };
    });
  } catch (error) {
    console.error('Failed to check real inventory:', error);
    
    // Fallback to basic availability check
    return materialRequirements.map(material => {
      const available = material.available || 0;
      const availabilityRatio = available / material.required;
      let status = "Available";
      
      if (availabilityRatio === 0) {
        status = "Critical";
      } else if (availabilityRatio < 1) {
        status = "Low";
      }
      
      return {
        ...material,
        available,
        status,
        shortfall: Math.max(0, material.required - available),
        availabilityPercentage: Math.round(Math.min(100, availabilityRatio * 100))
      };
    });
  }
};

// Calculate material consumption for work order completion
export const calculateMaterialConsumption = (workOrder) => {
  let materialRequirements = [];
  
  // Handle both database and fallback field names
  if (workOrder.material_requirements_c) {
    try {
      materialRequirements = JSON.parse(workOrder.material_requirements_c);
    } catch (e) {
      console.error('Failed to parse material requirements:', e);
    }
  } else if (workOrder.materialRequirements) {
    materialRequirements = workOrder.materialRequirements;
  }
  
  if (!materialRequirements.length) return [];
  
  return materialRequirements.map(requirement => ({
    materialId: requirement.materialId,
    materialName: requirement.name,
    consumedQuantity: requirement.required,
    unit: requirement.unit || 'units',
    workOrderId: workOrder.Id,
    consumptionDate: new Date().toISOString()
  }));
};

// Get work orders requiring specific materials
export const getWorkOrdersByMaterial = async (materialId) => {
  try {
    const workOrders = await getAll();
    
    return workOrders.filter(wo => {
      let materialRequirements = [];
      
      // Handle both database and fallback field names
      if (wo.material_requirements_c) {
        try {
          materialRequirements = JSON.parse(wo.material_requirements_c);
        } catch (e) {
          console.error('Failed to parse material requirements:', e);
        }
      } else if (wo.materialRequirements) {
        materialRequirements = wo.materialRequirements;
      }
      
      return materialRequirements.some(req => req.materialId === parseInt(materialId));
    }).map(wo => {
      let materialRequirements = [];
      
      if (wo.material_requirements_c) {
        try {
          materialRequirements = JSON.parse(wo.material_requirements_c);
        } catch (e) {
          materialRequirements = [];
        }
      } else if (wo.materialRequirements) {
        materialRequirements = wo.materialRequirements;
      }
      
      return {
        ...wo,
        requiredQuantity: materialRequirements.find(req => 
          req.materialId === parseInt(materialId)
        )?.required || 0
      };
    });
  } catch (error) {
    console.error('Error getting work orders by material:', error);
    return [];
  }
};