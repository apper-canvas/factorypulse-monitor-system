import workOrdersData from "@/services/mockData/workOrders.json";
import inventoryService from "@/services/api/inventoryService";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let workOrders = [...workOrdersData];

export const getAll = async () => {
  await delay(300);
  return [...workOrders];
};

export const getById = async (id) => {
  await delay(200);
  const workOrder = workOrders.find(item => item.Id === parseInt(id));
  if (!workOrder) {
    throw new Error("Work order not found");
  }
  return { ...workOrder };
};

export const create = async (workOrderData) => {
  await delay(400);
  const maxId = Math.max(...workOrders.map(item => item.Id), 0);
  const maxJobNumber = Math.max(...workOrders.map(item => parseInt(item.jobId.split('-')[2])), 0);
  
  // Check material availability and calculate requirements
  let materialRequirements = workOrderData.materialRequirements || [];
  
  // If no material requirements provided, generate realistic ones based on product
  if (!materialRequirements.length && workOrderData.productName && workOrderData.quantity) {
    const baseRequirements = [
      {
        name: `${workOrderData.productName} - Raw Materials`,
        required: parseInt(workOrderData.quantity),
        unit: 'units'
      },
      {
        name: `${workOrderData.productName} - Components`,
        required: Math.ceil(parseInt(workOrderData.quantity) * 1.2), // 20% more components
        unit: 'units'
      },
      {
        name: 'Packaging Materials',
        required: parseInt(workOrderData.quantity),
        unit: 'units'
      }
    ];
    
    // Get real inventory data to check availability
    try {
      const materials = await inventoryService.getMaterials();
      materialRequirements = baseRequirements.map(req => {
        // Try to find matching material in inventory
        const inventoryMatch = materials.find(m => 
          m.name.toLowerCase().includes(req.name.toLowerCase().split(' - ')[0]) ||
          req.name.toLowerCase().includes(m.name.toLowerCase())
        );
        
        if (inventoryMatch) {
          return {
            ...req,
            available: inventoryMatch.currentStock,
            materialId: inventoryMatch.Id,
            status: inventoryMatch.currentStock >= req.required ? 'Available' : 
                   inventoryMatch.currentStock > 0 ? 'Low' : 'Critical'
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
  
  const newWorkOrder = {
Id: maxId + 1,
    jobId: `WO-2024-${String(maxJobNumber + 1).padStart(3, '0')}`,
    ...workOrderData,
    materialRequirements,
    estimatedMaterialCost,
    orderId: workOrderData.orderId || null, // Link to originating order
    status: "Pending",
    currentStage: "Setup",
    stageProgress: 0,
    createdDate: new Date().toISOString(),
    estimatedMaterialCost: materialRequirements.reduce((total, mat) => 
      total + (mat.required * (mat.costPerUnit || 5)), 0
    ),
    stages: [
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
    ]
  };
  
  workOrders.push(newWorkOrder);
  return { ...newWorkOrder };
};

export const update = async (id, updates) => {
  await delay(300);
  const index = workOrders.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Work order not found");
  }
  
  workOrders[index] = { 
    ...workOrders[index], 
    ...updates
  };
  
  return { ...workOrders[index] };
};

export const updateStage = async (id, stageIndex, stageData) => {
  await delay(300);
  const index = workOrders.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Work order not found");
  }
  
  const workOrder = workOrders[index];
  workOrder.stages[stageIndex] = { ...workOrder.stages[stageIndex], ...stageData };
  
// Update current stage and overall progress
  if (stageData.status === "In Progress" && !workOrder.stages[stageIndex].startTime) {
    workOrder.stages[stageIndex].startTime = new Date().toISOString();
  }
  
  if (stageData.status === "Complete") {
    workOrder.stages[stageIndex].endTime = new Date().toISOString();
    workOrder.stages[stageIndex].progress = 100;
    
    // Move to next stage if available
    if (stageIndex < workOrder.stages.length - 1) {
      workOrder.currentStage = workOrder.stages[stageIndex + 1].name;
    } else {
      workOrder.status = "Complete";
      workOrder.currentStage = "Complete";
      workOrder.stageProgress = 100;
      
      // Update linked order to Ready status when work order completes
      if (workOrder.orderId) {
        try {
          const { updateStatus } = await import('@/services/api/orderService');
          await updateStatus(workOrder.orderId, 'Ready', 'Production completed - ready for shipping');
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      }
    }
  }
  
  // Update overall status based on stages
  const completedStages = workOrder.stages.filter(stage => stage.status === "Complete").length;
  const inProgressStages = workOrder.stages.filter(stage => stage.status === "In Progress").length;
  
  if (completedStages === workOrder.stages.length) {
    workOrder.status = "Complete";
  } else if (inProgressStages > 0) {
    workOrder.status = "In Progress";
  } else {
    workOrder.status = "Pending";
  }
  
  // Calculate overall progress percentage
  const totalProgress = workOrder.stages.reduce((sum, stage) => sum + (stage.progress || 0), 0);
  workOrder.stageProgress = Math.round(totalProgress / workOrder.stages.length);
  // Check for overdue status
  const now = new Date();
  const dueDate = new Date(workOrder.dueDate);
  if (now > dueDate && workOrder.status !== "Complete") {
    workOrder.status = "Overdue";
  }
  
  return { ...workOrders[index] };
};

export const remove = async (id) => {
  await delay(250);
  const index = workOrders.findIndex(item => item.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Work order not found");
  }
  const deleted = workOrders.splice(index, 1)[0];
  return { ...deleted };
};

export const getMetrics = async () => {
  await delay(200);
  const total = workOrders.length;
  const pending = workOrders.filter(wo => wo.status === "Pending").length;
  const inProgress = workOrders.filter(wo => wo.status === "In Progress").length;
  const completed = workOrders.filter(wo => wo.status === "Complete").length;
  const overdue = workOrders.filter(wo => wo.status === "Overdue").length;
  
  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
  };
};

// Enhanced material availability check with real inventory integration
export const checkMaterialAvailability = async (materialRequirements) => {
  await delay(150);
  
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
          available = inventoryItem.currentStock;
          costPerUnit = inventoryItem.cost || costPerUnit;
        }
      } else if (requirement.name) {
        // Try name-based matching
        const inventoryMatch = materials.find(m => 
          m.name.toLowerCase().includes(requirement.name.toLowerCase()) ||
          requirement.name.toLowerCase().includes(m.name.toLowerCase())
        );
        
        if (inventoryMatch) {
          available = inventoryMatch.currentStock;
          materialId = inventoryMatch.Id;
          costPerUnit = inventoryMatch.cost || costPerUnit;
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
  if (!workOrder.materialRequirements) return [];
  
  return workOrder.materialRequirements.map(requirement => ({
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
  await delay(100);
  
  return workOrders.filter(wo => 
    wo.materialRequirements?.some(req => req.materialId === parseInt(materialId))
  ).map(wo => ({
    ...wo,
    requiredQuantity: wo.materialRequirements.find(req => 
      req.materialId === parseInt(materialId)
    )?.required || 0
  }));
};