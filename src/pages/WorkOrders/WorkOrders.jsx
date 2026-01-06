import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, MoreHorizontal, Eye, Edit2, Trash2, Plus, Download, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { getWorkOrders, deleteWorkOrder, bulkAssignWorkOrders } from '../../api/workOrders';

export default function WorkOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false); // true when 'select all across pages' chosen
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [assigneeSelected, setAssigneeSelected] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30'); // days
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState(null); // e.g., 'woNumber','title','priority','dueDate'
  const [sortDir, setSortDir] = useState('asc');

  const { data: workOrders = [], isLoading } = useQuery(
    ['workOrders', { statusFilter, priorityFilter, search, categoryFilter, assigneeFilter, dateRange, locationFilter }],
    () => getWorkOrders({ status: statusFilter, priority: priorityFilter, search, category: categoryFilter, assignee: assigneeFilter, dateRange, location: locationFilter })
  );

  const assignees = useMemo(() => {
    const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    const list = [...localUsers, ...workOrders.map(w => w.assignedTo).filter(Boolean)];
    const seen = new Set();
    return list.filter(u => {
      if (!u) return false;
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    }).filter(u => {
      if (!assigneeQuery) return true;
      return (u.name || '').toLowerCase().includes(assigneeQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(assigneeQuery.toLowerCase());
    });
  }, [workOrders, assigneeQuery]);

  const bulkAssignMutation = useMutation(({ ids, assignee, filters }) => bulkAssignWorkOrders({ ids, assignee, filters }), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('workOrders');
      toast.success(`Assigned ${data.updatedCount} work orders`);
      setSelected([]);
      setSelectAllMode(false);
      setBulkModalOpen(false);
    },
    onError: () => toast.error('Bulk assign failed'),
  });

  // local sorting before pagination
  const displayedWorkOrders = useMemo(() => {
    let arr = [...workOrders];
    if (sortBy) {
      arr.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        // handle nested fields
        if (sortBy === 'asset') {
          valA = a.asset?.name || '';
          valB = b.asset?.name || '';
        }
        if (sortBy === 'assignedTo') {
          valA = a.assignedTo?.name || '';
          valB = b.assignedTo?.name || '';
        }
        if (sortBy === 'dueDate') {
          valA = a.dueDate || '';
          valB = b.dueDate || '';
          const dateA = valA ? new Date(valA) : new Date(0);
          const dateB = valB ? new Date(valB) : new Date(0);
          if (dateA < dateB) return sortDir === 'asc' ? -1 : 1;
          if (dateA > dateB) return sortDir === 'asc' ? 1 : -1;
          return 0;
        }

        const A = typeof valA === 'string' ? valA.toLowerCase() : (valA || '').toString();
        const B = typeof valB === 'string' ? valB.toLowerCase() : (valB || '').toString();
        if (A < B) return sortDir === 'asc' ? -1 : 1;
        if (A > B) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [workOrders, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(0);
  };

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

  // derive categories, locations, and assignees for filter dropdowns
  const categories = useMemo(() => {
    const set = new Set();
    workOrders.forEach(w => w.category && set.add(w.category));
    return Array.from(set);
  }, [workOrders]);

  const locations = useMemo(() => {
    const set = new Set();
    workOrders.forEach(w => w.location && set.add(w.location.name));
    return Array.from(set);
  }, [workOrders]);

  const assigneeOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    workOrders.forEach(w => {
      if (w.assignedTo && !seen.has(w.assignedTo.id)) {
        seen.add(w.assignedTo.id);
        list.push(w.assignedTo);
      }
    });
    return list;
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
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border rounded-md bg-gray-50"
            type="text"
            placeholder="Search work orders by ID or title"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select className="filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="filter-select" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select className="filter-select" value={assigneeFilter} onChange={(e) => { setAssigneeFilter(e.target.value); setPage(0); }}>
          <option value="all">All Technicians</option>
          {assigneeOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select className="filter-select" value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(0); }}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>

        <select className="filter-select" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(0); }}>
          <option value="all">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="sort-controls ml-auto">
          <button className="px-3 py-1 border rounded-md text-sm" onClick={() => alert('Bulk assign')}>
            Bulk Assign
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2" onClick={() => alert('Export CSV')}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <label className="inline-flex items-start sm:items-center gap-3 text-sm text-gray-700 w-full sm:w-auto">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-indigo-600"
              checked={selectAllMode || (selected.length === displayedWorkOrders.length && displayedWorkOrders.length > 0)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected(displayedWorkOrders.map(w => w.id));
                  setSelectAllMode(false);
                } else {
                  setSelected([]);
                  setSelectAllMode(false);
                }
              }}
            />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div>
                <span className="font-medium">Select All ({displayedWorkOrders.length} items)</span>
                <div className="text-xs text-gray-400 sm:ml-2">Select all work orders</div>
              </div>
              <div className="mt-2 sm:mt-0">
                {selected.length > 0 && selected.length < workOrders.length && !selectAllMode && (
                  <button className="text-xs text-indigo-600 underline" onClick={() => { setSelectAllMode(true); }}>Select all {workOrders.length} items</button>
                )}
                {selectAllMode && (
                  <div className="text-xs text-gray-600">All <strong>{displayedWorkOrders.length}</strong> items selected</div>
                )}
              </div>
            </div>
          </label>

          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 rounded-md text-sm ${selected.length === 0 && !selectAllMode ? 'opacity-50 cursor-not-allowed border' : 'btn-primary'}`} onClick={() => { if (selected.length === 0 && !selectAllMode) return; setBulkModalOpen(true); }}>
              Bulk Assign
            </button>
            <button className="btn-primary px-3 py-1 rounded-md text-sm flex items-center gap-2" onClick={() => alert('Export CSV')}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="form-checkbox h-4 w-4" checked={selected.length === displayedWorkOrders.length && displayedWorkOrders.length > 0} onChange={(e) => { if (e.target.checked) setSelected(displayedWorkOrders.map(w => w.id)); else setSelected([]); }} /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => toggleSort('woNumber')}>
                  <div className="flex items-center gap-2">
                    <span>Work Order ID</span>
                    {sortBy === 'woNumber' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => toggleSort('title')}>
                  <div className="flex items-center gap-2">
                    <span>Title</span>
                    {sortBy === 'title' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 hidden md:table-cell cursor-pointer" onClick={() => toggleSort('asset')}>
                  <div className="flex items-center gap-2">
                    <span>Asset</span>
                    {sortBy === 'asset' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => toggleSort('assignedTo')}>
                  <div className="flex items-center gap-2">
                    <span>Assigned To</span>
                    {sortBy === 'assignedTo' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center gap-2">
                    <span>Priority</span>
                    {sortBy === 'priority' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer" onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    {sortBy === 'status' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 hidden md:table-cell cursor-pointer" onClick={() => toggleSort('dueDate')}>
                  <div className="flex items-center gap-2">
                    <span>Due Date</span>
                    {sortBy === 'dueDate' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr><td colSpan={9} className="p-6 text-center">Loading...</td></tr>
              )}

              {!isLoading && displayedWorkOrders.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center">No work orders found</td></tr>
              )}

              {!isLoading && displayedWorkOrders.length > 0 && (
                displayedWorkOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((wo) => {
                  const borderClass = (selected.includes(wo.id) || selectAllMode) ? 'border-left-selected' : (wo.priority === 'critical' || wo.priority === 'high' ? 'border-left-critical' : wo.priority === 'medium' ? 'border-left-medium' : 'border-left-low');
                  return (
                    <tr key={wo.id} className={`hover:bg-gray-50 py-2 sm:py-3 ${borderClass} ${selected.includes(wo.id) || selectAllMode ? 'selected-row' : ''}`}>
                      <td className="px-4 sm:px-6 py-3">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" checked={selectAllMode || selected.includes(wo.id)} onChange={() => {
                          if (selectAllMode) {
                            // switching off select-all across pages and selecting all page items except this one
                            setSelectAllMode(false);
                            const pageIds = displayedWorkOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(w => w.id);
                            const newSelected = pageIds.filter(id => id !== wo.id);
                            setSelected(newSelected);
                          } else {
                            setSelected(prev => prev.includes(wo.id) ? prev.filter(x => x !== wo.id) : [...prev, wo.id]);
                          }
                        }} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{wo.woNumber}</div>
                        <div className="text-xs text-gray-500">{wo.serviceType}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{wo.title || wo.description}</div>
                        <div className="text-xs text-gray-500">{wo.category}</div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                        <div className="text-sm text-gray-900">{wo.asset?.name || wo.location?.name}</div>
                        <div className="text-xs text-gray-500">{wo.location?.fullPath}</div>
                      </td>

                      <td className="px-4 sm:px-6 py-3">
                        {wo.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <img src={wo.assignedTo.avatar || '/avatar-placeholder.png'} alt="avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                            <div className="text-sm text-gray-900">{wo.assignedTo.name}</div>
                          </div>
                        ) : (<div className="text-sm text-gray-500">Unassigned</div>)}
                      </td>

                      <td className="px-4 sm:px-6 py-3">{priorityBadge(wo.priority)}</td>

                      <td className="px-4 sm:px-6 py-3">{statusBadge(wo.status)}</td>

                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-sm text-indigo-600 px-2 py-1 border rounded-md flex items-center gap-2" onClick={() => navigate(`/work-orders/${wo.id}`)}>
                            <Eye size={14} /> View
                          </button>

                          {wo.status === 'open' && <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Start</button>}
                          {wo.status === 'in_progress' && <button className="text-sm bg-green-600 text-white px-3 py-1 rounded-md">Complete</button>}
                          {wo.status === 'completed' && <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md">Completed</button>}
                          {wo.status === 'overdue' && <button className="text-sm bg-red-600 text-white px-3 py-1 rounded-md">Overdue</button>}

                          <button className="text-sm text-gray-600 p-2 rounded-md hover:bg-gray-100" onClick={() => deleteMutation.mutate(wo.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {(page * rowsPerPage) + 1}-{Math.min((page + 1) * rowsPerPage, displayedWorkOrders.length)} of {displayedWorkOrders.length} work orders</div>
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

      {/* Bulk Assign Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setBulkModalOpen(false); setConfirmStep(false); setAssigneeSelected(null); setAssigneeQuery(''); }} />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Bulk Assign Work Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Assign selected work orders to a technician.</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => { setBulkModalOpen(false); setConfirmStep(false); setAssigneeSelected(null); setAssigneeQuery(''); }} aria-label="Close">
                <X />
              </button>
            </div>

            {!confirmStep ? (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Search technician</label>
                  <input value={assigneeQuery} onChange={(e) => setAssigneeQuery(e.target.value)} placeholder="Search by name or email" className="mt-1 block w-full border rounded-md p-2" />
                </div>

                <div className="mt-3 max-h-40 overflow-auto border rounded-md p-2">
                  {assignees.length === 0 ? (
                    <div className="text-sm text-gray-500">No technicians found</div>
                  ) : (
                    <ul className="space-y-2">
                      {assignees.map((u) => (
                        <li key={u.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${assigneeSelected && assigneeSelected.id === u.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`} onClick={() => setAssigneeSelected(u)}>
                          <img src={u.avatar || '/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email || ''}</div>
                          </div>
                          <div className="ml-auto text-xs text-gray-400">{workOrders.filter(w => w.assignedTo && w.assignedTo.id === u.id).length} assigned</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  {selectAllMode ? (
                    <div>Assigning <strong>{workOrders.length}</strong> work orders (all matching current filters).</div>
                  ) : (
                    <div>Assigning <strong>{selected.length}</strong> work orders.</div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button className="px-3 py-1 border rounded-md" onClick={() => { setBulkModalOpen(false); setConfirmStep(false); setAssigneeSelected(null); setAssigneeQuery(''); }}>Cancel</button>
                  <button className={`px-3 py-1 rounded-md ${assigneeSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`} onClick={() => {
                    if (!assigneeSelected) { toast.error('Please select a technician'); return; }
                    setConfirmStep(true);
                  }} disabled={!assigneeSelected}>{assigneeSelected ? `Assign to ${assigneeSelected.name}` : 'Assign'}</button>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <img src={assigneeSelected.avatar || '/avatar-placeholder.png'} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-900">{assigneeSelected.name}</div>
                    <div className="text-sm text-gray-500">{assigneeSelected.email || ''}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 modal-confirm">{selectAllMode ? (
                  <div>You are about to assign <strong>{workOrders.length}</strong> work orders to <strong>{assigneeSelected.name}</strong>.</div>
                ) : (
                  <div>You are about to assign <strong>{selected.length}</strong> work orders to <strong>{assigneeSelected.name}</strong>.</div>
                )}</div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button className="px-3 py-1 border rounded-md" onClick={() => setConfirmStep(false)}>Back</button>
                  <button className={`px-3 py-1 rounded-md bg-red-600 text-white`} onClick={() => {
                    const assignee = assigneeSelected;
                    if (selectAllMode) {
                      bulkAssignMutation.mutate({ ids: null, assignee, filters: { status: statusFilter, priority: priorityFilter, search } });
                    } else {
                      bulkAssignMutation.mutate({ ids: selected, assignee, filters: {} });
                    }
                  }} disabled={bulkAssignMutation.isLoading}>{bulkAssignMutation.isLoading ? 'Assigning...' : `Confirm and Assign`}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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