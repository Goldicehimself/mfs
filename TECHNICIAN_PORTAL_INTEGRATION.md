# Technician Portal - Integration Guide

## Quick Start

### 1. Accessing the Portal
- **URL**: `/technician-portal`
- **Authorized Roles**: `technician`, `admin`
- **Location in Nav**: Sidebar → Technician Portal

### 2. Component Location
```
src/pages/Technicians/TechnicianPortal.jsx
```

## Customization Guide

### Changing Mock Data

Edit the `mockTechnicianData` object in `TechnicianPortal.jsx`:

```javascript
const mockTechnicianData = {
  technician: {
    id: 'tech-001',
    name: 'Your Name',
    email: 'your.email@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Maintenance',
    rating: 4.8,
    completedOrders: 156,
    onTimeCompletion: 94,
    certifications: ['HVAC', 'Electrical', 'Plumbing'],
    avatar: 'https://your-avatar-url.com'
  },
  // ... more data
};
```

### Connecting to Backend API

Replace mock data with API calls:

```javascript
// In TechnicianPortal.jsx
import { useEffect, useState } from 'react';
import { getTechnicianProfile, getAssignedWorkOrders } from '@/api/technicians';

export default function TechnicianPortal() {
  const [technician, setTechnician] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getTechnicianProfile();
        const orders = await getAssignedWorkOrders();
        setTechnician(profile);
        setWorkOrders(orders);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    // ... component JSX
  );
}
```

### Adding API Endpoints

Create in `src/api/technicians.js`:

```javascript
import axiosInstance from './axiosConfig';

export const getTechnicianProfile = async (technicianId = null) => {
  const response = await axiosInstance.get(
    `/technicians/${technicianId || 'me'}/profile`
  );
  return response.data;
};

export const getAssignedWorkOrders = async (params = {}) => {
  const response = await axiosInstance.get('/technicians/me/work-orders', {
    params
  });
  return response.data;
};

export const updateWorkOrderProgress = async (workOrderId, progress) => {
  const response = await axiosInstance.patch(
    `/work-orders/${workOrderId}/progress`,
    { progress }
  );
  return response.data;
};

export const completeWorkOrder = async (workOrderId, data = {}) => {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/complete`,
    data
  );
  return response.data;
};

export const addWorkOrderNote = async (workOrderId, note) => {
  const response = await axiosInstance.post(
    `/work-orders/${workOrderId}/notes`,
    { content: note }
  );
  return response.data;
};
```

### Updating Technician Metrics

```javascript
// Calculate metrics from real work orders
const stats = useMemo(() => {
  return {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    totalThisMonth: workOrders.filter(wo => 
      new Date(wo.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    averageCompletionTime: calculateAverageTime(workOrders),
    satisfactionRating: calculateSatisfactionRating(workOrders)
  };
}, [workOrders]);
```

## Advanced Features Implementation

### 1. Real-Time Updates with WebSocket

```javascript
import { useWebSocket } from '@/hooks/useWebSocket';

// In TechnicianPortal component
const { lastMessage } = useWebSocket('ws://your-api/technician-updates');

useEffect(() => {
  if (lastMessage?.type === 'work_order_updated') {
    // Update work order in state
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === lastMessage.workOrderId
          ? { ...wo, ...lastMessage.data }
          : wo
      )
    );
  }
}, [lastMessage]);
```

### 2. Add Photo Upload for Work Orders

```javascript
import { uploadWorkOrderPhoto } from '@/api/workOrders';

const handlePhotoUpload = async (workOrderId, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  try {
    const result = await uploadWorkOrderPhoto(workOrderId, formData);
    toast.success('Photo uploaded successfully');
    // Update state
  } catch (error) {
    toast.error('Failed to upload photo');
  }
};
```

### 3. Add Time Tracking

```javascript
const [startTime, setStartTime] = useState(null);
const [timerActive, setTimerActive] = useState(false);

const startTimer = (workOrderId) => {
  setStartTime(Date.now());
  setTimerActive(true);
};

const stopTimer = async (workOrderId) => {
  const actualHours = (Date.now() - startTime) / (1000 * 60 * 60);
  await updateWorkOrderTime(workOrderId, actualHours);
  setTimerActive(false);
};
```

### 4. Add Material Inventory Check

```javascript
const checkMaterialAvailability = async (materials) => {
  try {
    const availability = await checkInventory(materials);
    return availability;
  } catch (error) {
    console.error('Error checking inventory:', error);
  }
};
```

## Styling Customization

### Change Color Scheme

Edit the color maps at the top of the component:

```javascript
const priorityColorMap = {
  critical: 'bg-red-100 text-red-800 border-red-300',    // Customize colors
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-blue-100 text-blue-800 border-blue-300'
};

const statusColorMap = {
  pending: 'bg-slate-100 text-slate-800 border-slate-300',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300'
};
```

### Customize Layout Grid

```javascript
// For work order cards
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
  {/* Instead of lg:grid-cols-2 for 3 columns on desktop */}
</div>

// For KPI cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
  {/* Adjust column count as needed */}
</div>
```

## State Management

### Using Context for Technician Data

```javascript
// Create TechnicianContext.jsx
import React, { createContext, useContext, useState } from 'react';

const TechnicianContext = createContext();

export const TechnicianProvider = ({ children }) => {
  const [technician, setTechnician] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);

  return (
    <TechnicianContext.Provider value={{
      technician,
      setTechnician,
      workOrders,
      setWorkOrders
    }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnician = () => useContext(TechnicianContext);
```

## Performance Optimization

### Memoization

```javascript
// Memoize filtered work orders
const filteredOrders = useMemo(() => {
  return workOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    if (search && !order.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });
}, [workOrders, statusFilter, priorityFilter, search]);

// Memoize stats calculations
const stats = useMemo(() => {
  return {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
  };
}, [workOrders]);
```

### Virtual Scrolling for Large Lists

```javascript
import { FixedSizeList } from 'react-window';

const WorkOrderList = ({ orders }) => (
  <FixedSizeList
    height={600}
    itemCount={orders.length}
    itemSize={300}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <WorkOrderCard order={orders[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

## Testing

### Unit Tests Example

```javascript
import { render, screen } from '@testing-library/react';
import TechnicianPortal from './TechnicianPortal';

describe('TechnicianPortal', () => {
  test('renders technician name', () => {
    render(<TechnicianPortal />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  test('displays work order count', () => {
    render(<TechnicianPortal />);
    expect(screen.getByText(/Work Orders/)).toBeInTheDocument();
  });

  test('filters work orders by status', () => {
    render(<TechnicianPortal />);
    // Test filtering logic
  });
});
```

## Troubleshooting

### Work Orders Not Loading
- Check API endpoint is correct
- Verify authentication token is valid
- Check console for CORS errors

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check dark mode settings
- Verify component imports are correct

### Performance Issues
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Implement pagination for large lists
- Use lazy loading for images

## Support & Resources

- **Tailwind CSS Docs**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev
- **React Documentation**: https://react.dev

---

**Last Updated**: January 18, 2026
