import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, MoreHorizontal, Eye, Edit2, Trash2, Plus, Download } from 'lucide-react';
import { getWorkOrders, deleteWorkOrder } from '../../api/workOrders';

export default function WorkOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data: workOrders = [], isLoading } = useQuery(
    ['workOrders', { statusFilter, priorityFilter, search }],
    () => getWorkOrders({ status: statusFilter, priority: priorityFilter, search })
  );

  const deleteMutation = useMutation(deleteWorkOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('workOrders');
      toast.success('Work order deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const stats = useMemo(() => {
    const total = workOrders.length;
    const open = workOrders.filter(w => w.status === 'open').length;
    const inProgress = workOrders.filter(w => w.status === 'in_progress').length;
    const completed = workOrders.filter(w => w.status === 'completed').length;
    const overdue = workOrders.filter(w => w.status === 'overdue').length;
    return { total, open, inProgress, completed, overdue };
  }, [workOrders]);

  function priorityBadge(p) {
    if (p === 'critical') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Critical</span>;
    if (p === 'high') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">High</span>;
    if (p === 'medium') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Medium</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Low</span>;
  }

  function statusBadge(s) {
    if (s === 'open') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Open</span>;
    if (s === 'in_progress') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">In Progress</span>;
    if (s === 'completed') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Completed</span>;
    if (s === 'overdue') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Overdue</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{s}</span>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header + Breadcrumb */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">Dashboard &gt; <span className="text-gray-700">All Work Orders</span></nav>
        <h1 className="text-2xl font-semibold text-gray-900">All Work Orders</h1>
        <p className="text-sm text-gray-500">Comprehensive view of all maintenance work orders in the system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total Open</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">+3</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
          </div>
          <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">+2</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
          </div>
          <div className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">+12</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Overdue</div>
            <div className="text-3xl font-bold text-gray-900">{stats.overdue}</div>
          </div>
          <div className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded-full">+3</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-md bg-gray-50"
              placeholder="Search work orders by ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="border rounded-md p-2 bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select className="border rounded-md p-2 bg-white" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="ml-auto flex gap-2">
            <button className="px-3 py-1 border rounded-md text-sm" onClick={() => alert('Bulk assign')}>
              Bulk Assign
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2" onClick={() => alert('Export CSV')}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Work Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Asset</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Due Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={8} className="p-6 text-center">Loading...</td></tr>
            ) : workOrders.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center">No work orders found</td></tr>
            ) : (
              workOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{wo.woNumber}</div>
                    <div className="text-xs text-gray-500">{wo.serviceType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{wo.title || wo.description}</div>
                    <div className="text-xs text-gray-500">{wo.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{wo.asset?.name || wo.location?.name}</div>
                    <div className="text-xs text-gray-500">{wo.location?.fullPath}</div>
                  </td>
                  <td className="px-4 py-3">
                    {wo.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <img src={wo.assignedTo.avatar || '/avatar-placeholder.png'} alt="avatar" className="w-7 h-7 rounded-full" />
                        <div className="text-sm text-gray-900">{wo.assignedTo.name}</div>
                      </div>
                    ) : (<div className="text-sm text-gray-500">Unassigned</div>)}
                  </td>
                  <td className="px-4 py-3">{priorityBadge(wo.priority)}</td>
                  <td className="px-4 py-3">{statusBadge(wo.status)}</td>
                  <td className="px-4 py-3">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-sm text-indigo-600 px-2 py-1 border rounded-md flex items-center gap-2" onClick={() => navigate(`/work-orders/${wo.id}`)}>
                        <Eye size={14} /> View
                      </button>
                      <button className="text-sm text-gray-600 p-2 rounded-md hover:bg-gray-100" onClick={() => deleteMutation.mutate(wo.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {(page * rowsPerPage) + 1}-{Math.min((page + 1) * rowsPerPage, workOrders.length)} of {workOrders.length} work orders</div>
          <div className="flex items-center gap-2">
            <select className="border rounded p-1" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <div>
              <button className="px-3 py-1 border rounded-l" onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
              <button className="px-3 py-1 border rounded-r" onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-2">
        <div className="grid grid-cols-4 gap-4">
          <button className="bg-indigo-600 text-white rounded-md px-4 py-2 flex items-center gap-2" onClick={() => navigate('/work-orders/new')}>
            <Plus size={16} /> Create Work Order
          </button>
          <button className="border rounded-md px-4 py-2">Bulk Assign</button>
          <button className="border rounded-md px-4 py-2">Export CSV</button>
          <div />
        </div>
      </div>
    </div>
  );
}