import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import inventoryService from "@/services/api/inventoryService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";

function Inventory() {
const [activeTab, setActiveTab] = useState("materials");
  const [materials, setMaterials] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
const [showMaterialDetail, setShowMaterialDetail] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFinishedGoodStockAdjustment, setShowFinishedGoodStockAdjustment] = useState(false);
  const [showWorkOrderCreation, setShowWorkOrderCreation] = useState(false);
  const [selectedFinishedGood, setSelectedFinishedGood] = useState(null);
  // Load data on component mount
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [materialsData, finishedGoodsData, alertsData] = await Promise.all([
        inventoryService.getMaterials(),
        inventoryService.getFinishedGoods(),
        inventoryService.getLowStockAlerts()
      ]);
      
      setMaterials(materialsData);
      setFinishedGoods(finishedGoodsData);
      setLowStockAlerts(alertsData);
    } catch (error) {
      toast.error("Failed to load inventory data");
      console.error("Inventory load error:", error);
    } finally {
      setLoading(false);
    }
  };
const handleAddMaterial = async (materialData) => {
    try {
      const newMaterial = await inventoryService.addMaterial(materialData);
      setMaterials(prev => [...prev, newMaterial]);
      setShowAddMaterial(false);
      toast.success("Material added successfully");
      
      // Reload alerts to check if new material affects low stock
      const alertsData = await inventoryService.getLowStockAlerts();
      setLowStockAlerts(alertsData);
    } catch (error) {
      toast.error("Failed to add material");
      console.error("Add material error:", error);
    }
  };

  const handleMaterialSelect = (materialId, selected) => {
    if (selected) {
      setSelectedMaterials(prev => [...prev, materialId]);
    } else {
      setSelectedMaterials(prev => prev.filter(id => id !== materialId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedMaterials(filteredMaterials.map(m => m.Id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleMaterialClick = (material) => {
    setSelectedMaterial(material);
    setShowMaterialDetail(true);
  };

  const handleBulkQuantityUpdate = async (updates) => {
    try {
      const result = await inventoryService.bulkUpdateQuantities(updates);
      if (result.success) {
        await loadInventoryData();
        setSelectedMaterials([]);
        setShowBulkActions(false);
        toast.success(`Updated ${result.updatedCount} material quantities`);
      }
    } catch (error) {
      toast.error("Failed to update quantities");
      console.error("Bulk update error:", error);
    }
  };

  const handleBulkReorderUpdate = async (updates) => {
    try {
      const result = await inventoryService.bulkUpdateReorderPoints(updates);
      if (result.success) {
        await loadInventoryData();
        setSelectedMaterials([]);
        setShowBulkActions(false);
        toast.success(`Updated ${result.updatedCount} reorder points`);
      }
    } catch (error) {
      toast.error("Failed to update reorder points");
      console.error("Bulk reorder update error:", error);
    }
  };

  const handleStockAdjustment = async (materialId, adjustment, reason) => {
    try {
      const result = await inventoryService.adjustStock(materialId, adjustment, reason);
      if (result.success) {
        await loadInventoryData();
        setShowStockAdjustment(false);
        toast.success(`Stock adjusted to ${result.newStock} units`);
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
      console.error("Stock adjustment error:", error);
    }
  };

  const handleExportData = async (selectedFields, exportSelected = false) => {
    try {
      const materialsToExport = exportSelected 
        ? materials.filter(m => selectedMaterials.includes(m.Id))
        : filteredMaterials;
      
      const result = inventoryService.exportMaterialsData(materialsToExport, selectedFields);
      if (result.success) {
        setShowExportModal(false);
        toast.success(`Exported ${result.recordCount} materials`);
      }
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleMaterialUpdate = async (materialId, updates) => {
    try {
      const updatedMaterial = await inventoryService.updateMaterial(materialId, updates);
      setMaterials(prev => prev.map(m => m.Id === materialId ? updatedMaterial : m));
      setShowMaterialDetail(false);
      toast.success("Material updated successfully");
      
      // Reload alerts in case stock level changed
      const alertsData = await inventoryService.getLowStockAlerts();
      setLowStockAlerts(alertsData);
    } catch (error) {
      toast.error("Failed to update material");
      console.error("Update material error:", error);
    }
};

  async function handleFinishedGoodStockAdjustment(productId, adjustments, reason) {
    try {
      await inventoryService.adjustFinishedGoodStock(productId, adjustments, reason);
      toast.success('Stock adjusted successfully');
      await loadInventoryData(); // Refresh data
    } catch (error) {
      console.error('Stock adjustment failed:', error);
      toast.error('Failed to adjust stock');
    }
  }

  async function handleWorkOrderCreation(productId, quantity, priority) {
    try {
      await inventoryService.createWorkOrderForProduct(productId, quantity, priority);
      toast.success('Work order created successfully');
    } catch (error) {
      console.error('Work order creation failed:', error);
      toast.error('Failed to create work order');
    }
  }

  // Filter materials based on search term
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter finished goods based on search term
  const filteredFinishedGoods = finishedGoods.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockLevelColor = (level) => {
    switch (level) {
      case 'adequate': return 'success';
      case 'low': return 'warning';
      case 'critical': return 'error';
      default: return 'secondary';
    }
  };

  const getStockLevelText = (level) => {
    switch (level) {
      case 'adequate': return 'Good';
      case 'low': return 'Low';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const tabs = [
    { id: "materials", label: "Raw Materials", icon: "Package" },
    { id: "finished", label: "Finished Goods", icon: "Box" },
    { id: "alerts", label: "Low Stock Alerts", icon: "AlertTriangle" }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-secondary mt-1">
            Track raw materials, finished goods, and manage stock levels
          </p>
        </div>
        {activeTab === "materials" && (
          <Button 
            icon="Plus" 
            variant="primary" 
            size="lg"
            onClick={() => setShowAddMaterial(true)}
          >
            Add Material
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.id === "alerts" && lowStockAlerts.length > 0 && (
                <Badge variant="error" size="sm">
                  {lowStockAlerts.length}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      {(activeTab === "materials" || activeTab === "finished") && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <ApperIcon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              placeholder={`Search ${activeTab === "materials" ? "materials" : "products"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "materials" && (
          <RawMaterialsTab 
materials={filteredMaterials}
            searchTerm={searchTerm}
            selectedMaterials={selectedMaterials}
            onMaterialSelect={handleMaterialSelect}
            onSelectAll={handleSelectAll}
            onMaterialClick={handleMaterialClick}
            onStockAdjustment={(material) => {
              setSelectedMaterial(material);
              setShowStockAdjustment(true);
            }}
            onBulkActions={() => setShowBulkActions(true)}
            onExport={() => setShowExportModal(true)}
          />
        )}
        
        {activeTab === "finished" && (
<FinishedGoodsTab 
            products={filteredFinishedGoods}
            searchTerm={searchTerm}
            onAdjustStock={(product) => {
              setSelectedFinishedGood(product);
              setShowFinishedGoodStockAdjustment(true);
            }}
            onCreateWorkOrder={(product) => {
              setSelectedFinishedGood(product);
              setShowWorkOrderCreation(true);
            }}
          />
        )}
        
        {activeTab === "alerts" && (
          <LowStockAlertsTab alerts={lowStockAlerts} />
        )}
      </motion.div>

{/* Add Material Modal */}
      {showAddMaterial && (
        <AddMaterialModal
          onClose={() => setShowAddMaterial(false)}
          onSubmit={handleAddMaterial}
        />
      )}

      {/* Material Detail Modal */}
      {showMaterialDetail && selectedMaterial && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={() => setShowMaterialDetail(false)}
          onUpdate={handleMaterialUpdate}
        />
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <BulkActionsModal
          selectedMaterials={materials.filter(m => selectedMaterials.includes(m.Id))}
          onClose={() => setShowBulkActions(false)}
          onQuantityUpdate={handleBulkQuantityUpdate}
          onReorderUpdate={handleBulkReorderUpdate}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showStockAdjustment && selectedMaterial && (
        <StockAdjustmentModal
          material={selectedMaterial}
          onClose={() => setShowStockAdjustment(false)}
          onAdjust={handleStockAdjustment}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          totalMaterials={filteredMaterials.length}
          selectedCount={selectedMaterials.length}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportData}
        />
      )}
{/* Finished Good Stock Adjustment Modal */}
      {showFinishedGoodStockAdjustment && selectedFinishedGood && (
        <FinishedGoodStockAdjustmentModal
          product={selectedFinishedGood}
          onClose={() => {
            setShowFinishedGoodStockAdjustment(false);
            setSelectedFinishedGood(null);
          }}
          onAdjust={handleFinishedGoodStockAdjustment}
        />
      )}

      {/* Work Order Creation Modal */}
      {showWorkOrderCreation && selectedFinishedGood && (
        <WorkOrderCreationModal
          product={selectedFinishedGood}
          onClose={() => {
            setShowWorkOrderCreation(false);
            setSelectedFinishedGood(null);
          }}
          onCreate={handleWorkOrderCreation}
        />
      )}
    </div>
  );
}

// Raw Materials Tab Component
function RawMaterialsTab({ 
  materials, 
  selectedMaterials = [], 
  onMaterialSelect, 
  onSelectAll, 
  onMaterialClick, 
  onStockAdjustment,
  onBulkActions,
  onExport 
}) {
  const getStockLevelColor = (level) => {
    switch (level) {
      case 'adequate': return 'success';
      case 'low': return 'warning';
      case 'critical': return 'error';
      default: return 'secondary';
    }
  };

  const getStockLevelText = (level) => {
    switch (level) {
      case 'adequate': return 'Good';
      case 'low': return 'Low';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <Card.Content className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Material Name</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Current Stock</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Unit</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Reorder Level</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Supplier</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Last Updated</th>
              </tr>
            </thead>
            <tbody>
{/* Bulk Actions Toolbar */}
              {selectedMaterials.length > 0 && (
                <tr>
                  <td colSpan="8" className="py-3 px-6 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-blue-900">
                          {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={onBulkActions}
                        >
                          Bulk Actions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onExport}
                        >
                          <ApperIcon name="Download" size={14} className="mr-1" />
                          Export Selected
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectAll(false)}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {materials.map((material) => (
                <tr 
                  key={material.Id} 
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes(material.Id)}
                        onChange={(e) => onMaterialSelect(material.Id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary"
                      />
                      <div 
                        className="font-medium text-slate-900 hover:text-primary"
                        onClick={() => onMaterialClick(material)}
                      >
                        {material.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700" onClick={() => onMaterialClick(material)}>
                    {material.currentStock}
                  </td>
                  <td className="py-4 px-6 text-slate-700" onClick={() => onMaterialClick(material)}>
                    {material.unit}
                  </td>
                  <td className="py-4 px-6 text-slate-700" onClick={() => onMaterialClick(material)}>
                    {material.reorderLevel}
                  </td>
                  <td className="py-4 px-6" onClick={() => onMaterialClick(material)}>
                    <Badge variant={getStockLevelColor(material.stockLevel)}>
                      {getStockLevelText(material.stockLevel)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-700" onClick={() => onMaterialClick(material)}>
                    {material.supplier}
                  </td>
                  <td className="py-4 px-6 text-slate-700" onClick={() => onMaterialClick(material)}>
                    {material.lastUpdated}
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStockAdjustment(material);
                      }}
                    >
                      <ApperIcon name="Edit" size={14} className="mr-1" />
                      Adjust Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {materials.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.length === materials.length}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-slate-700">Select All ({materials.length})</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  <ApperIcon name="Download" size={14} className="mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          )}
          
          {materials.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="Package" size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500">No materials found</p>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

// Finished Goods Tab Component
function FinishedGoodsTab({ products, onAdjustStock, onCreateWorkOrder }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.Id} className="hover:shadow-md transition-shadow">
          <Card.Content className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover bg-slate-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                <p className="text-sm text-secondary">{product.location}</p>
              </div>
            </div>

            {/* Batch/Lot Information */}
            {product.batches && product.batches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-secondary">Active Batches</span>
                  <Badge variant="info" size="sm">{product.batches.length}</Badge>
                </div>
                <div className="space-y-1">
                  {product.batches.slice(0, 2).map((batch) => (
                    <div key={batch.batchNumber} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{batch.batchNumber}</span>
                      <span className="text-secondary">Qty: {batch.quantity}</span>
                    </div>
                  ))}
                  {product.batches.length > 2 && (
                    <div className="text-xs text-secondary">
                      +{product.batches.length - 2} more batches
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-success">{product.available}</div>
                <div className="text-xs text-secondary">Available</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-warning">{product.reserved}</div>
                <div className="text-xs text-secondary">Reserved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-700">{product.total}</div>
                <div className="text-xs text-secondary">Total</div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAdjustStock(product)}
                className="flex-1"
              >
                <ApperIcon name="Package" size={14} className="mr-1" />
                Adjust Stock
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onCreateWorkOrder(product)}
                className="flex-1"
              >
                <ApperIcon name="Plus" size={14} className="mr-1" />
                Work Order
              </Button>
            </div>
          </Card.Content>
        </Card>
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <ApperIcon name="Box" size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">No finished goods found</p>
        </div>
      )}
    </div>
  );
}

function FinishedGoodStockAdjustmentModal({ product, onClose, onAdjust }) {
  const [batches, setBatches] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBatches() {
      try {
        const batchData = await inventoryService.getBatchesForProduct(product.Id);
        setBatches(batchData);
        setAdjustments(batchData.map(batch => ({
          batchNumber: batch.batchNumber,
          currentQuantity: batch.quantity,
          adjustment: 0
        })));
      } catch (error) {
        console.error('Failed to load batches:', error);
        toast.error('Failed to load batch information');
      }
    }
    
    if (product) {
      loadBatches();
    }
  }, [product]);

  const handleAdjustmentChange = (batchNumber, adjustment) => {
    setAdjustments(prev => prev.map(adj => 
      adj.batchNumber === batchNumber 
        ? { ...adj, adjustment: parseInt(adjustment) || 0 }
        : adj
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validAdjustments = adjustments.filter(adj => adj.adjustment !== 0);
    if (validAdjustments.length === 0) {
      toast.error('Please enter at least one adjustment');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    setLoading(true);
    try {
      await onAdjust(product.Id, validAdjustments, reason);
      onClose();
    } catch (error) {
      console.error('Adjustment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Adjust Stock</h2>
            <p className="text-sm text-secondary">{product.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Batch Adjustments
            </label>
            <div className="space-y-3">
              {adjustments.map((adj) => (
                <div key={adj.batchNumber} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{adj.batchNumber}</div>
                    <div className="text-sm text-secondary">Current: {adj.currentQuantity} units</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-secondary">Adjust:</label>
                    <input
                      type="number"
                      value={adj.adjustment}
                      onChange={(e) => handleAdjustmentChange(adj.batchNumber, e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-sm font-medium">
                    New: {adj.currentQuantity + adj.adjustment}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Adjustment <span className="text-error">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="3"
              placeholder="Enter reason for stock adjustment..."
              required
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Total Adjustment:</span>
            <span className={`font-semibold ${
              totalAdjustment > 0 ? 'text-success' : 
              totalAdjustment < 0 ? 'text-error' : 
              'text-slate-600'
            }`}>
              {totalAdjustment > 0 ? '+' : ''}{totalAdjustment} units
            </span>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={totalAdjustment === 0 || !reason.trim()}
              className="flex-1"
            >
              Apply Adjustment
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function WorkOrderCreationModal({ product, onClose, onCreate }) {
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await onCreate(product.Id, qty, priority);
      onClose();
    } catch (error) {
      console.error('Work order creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create Work Order</h2>
            <p className="text-sm text-secondary">{product.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity to Produce <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter quantity..."
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="3"
              placeholder="Additional notes or requirements..."
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              className="flex-1"
            >
              Create Work Order
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Low Stock Alerts Tab Component
function LowStockAlertsTab({ alerts }) {
  const getStockLevelColor = (level) => {
    switch (level) {
      case 'low': return 'warning';
      case 'critical': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <Card.Content className="p-6">
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.Id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <ApperIcon name="AlertTriangle" className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{alert.name}</h4>
                    <p className="text-sm text-secondary">
                      Current: {alert.currentStock} {alert.unit} | Reorder at: {alert.reorderLevel} {alert.unit}
                    </p>
                    <p className="text-sm text-secondary">Supplier: {alert.supplier}</p>
                  </div>
                </div>
                <Badge variant={getStockLevelColor(alert.stockLevel)}>
                  {alert.stockLevel === 'low' ? 'Low Stock' : 'Critical'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="CheckCircle" size={48} className="mx-auto text-success mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">All Stock Levels Good</h3>
            <p className="text-slate-500">No low stock alerts at this time</p>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

// Add Material Modal Component
function AddMaterialModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    currentStock: '',
    unit: '',
    reorderLevel: '',
    supplier: '',
    cost: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      currentStock: parseInt(formData.currentStock),
      reorderLevel: parseInt(formData.reorderLevel),
      cost: parseFloat(formData.cost)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Add New Material</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Material Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="kg, pieces, m, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cost per Unit
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Add Material
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Material Detail Modal Component
function MaterialDetailModal({ material, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    currentStock: material.currentStock,
    reorderLevel: material.reorderLevel,
    supplier: material.supplier,
    cost: material.cost || 0
  });
  const [history, setHistory] = useState([
    { date: '2024-01-15', action: 'Stock Added', quantity: 500, user: 'Admin', reason: 'Initial stock' },
    { date: '2024-01-10', action: 'Reorder Level Updated', from: 50, to: material.reorderLevel, user: 'Manager' },
    { date: '2024-01-05', action: 'Material Created', user: 'Admin' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(material.Id, {
      ...formData,
      currentStock: parseInt(formData.currentStock),
      reorderLevel: parseInt(formData.reorderLevel),
      cost: parseFloat(formData.cost)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{material.name}</h2>
              <p className="text-secondary mt-1">Material Details & History</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Material Info & Update Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <Card.Content className="p-4">
                <h3 className="font-medium text-slate-900 mb-4">Update Material</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cost per Unit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-4">
                <h3 className="font-medium text-slate-900 mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Unit:</span>
                    <span className="font-medium">{material.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Stock Level:</span>
                    <Badge variant={material.stockLevel === 'adequate' ? 'success' : material.stockLevel === 'low' ? 'warning' : 'error'}>
                      {material.stockLevel === 'adequate' ? 'Good' : material.stockLevel === 'low' ? 'Low' : 'Critical'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium">{material.lastUpdated}</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* History Section */}
          <Card>
            <Card.Content className="p-4">
              <h3 className="font-medium text-slate-900 mb-4">Activity History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                    <ApperIcon name="Clock" size={16} className="text-slate-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{entry.action}</span>
                        <span className="text-sm text-slate-500">{entry.date}</span>
                      </div>
                      {entry.quantity && (
                        <p className="text-sm text-slate-600">Quantity: {entry.quantity}</p>
                      )}
                      {entry.from && entry.to && (
                        <p className="text-sm text-slate-600">Changed from {entry.from} to {entry.to}</p>
                      )}
                      {entry.reason && (
                        <p className="text-sm text-slate-600">Reason: {entry.reason}</p>
                      )}
                      <p className="text-sm text-slate-500">By: {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

// Bulk Actions Modal Component
function BulkActionsModal({ selectedMaterials, onClose, onQuantityUpdate, onReorderUpdate }) {
  const [activeAction, setActiveAction] = useState('quantities');
  const [updates, setUpdates] = useState({});

  const handleUpdateChange = (materialId, field, value) => {
    setUpdates(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        id: materialId,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateArray = Object.values(updates).filter(update => 
      activeAction === 'quantities' ? update.quantity !== undefined : update.reorderLevel !== undefined
    );
    
    if (updateArray.length === 0) {
      toast.error('Please enter values to update');
      return;
    }

    if (activeAction === 'quantities') {
      onQuantityUpdate(updateArray);
    } else {
      onReorderUpdate(updateArray);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Bulk Actions ({selectedMaterials.length} materials)
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Action Type Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveAction('quantities')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeAction === 'quantities'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Update Quantities
            </button>
            <button
              onClick={() => setActiveAction('reorder')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeAction === 'reorder'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Adjust Reorder Points
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Material</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Current</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      New {activeAction === 'quantities' ? 'Quantity' : 'Reorder Level'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMaterials.map((material) => (
                    <tr key={material.Id} className="border-b">
                      <td className="py-3 px-4 font-medium">{material.name}</td>
                      <td className="py-3 px-4">
                        {activeAction === 'quantities' ? material.currentStock : material.reorderLevel} {material.unit}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          placeholder={`Enter new ${activeAction === 'quantities' ? 'quantity' : 'reorder level'}`}
                          onChange={(e) => handleUpdateChange(
                            material.Id,
                            activeAction === 'quantities' ? 'quantity' : 'reorderLevel',
                            parseInt(e.target.value) || 0
                          )}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Update {activeAction === 'quantities' ? 'Quantities' : 'Reorder Points'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Stock Adjustment Modal Component
function StockAdjustmentModal({ material, onClose, onAdjust }) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('increase');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAdjustment = adjustmentType === 'increase' ? Math.abs(adjustment) : -Math.abs(adjustment);
    onAdjust(material.Id, finalAdjustment, reason);
  };

  const newStock = material.currentStock + (adjustmentType === 'increase' ? Math.abs(adjustment) : -Math.abs(adjustment));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Stock Adjustment</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-slate-900">{material.name}</h3>
            <p className="text-slate-600">Current Stock: {material.currentStock} {material.unit}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adjustment Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="increase"
                    checked={adjustmentType === 'increase'}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="mr-2"
                  />
                  Increase Stock
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="decrease"
                    checked={adjustmentType === 'decrease'}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="mr-2"
                  />
                  Decrease Stock
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adjustment Amount ({material.unit})
              </label>
              <input
                type="number"
                min="0"
                required
                value={Math.abs(adjustment)}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Adjustment
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for stock adjustment..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>

            {adjustment !== 0 && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  New Stock Level: <span className="font-medium">{newStock} {material.unit}</span>
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Apply Adjustment
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Export Modal Component
function ExportModal({ totalMaterials, selectedCount, onClose, onExport }) {
  const [exportType, setExportType] = useState('all');
  const [selectedFields, setSelectedFields] = useState([
    'name', 'currentStock', 'unit', 'reorderLevel', 'supplier', 'stockLevel', 'lastUpdated'
  ]);

  const availableFields = [
    { key: 'name', label: 'Material Name' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'unit', label: 'Unit' },
    { key: 'reorderLevel', label: 'Reorder Level' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'stockLevel', label: 'Stock Status' },
    { key: 'lastUpdated', label: 'Last Updated' }
  ];

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onExport(selectedFields, exportType === 'selected');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Export Materials</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Export Scope
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={exportType === 'all'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-2"
                  />
                  All Materials ({totalMaterials})
                </label>
                {selectedCount > 0 && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="selected"
                      checked={exportType === 'selected'}
                      onChange={(e) => setExportType(e.target.value)}
                      className="mr-2"
                    />
                    Selected Materials ({selectedCount})
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fields to Export
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableFields.map((field) => (
                  <label key={field.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      className="mr-2"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
                disabled={selectedFields.length === 0}
              >
                <ApperIcon name="Download" size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
export default Inventory;