interface ElectronAPI {
  // File operations
  saveContract: (
    templatePath: string,
    data: any,
    outputPath: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>;

  // Get available templates
  getTemplates: () => Promise<string[]>;

  // Open file dialog to select save location
  showSaveDialog: (options: any) => Promise<string | null>;

  // Read a template file
  readTemplate: (templateName: string) => Promise<Buffer>;
}

// Contract form fields interface
export interface ContractFormInputs {
  // Buyer information
  buyerName: string;
  buyerNationality: string;
  buyerMaritalStatus: string;
  buyerOccupation: string;
  buyerCpf: string;
  buyerRg: string;
  buyerAddress: string;

  // Vehicle details
  vehicleBrand: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  licensePlate: string;

  // Pricing
  carPrice: number;
  carPriceInWords: string;
  numberOfInstallments: number;
  installmentValue: number;
  installmentValueInWords: string;

  // Contract dates
  contractDay: number;
  contractDate: string;
}

export interface ContractGeneratorProps {
  templates: string[];
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
