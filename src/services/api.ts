// Mock API service for future integration
// Replace these functions with actual API calls when backend is ready

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SheetData {
  name: string;
  headers: string[];
  rows: any[];
}

export interface CSVData {
  sheets: SheetData[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
}

export interface EntityMapping {
  entityName: string;
  mappings: FieldMapping[];
}

export interface MappedData {
  data: any[];
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Login API
  login: async (credentials: LoginCredentials): Promise<User> => {
    await delay(1500);
    if (credentials.email && credentials.password) {
      return {
        id: '1',
        email: credentials.email,
        name: 'Demo User'
      };
    }
    throw new Error('Invalid credentials');
  },

  // Parse CSV with support for multiple sheets (detecting based on data structure)
  parseCSVWithSheets: async (file: File): Promise<CSVData> => {
    await delay(1000);
    // This will be handled by papaparse on client side
    return {
      sheets: []
    };
  },

  // Auto-map fields for a specific entity
  autoMapFields: async (headers: string[], entityName?: string): Promise<FieldMapping[]> => {
    await delay(2000);
    
    // Different target fields based on entity type
    const entityFieldMaps: { [key: string]: string[] } = {
      'Account': ['Account Name', 'Industry', 'Annual Revenue', 'Website', 'Phone', 'Country', 'Unmapped'],
      'Contact': ['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Department', 'Account', 'Unmapped'],
      'Opportunity': ['Opportunity Name', 'Amount', 'Stage', 'Close Date', 'Probability', 'Account', 'Owner', 'Unmapped']
    };

    const targetFields = entityFieldMaps[entityName || 'Contact'] || ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip Code', 'Unmapped'];
    
    const mappings: FieldMapping[] = headers.map((header, index) => ({
      sourceField: header,
      targetField: index < targetFields.length ? targetFields[index] : 'Unmapped'
    }));

    return mappings;
  },

  // Process mapped data
  processMappedData: async (mappings: FieldMapping[], data: any[]): Promise<MappedData> => {
    await delay(2500);
    
    const mappedData = data.map(row => {
      const mappedRow: any = {};
      mappings.forEach(mapping => {
        if (mapping.targetField !== 'Unmapped') {
          mappedRow[mapping.targetField] = row[mapping.sourceField];
        }
      });
      return mappedRow;
    });

    return {
      data: mappedData
    };
  },

  // Final data load
  loadData: async (data: any[]): Promise<{ success: boolean; message: string }> => {
    await delay(2000);
    
    return {
      success: true,
      message: `Successfully loaded ${data.length} records`
    };
  }
};