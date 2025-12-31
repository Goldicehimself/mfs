export const SERVICE_CATEGORIES = [
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐛' },
  { value: 'fire_safety', label: 'Fire Safety', icon: '🔥' },
  { value: 'elevator', label: 'Elevator', icon: '🛗' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'gas', label: 'Gas Systems', icon: '⛽' },
  { value: 'sewage', label: 'Sewage/Waste', icon: '🚽' },
];

export const WORK_ORDER_PRIORITIES = [
  { value: 'critical', label: 'Critical', color: 'error' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'medium', label: 'Medium', color: 'info' },
  { value: 'low', label: 'Low', color: 'success' },
];

export const WORK_ORDER_STATUSES = [
  { value: 'open', label: 'Open', color: 'warning' },
  { value: 'assigned', label: 'Assigned', color: 'info' },
  { value: 'in_progress', label: 'In Progress', color: 'primary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'verified', label: 'Verified', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'default' },
  { value: 'overdue', label: 'Overdue', color: 'error' },
];

export const ASSET_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'under_repair', label: 'Under Repair', color: 'warning' },
  { value: 'decommissioned', label: 'Decommissioned', color: 'error' },
];

export const PM_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export const USER_ROLES = {
  facility_manager: 'Facility Manager',
  technician: 'Maintenance Technician',
  vendor: 'Vendor',
  staff: 'Staff Member',
  finance: 'Finance Officer',
  admin: 'Administrator',
  procurement: 'Procurement Officer',
};