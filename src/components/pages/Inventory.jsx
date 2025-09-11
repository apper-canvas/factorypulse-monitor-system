import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { inventoryService } from "@/services/api/inventoryService";
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
            onAddMaterial={() => setShowAddMaterial(true)}
          />
        )}
        
        {activeTab === "finished" && (
          <FinishedGoodsTab 
            products={filteredFinishedGoods}
            searchTerm={searchTerm}
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
    </div>
  );
}

// Raw Materials Tab Component
function RawMaterialsTab({ materials }) {
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
              {materials.map((material) => (
                <tr key={material.Id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">{material.name}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-700">{material.currentStock}</td>
                  <td className="py-4 px-6 text-slate-700">{material.unit}</td>
                  <td className="py-4 px-6 text-slate-700">{material.reorderLevel}</td>
                  <td className="py-4 px-6">
                    <Badge variant={getStockLevelColor(material.stockLevel)}>
                      {getStockLevelText(material.stockLevel)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-700">{material.supplier}</td>
                  <td className="py-4 px-6 text-slate-700">{material.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
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
function FinishedGoodsTab({ products }) {
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
            
            <Button variant="outline" size="sm" className="w-full">
              <ApperIcon name="Eye" size={16} className="mr-2" />
              View Details
            </Button>
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

export default Inventory;