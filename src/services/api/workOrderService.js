import workOrdersData from "@/services/mockData/workOrders.json";

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
  
  const newWorkOrder = {
    Id: maxId + 1,
    jobId: `WO-2024-${String(maxJobNumber + 1).padStart(3, '0')}`,
    ...workOrderData,
    status: "Pending",
    currentStage: "Setup",
    stageProgress: 0,
    createdDate: new Date().toISOString(),
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

// Mock inventory check function - integrates with inventory system
export const checkMaterialAvailability = async (materialRequirements) => {
  await delay(150);
  
  // Simulate inventory check
  return materialRequirements.map(material => {
    const availabilityRatio = material.available / material.required;
    let status = "Available";
    
    if (availabilityRatio === 0) {
      status = "Critical";
    } else if (availabilityRatio < 1) {
      status = "Low";
    }
    
    return {
      ...material,
      status,
      shortfall: Math.max(0, material.required - material.available)
    };
  });
};