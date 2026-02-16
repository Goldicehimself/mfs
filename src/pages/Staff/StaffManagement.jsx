import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  CheckCircle2,
  TrendingUp,
  Star,
  Clock,
  Award,
  Eye,
  BarChart3,
  Target
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import mockWorkOrders from '../../mocks/mockWorkOrders';

// Mock data for staff members
const mockStaffData = {
  department: {
    name: 'Maintenance Department',
    totalStaff: 12,
    activeAssignments: 28,
    completionRate: 92,
    teamRating: 4.6
  },
  staffMembers: [
    {
      id: 'staff-001',
      name: 'John Smith',
      role: 'Senior Technician',
      department: 'Maintenance',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      assignedOrders: 8,
      completedOrders: 156,
      performance: 94,
      rating: 4.8,
      certifications: 5,
      lastActive: '2026-01-18T10:30:00',
      joinDate: '2022-03-15'
    },
    {
      id: 'staff-002',
      name: 'Sarah Johnson',
      role: 'Technician',
      department: 'Maintenance',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      assignedOrders: 6,
      completedOrders: 98,
      performance: 88,
      rating: 4.5,
      certifications: 3,
      lastActive: '2026-01-18T11:00:00',
      joinDate: '2023-06-20'
    },
    {
      id: 'staff-003',
      name: 'Mike Davis',
      role: 'Technician',
      department: 'Maintenance',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      email: 'mike.davis@company.com',
      phone: '+1 (555) 345-6789',
      assignedOrders: 5,
      completedOrders: 87,
      performance: 85,
      rating: 4.3,
      certifications: 4,
      lastActive: '2026-01-18T09:45:00',
      joinDate: '2023-01-10'
    },
    {
      id: 'staff-004',
      name: 'Emily Wilson',
      role: 'Junior Technician',
      department: 'Maintenance',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      email: 'emily.wilson@company.com',
      phone: '+1 (555) 456-7890',
      assignedOrders: 4,
      completedOrders: 45,
      performance: 82,
      rating: 4.2,
      certifications: 2,
      lastActive: '2026-01-18T14:20:00',
      joinDate: '2024-09-05'
    },
    {
      id: 'staff-005',
      name: 'David Brown',
      role: 'Senior Technician',
      department: 'Maintenance',
      status: 'on_leave',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      email: 'david.brown@company.com',
      phone: '+1 (555) 567-8901',
      assignedOrders: 2,
      completedOrders: 142,
      performance: 91,
      rating: 4.7,
      certifications: 6,
      lastActive: '2026-01-15T16:00:00',
      joinDate: '2021-11-22'
    }
  ]
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <Icon className={`h-5 w-5 text-${color}-600`} />
    </div>
  </motion.div>
);

// Staff Card Component
const StaffCard = ({ staff, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'on_leave':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <img
          src={staff.avatar}
          alt={staff.name}
          className="h-12 w-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{staff.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{staff.role}</p>
        </div>
        <Badge className={getStatusColor(staff.status)}>
          <span className="flex items-center gap-1">
            {staff.status === 'active' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {staff.status === 'active' ? 'Active' : 'On Leave'}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Assigned</p>
          <p className="font-semibold text-gray-900 dark:text-white">{staff.assignedOrders} orders</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Performance</p>
          <p className="font-semibold text-indigo-600">{staff.performance}%</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Completed</p>
          <p className="font-semibold text-gray-900 dark:text-white">{staff.completedOrders}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Rating</p>
          <p className="font-semibold text-amber-600 flex items-center gap-1">
            <Star className="h-3 w-3" />
            {staff.rating}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
      </div>
    </motion.div>
  );
};

export default function StaffManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [managementView, setManagementView] = useState('staff');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editDates, setEditDates] = useState({ startDate: '', endDate: '' });
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      staffName: 'Ifeanyi Cole',
      type: 'Annual',
      startDate: '2026-01-28',
      endDate: '2026-02-02',
      reason: 'Family event',
      status: 'Pending',
      managerName: 'Facility Manager',
      updatedAt: '2026-01-20',
    },
    {
      id: 2,
      staffName: 'Sarah Johnson',
      type: 'Sick',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      reason: 'Medical appointment',
      status: 'Pending',
      managerName: 'Facility Manager',
      updatedAt: '2026-01-21',
    },
  ]);

  const getCertificatesForStaff = (staff) => {
    if (!staff?.email) return [];
    try {
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const match = users.find(
        (u) => u.email?.toLowerCase() === staff.email.toLowerCase()
      );
      return match?.certificates || [];
    } catch (e) {
      return [];
    }
  };


  const filteredStaff = useMemo(() => {
    return mockStaffData.staffMembers.filter((staff) => {
      if (statusFilter !== 'all' && staff.status !== statusFilter) return false;
      if (roleFilter !== 'all' && staff.role !== roleFilter) return false;
      if (search && !staff.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter, roleFilter]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      alert(`Note added for ${selectedStaff.name}`);
      setNoteModalOpen(false);
      setNewNote('');
    } else {
      alert('Please enter a note');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString();
  };

  const getLeaveStatusClass = (status) => {
    if (status === 'Approved') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
    if (status === 'Rejected') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  };

  const pendingLeaveRequests = leaveRequests.filter((request) => request.status === 'Pending');

  const updateLeaveStatus = (requestId, status) => {
    setLeaveRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : request
      )
    );
  };

  const beginEditDates = (request) => {
    setEditingRequestId(request.id);
    setEditDates({ startDate: request.startDate, endDate: request.endDate });
  };

  const saveEditDates = (requestId) => {
    if (!editDates.startDate || !editDates.endDate) {
      alert('Select both start and end dates.');
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              startDate: editDates.startDate,
              endDate: editDates.endDate,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : request
      )
    );

    setEditingRequestId(null);
    setEditDates({ startDate: '', endDate: '' });
  };

  const handleAssignWork = () => {
    if (!selectedWorkOrderId) {
      alert('Select a work order to assign.');
      return;
    }

    const selectedOrder = mockWorkOrders.find((order) => order.id === selectedWorkOrderId);
    const orderLabel = selectedOrder ? `${selectedOrder.woNumber} - ${selectedOrder.title}` : selectedWorkOrderId;
    const dueLabel = assignmentDueDate ? ` (Due ${assignmentDueDate})` : '';

    alert(`Work order assigned to ${selectedStaff.name}: ${orderLabel}${dueLabel}`);
    setAssignmentModalOpen(false);
    setSelectedWorkOrderId('');
    setAssignmentDueDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage team members, assignments, and performance</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Staff"
          value={mockStaffData.department.totalStaff}
          color="indigo"
        />
        <StatCard
          icon={Target}
          label="Active Assignments"
          value={mockStaffData.department.activeAssignments}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${mockStaffData.department.completionRate}%`}
          color="emerald"
        />
        <StatCard
          icon={Award}
          label="Team Rating"
          value={
            <span className="flex items-center gap-1">
              {mockStaffData.department.teamRating}
              <Star className="h-4 w-4 text-amber-500" />
            </span>
          }
          color="amber"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={managementView === 'staff' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setManagementView('staff')}
        >
          Staff Directory
        </Button>
        <Button
          variant={managementView === 'leave' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setManagementView('leave')}
        >
          Leave Approvals
        </Button>
      </div>

      {managementView === 'leave' ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Leave Approvals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pending requests need manager action.
            </p>
          </CardHeader>
          <CardContent>
            {pendingLeaveRequests.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No pending leave approvals.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingLeaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-gray-200 dark:border-zinc-700 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {request.staffName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {request.type} leave
                        </p>
                      </div>
                      <Badge className={getLeaveStatusClass(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    {editingRequestId === request.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={editDates.startDate}
                            onChange={(event) =>
                              setEditDates((prev) => ({
                                ...prev,
                                startDate: event.target.value,
                              }))
                            }
                            className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700"
                          />
                          <Input
                            type="date"
                            value={editDates.endDate}
                            onChange={(event) =>
                              setEditDates((prev) => ({
                                ...prev,
                                endDate: event.target.value,
                              }))
                            }
                            className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                            onClick={() => saveEditDates(request.id)}
                          >
                            Save Dates
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRequestId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateLeaveStatus(request.id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-300 text-rose-700 hover:bg-rose-50"
                          onClick={() => updateLeaveStatus(request.id, 'Rejected')}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => beginEditDates(request)}
                        >
                          Edit Dates
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-700/50 font-medium hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/50 dark:hover:to-green-900/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900">
                    <SelectItem value="all" className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-2 hover:from-emerald-700 hover:to-green-700 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                        All Status
                      </span>
                    </SelectItem>
                    <SelectItem value="active" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer">Active</SelectItem>
                    <SelectItem value="on_leave" className="hover:bg-amber-50 dark:hover:bg-amber-900/30 cursor-pointer">On Leave</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-700/50 font-medium hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900">
                    <SelectItem value="all" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 hover:from-purple-700 hover:to-pink-700 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                        All Roles
                      </span>
                    </SelectItem>
                    <SelectItem value="Senior Technician" className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">Senior Technician</SelectItem>
                    <SelectItem value="Technician" className="hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">Technician</SelectItem>
                    <SelectItem value="Junior Technician" className="hover:bg-cyan-50 dark:hover:bg-cyan-900/30 cursor-pointer">Junior Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Team Members ({filteredStaff.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  onSelect={() => setSelectedStaff(staff)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Staff Detail Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStaff(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <CardHeader className="border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">
                      {selectedStaff.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedStaff.role} - {selectedStaff.department}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStaff(null)}
                  >
                    <span className="text-lg leading-none">x</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Join Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedStaff.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Active</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedStaff.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Performance Metrics */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Performance</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{ width: `${selectedStaff.performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedStaff.performance}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</p>
                      <p className="text-xl font-bold text-amber-600 flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {selectedStaff.rating}/5.0
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certifications</p>
                      <p className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {selectedStaff.certifications}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Orders</p>
                      <p className="text-xl font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedStaff.completedOrders}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificates */}
                <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Certificates
                  </h4>
                  {getCertificatesForStaff(selectedStaff).length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No certificates uploaded.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getCertificatesForStaff(selectedStaff).map((cert) => (
                        <button
                          key={cert.id}
                          type="button"
                          onClick={() => window.open(cert.dataUrl, '_blank')}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-zinc-700 p-3 hover:border-emerald-400 hover:shadow-sm transition"
                        >
                          {cert.type === 'application/pdf' ? (
                            <div className="h-10 w-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                              PDF
                            </div>
                          ) : (
                            <img
                              src={cert.dataUrl}
                              alt={cert.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">
                              {cert.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(cert.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignment Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Active Assignments</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedStaff.assignedOrders} orders</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <Button
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => setAssignmentModalOpen(true)}
                  >
                    Assign Work
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPerformanceModalOpen(true)}
                  >
                    View Performance
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setNoteModalOpen(true)}
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Modal */}
      <AnimatePresence>
        {performanceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPerformanceModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Analysis
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Overall Score: {selectedStaff.performance}%
                  </p>
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: `${selectedStaff.performance}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Completed</p>
                    <p className="text-xl font-bold text-emerald-600">{selectedStaff.completedOrders}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
                    <p className="text-xs text-amber-700 dark:text-amber-300">Rating</p>
                    <p className="text-xl font-bold text-amber-600 flex items-center gap-1">
                      {selectedStaff.rating}
                      <Star className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPerformanceModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignmentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setAssignmentModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign Work Order
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Work Order
                  </label>
                  <Select value={selectedWorkOrderId} onValueChange={setSelectedWorkOrderId}>
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700">
                      <SelectValue placeholder="Choose a work order..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900">
                      {mockWorkOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.woNumber}: {order.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={assignmentDueDate}
                    onChange={(event) => setAssignmentDueDate(event.target.value)}
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAssignmentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={handleAssignWork}
                >
                  Assign
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Modal */}
      <AnimatePresence>
        {noteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setNoteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Staff Note
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNoteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={() => handleAddNote()}
                >
                  Save Note
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

