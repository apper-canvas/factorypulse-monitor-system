// Get ApperClient singleton instance
const getApperClient = () => {
  if (window.ApperSDK) {
    const { ApperClient } = window.ApperSDK;
    return new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }
  return null;
};

export const customerService = {
  // Get all customers
getAll: async () => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return [];
      }

      const response = await apperClient.fetchRecords('customer_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_orders_c"}}
        ]
      });

      if (!response.success) {
        console.error('Failed to fetch customers:', response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return [];
    }
  },

  // Get customer by ID
getById: async (id) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return null;
      }

      const response = await apperClient.getRecordById('customer_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_orders_c"}}
        ]
      });

      if (!response.success) {
        console.error(`Failed to fetch customer ${id}:`, response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      return null;
    }
  },

  // Search customers by name
search: async (query) => {
    try {
      if (!query || query.length < 2) return [];

      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return [];
      }

      const response = await apperClient.fetchRecords('customer_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_orders_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {
                  "fieldName": "name_c",
                  "operator": "Contains",
                  "values": [query]
                },
                {
                  "fieldName": "company_c",
                  "operator": "Contains",
                  "values": [query]
                }
              ],
              "operator": "OR"
            }
          ]
        }],
        pagingInfo: {
          "limit": 10,
          "offset": 0
        }
      });

      if (!response.success) {
        console.error('Failed to search customers:', response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Failed to search customers:', error);
      return [];
    }
  }
};