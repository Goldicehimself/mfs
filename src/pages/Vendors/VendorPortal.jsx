import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, CheckCircle2, Clock, AlertCircle, FileText, MessageSquare, Download, Eye, Calendar, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data - Replace with actual API calls
const mockVendorData = {
  id: 'vendor_001',
  name: 'ABC HVAC Services',
  rating: 4.8,
  totalSpend: 45000,
  monthlySpend: 5000,
  activeWorkOrders: 12,
  completedOrders: 84,
  nextPaymentDate: '2026-02-15',
};

const mockWorkOrders = [
  {
    id: 'WO001',
    title: 'HVAC System Maintenance',
    location: 'Building A - 3rd Floor',
    status: 'in_progress',
    priority: 'medium',
    scheduledDate: '2026-01-20',
    assignedTech: 'John Smith',
    description: 'Quarterly HVAC maintenance and filter replacement',
    estimatedHours: 4,
    notesCount: 2,
    attachmentsCount: 1,
  },
  {
    id: 'WO002',
    title: 'Emergency AC Repair',
    location: 'Building B - 5th Floor',
    status: 'completed',
    priority: 'critical',
    scheduledDate: '2026-01-18',
    assignedTech: 'Jane Doe',
    description: 'AC unit malfunction - refrigerant leak',
    estimatedHours: 3,
    notesCount: 5,
    attachmentsCount: 2,
    completedDate: '2026-01-18',
  },
  {
    id: 'WO003',
    title: 'Quarterly Inspection',
    location: 'Building C - All Floors',
    status: 'open',
    priority: 'low',
    scheduledDate: '2026-01-25',
    assignedTech: 'Mike Johnson',
    description: 'Complete system inspection and documentation',
    estimatedHours: 6,
    notesCount: 0,
    attachmentsCount: 0,
  },
  {
    id: 'WO004',
    title: 'Filter Replacement',
    location: 'Building A - 1st Floor',
    status: 'in_progress',
    priority: 'low',
    scheduledDate: '2026-01-21',
    assignedTech: 'Sarah Davis',
    description: 'Replace HVAC filters in main lobby unit',
    estimatedHours: 1.5,
    notesCount: 1,
    attachmentsCount: 0,
  },
];

const mockServiceRequests = [
  {
    id: 'SR-2024-001',
    title: 'Emergency HVAC Expansion',
    description: 'Need additional HVAC capacity for new server room. Urgent installation required within 2 weeks.',
    status: 'pending',
    priority: 'high',
    requestDate: '2026-02-20',
    estimatedCost: 8000,
    attachments: 1
  },
  {
    id: 'SR-2024-002',
    title: 'Preventive Maintenance Contract',
    description: 'Request for monthly preventive maintenance contract for Building A systems. Current reactive service is becoming cost-prohibitive.',
    status: 'approved',
    priority: 'medium',
    requestDate: '2026-02-15',
    approvedDate: '2026-02-18',
    estimatedCost: 2000
  },
  {
    id: 'SR-2024-003',
    title: 'System Upgrade Assessment',
    description: 'Request for comprehensive assessment of existing HVAC systems for upgrade recommendations.',
    status: 'submitted',
    priority: 'low',
    requestDate: '2026-02-10',
    estimatedCost: 500
  }
];

const mockInvoices = [
  {
    id: 'INV001',
    amount: 2500,
    date: '2026-01-10',
    dueDate: '2026-02-10',
    status: 'pending',
    description: 'Monthly maintenance contract',
  },
  {
    id: 'INV002',
    amount: 1850,
    date: '2025-12-20',
    dueDate: '2026-01-20',
    status: 'paid',
    description: 'Emergency repair service',
  },
  {
    id: 'INV003',
    amount: 3200,
    date: '2025-12-05',
    dueDate: '2026-01-05',
    status: 'paid',
    description: 'System installation',
  },
];

const mockDocuments = [
  {
    id: 'DOC001',
    name: 'Service Agreement.pdf',
    type: 'Agreement',
    uploadDate: '2025-01-15',
    size: '2.4 MB',
  },
  {
    id: 'DOC002',
    name: 'Insurance Certificate.pdf',
    type: 'Insurance',
    uploadDate: '2025-12-01',
    size: '1.1 MB',
  },
  {
    id: 'DOC003',
    name: 'Pricing Schedule.xlsx',
    type: 'Pricing',
    uploadDate: '2025-11-20',
    size: '856 KB',
  },
];

const VendorPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  let logout = null;
  try {
    const auth = useAuth();
    logout = auth?.logout;
  } catch (err) {
    console.error('Auth context not available:', err);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'completed':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      pending: 'Pending',
      paid: 'Paid',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">Vendor Portal</h1>
            <p className="text-indigo-700 dark:text-indigo-300 mt-1">
              View and manage your assigned work orders, submit service requests, and track performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-indigo-700 dark:text-indigo-400">Your Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {mockVendorData.rating}
                </span>
                <span className="text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={<DollarSign className="h-5 w-5" />}
          title="Monthly Spend"
          value={`$${mockVendorData.monthlySpend.toLocaleString()}`}
          color="indigo"
        />
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Total Spend"
          value={`$${mockVendorData.totalSpend.toLocaleString()}`}
          color="blue"
        />
        <KPICard
          icon={<Clock className="h-5 w-5" />}
          title="Active Work Orders"
          value={mockVendorData.activeWorkOrders}
          color="amber"
        />
        <KPICard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Completed"
          value={mockVendorData.completedOrders}
          color="emerald"
        />
        <KPICard
          icon={<Calendar className="h-5 w-5" />}
          title="Next Payment"
          value={mockVendorData.nextPaymentDate}
          subtext="Due date"
          color="rose"
        />
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 p-4">
              {[
                { id: 'overview', label: 'My Work Orders' },
                { id: 'requests', label: 'Service Requests' },
                { id: 'invoices', label: 'Invoices' },
                { id: 'documents', label: 'Documents' },
                { id: 'performance', label: 'Performance' },
                { id: 'support', label: 'Support' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Work Orders Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Read-Only Access</p>
                    <p className="text-amber-800 dark:text-amber-200 text-xs mt-0.5">
                      You can view your assigned work orders and update their status. To request new work, use the Service Requests tab.
                    </p>
                  </div>
                </div>
                {mockWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{wo.title}</h3>
                          <Badge className={getStatusColor(wo.status)}>
                            {getStatusLabel(wo.status)}
                          </Badge>
                          <Badge
                            className={
                              wo.priority === 'critical'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100'
                                : wo.priority === 'medium'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100'
                            }
                          >
                            {wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{wo.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">{wo.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Assigned To</p>
                            <p className="font-medium text-gray-900 dark:text-white">{wo.assignedTech}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Scheduled</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(wo.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Est. Hours</p>
                            <p className="font-medium text-gray-900 dark:text-white">{wo.estimatedHours}h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Work Order ID</p>
                            <p className="font-medium text-gray-900 dark:text-white">{wo.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>📝 {wo.notesCount} notes</span>
                          <span>•</span>
                          <span>📎 {wo.attachmentsCount} attachments</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap" size="sm">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Service Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-900 dark:text-indigo-100 text-sm">Request New Work</p>
                      <p className="text-indigo-800 dark:text-indigo-200 text-xs mt-0.5">
                        Submit a service request for new work. Our team will review and convert approved requests to work orders.
                      </p>
                    </div>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap ml-4">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>

                {mockServiceRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      req.status === 'pending'
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                        : req.status === 'approved'
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{req.description}</p>
                      </div>
                      <Badge
                        className={
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100'
                        }
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Request Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(req.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Estimated Cost</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${req.estimatedCost ? req.estimatedCost.toLocaleString() : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Priority</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Request ID</p>
                        <p className="font-medium text-gray-900 dark:text-white">{req.id}</p>
                      </div>
                    </div>
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded text-sm text-rose-800 dark:text-rose-200 mt-3">
                        <p className="font-medium mb-1">Rejection Reason:</p>
                        <p>{req.rejectionReason}</p>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3">
                        ✓ Approved on {new Date(req.approvedDate).toLocaleDateString()} - Work order will be created
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-3">
                {mockInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{invoice.id}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{invoice.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Issue Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(invoice.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Due Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Amount</p>
                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                              ${invoice.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {mockDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* On-Time Completion */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">On-Time Completion</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 dark:bg-emerald-500" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">87%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Rating */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quality Rating</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">4.8/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 dark:bg-emerald-500" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Work Quality</span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">4.6/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Response Time</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Response</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">2.3 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fastest Response</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">15 minutes</span>
                    </div>
                  </div>
                </div>

                {/* Compliance */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Safety Standards</span>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                        Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">License Status</span>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Need Help?</h3>
                      <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
                        Contact our support team for any questions or issues with your account, work orders, or invoices.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="text-indigo-800 dark:text-indigo-200">
                          <span className="font-medium">Email:</span> support@maintainpro.com
                        </p>
                        <p className="text-indigo-800 dark:text-indigo-200">
                          <span className="font-medium">Phone:</span> 1-800-MAINTAIN
                        </p>
                        <p className="text-indigo-800 dark:text-indigo-200">
                          <span className="font-medium">Hours:</span> Monday - Friday, 8:00 AM - 6:00 PM EST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => alert('Starting chat support session...')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat Support
                  </Button>
                  <Button 
                    onClick={() => alert('Opening FAQs...')}
                    variant="outline" 
                    className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View FAQs
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <div className="flex justify-end">
        <Button
          onClick={async () => {
            if (logout) {
              await logout();
            }
            navigate('/login');
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ icon, title, value, subtext, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
  };

  const iconColor = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <div className={`p-4 border rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 bg-white/50 dark:bg-black/20 rounded-lg ${iconColor[color]}`}>{icon}</div>
      </div>
      <p className="text-xs font-medium opacity-75 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtext && <p className="text-xs opacity-75">{subtext}</p>}
    </div>
  );
};

export default VendorPortal;

