import customersData from '@/services/mockData/customers.json';

// In-memory storage for runtime changes
let customers = [...customersData];

export const customerService = {
  // Get all customers
  getAll: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return customers.map(customer => ({ ...customer }));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw new Error('Failed to load customers');
    }
  },

  // Get customer by ID
  getById: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const customer = customers.find(c => c.Id === parseInt(id));
      if (!customer) {
        throw new Error(`Customer with ID ${id} not found`);
      }
      return { ...customer };
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      throw error;
    }
  },

  // Search customers by name
  search: async (query) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!query || query.length < 2) return [];
      
      const searchTerm = query.toLowerCase();
      return customers
        .filter(customer => 
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.company.toLowerCase().includes(searchTerm)
        )
        .slice(0, 10)
        .map(customer => ({ ...customer }));
    } catch (error) {
      console.error('Failed to search customers:', error);
      throw error;
    }
  }
};