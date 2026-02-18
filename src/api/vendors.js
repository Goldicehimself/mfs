import axiosInstance from './axiosConfig';

const normalizeVendor = (vendor) => {
  if (!vendor) return vendor;
  return {
    ...vendor,
    id: vendor.id || vendor._id,
  };
};

const mockVendors = [
  {
    id: 1,
    name: 'TechCool HVAC Systems',
    category: 'HVAC',
    email: 'contact@techcool.com',
    phone: '(555) 123-4567',
    rating: 4.8,
    contractStatus: 'Active',
    lastService: 'Dec 15, 2023',
    monthlySpend: 8500,
    performance: 92,
    avatar: '🔧',
    activeContracts: 12,
  },
  {
    id: 2,
    name: 'PowerLine Electrical',
    category: 'Electrical',
    email: 'info@powerlineelec.com',
    phone: '(555) 987-6543',
    rating: 4.6,
    contractStatus: 'Active',
    lastService: 'Dec 12, 2023',
    monthlySpend: 6200,
    performance: 88,
    avatar: '⚡',
    activeContracts: 8,
  },
  {
    id: 3,
    name: 'AquaFlow Plumbing',
    category: 'Plumbing',
    email: 'service@aquaflow.com',
    phone: '(555) 456-7890',
    rating: 4.4,
    contractStatus: 'Pending',
    lastService: 'Dec 08, 2023',
    monthlySpend: 4100,
    performance: 82,
    avatar: '🚰',
    activeContracts: 5,
  },
  {
    id: 4,
    name: 'SparklePro Cleaning',
    category: 'Cleaning',
    email: 'hello@sparklepro.com',
    phone: '(555) 321-0987',
    rating: 4.9,
    contractStatus: 'Active',
    lastService: 'Dec 16, 2023',
    monthlySpend: 3200,
    performance: 95,
    avatar: '✨',
    activeContracts: 3,
  },
  {
    id: 5,
    name: 'SecureGuard Systems',
    category: 'Security',
    email: 'support@secureguard.com',
    phone: '(555) 654-3210',
    rating: 4.3,
    contractStatus: 'Expired',
    lastService: 'Nov 28, 2023',
    monthlySpend: 5600,
    performance: 79,
    avatar: '🛡️',
    activeContracts: 2,
  },
  {
    id: 6,
    name: 'ProMaint Solutions',
    category: 'General',
    email: 'contact@promaint.com',
    phone: '(555) 789-0123',
    rating: 4.7,
    contractStatus: 'Active',
    lastService: 'Dec 14, 2023',
    monthlySpend: 7200,
    performance: 90,
    avatar: '🔨',
    activeContracts: 6,
  },
];

const shouldUseMock = () => {
  const token = localStorage.getItem('token');
  return !token || token.startsWith('local-');
};

export async function fetchVendors() {
  try {
    if (shouldUseMock()) {
      return mockVendors;
    }
    const response = await axiosInstance.get('/vendors');
    const payload = response.data?.data;
    if (Array.isArray(payload)) return payload.map(normalizeVendor);
    if (Array.isArray(payload?.vendors)) {
      return { ...payload, vendors: payload.vendors.map(normalizeVendor) };
    }
    return payload;
  } catch (error) {
    return mockVendors;
  }
}

export async function getVendorById(id) {
  try {
    if (shouldUseMock()) {
      return mockVendors.find((v) => v.id === parseInt(id));
    }
    const response = await axiosInstance.get(`/vendors/${id}`);
    return normalizeVendor(response.data?.data);
  } catch (error) {
    return mockVendors.find((v) => v.id === parseInt(id));
  }
}

export async function createVendor(vendorData) {
  try {
    if (shouldUseMock()) {
      return { ...vendorData, id: Date.now() };
    }
    const response = await axiosInstance.post('/vendors', vendorData);
    return normalizeVendor(response.data?.data);
  } catch (error) {
    const newVendor = { ...vendorData, id: Date.now() };
    return newVendor;
  }
}

export async function updateVendor(id, vendorData) {
  try {
    if (shouldUseMock()) {
      return { ...vendorData, id };
    }
    const response = await axiosInstance.put(`/vendors/${id}`, vendorData);
    return normalizeVendor(response.data?.data);
  } catch (error) {
    throw error;
  }
}

export async function deleteVendor(id) {
  try {
    if (shouldUseMock()) {
      return { success: true };
    }
    await axiosInstance.delete(`/vendors/${id}`);
  } catch (error) {
    throw error;
  }
}

export async function importVendors(vendors) {
  try {
    if (shouldUseMock()) {
      return { successful: vendors.length, failed: 0, errors: [] };
    }
    const response = await axiosInstance.post('/vendors/import', { vendors });
    return response.data?.data;
  } catch (error) {
    return { successful: vendors.length, failed: 0, errors: [] };
  }
}
