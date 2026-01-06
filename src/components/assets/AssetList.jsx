import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, bulkImportAssets, deleteAsset } from '../../api/assets';
import { AlertCircle, Plus, Upload, Download, Grid3x3, List, Settings2, CheckCircle, AlertTriangle, Clock, QrCode, Edit, MoreVertical, FileText, Calendar, Check, BarChart } from 'lucide-react';
// styles migrated to Tailwind - see AssetList.css removal planned
import Modal from '../common/Modal';
import AssetQRScanner from './AssetQRScanner';

export default function AssetList() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [itemsPerPage] = useState(8);

  // Menu & Delete state
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    status: '',
    warranty: ''
  });

  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchAssets();
  }, [currentPage, filters, sortBy]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
        sort: sortBy
      };
      const response = await getAssets(params);
      setAssets(response.data || []);
      setTotalAssets(response.total || 0);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      status: '',
      warranty: ''
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csv = [
      ['Asset ID', 'Name', 'Category', 'Location', 'Status', 'Warranty Status'],
      ...assets.map(asset => [
        asset.id,
        asset.name,
        asset.category,
        asset.location,
        asset.status,
        asset.warrantyStatus
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (file) {
          await bulkImportAssets(file);
          fetchAssets();
        }
      } catch (error) {
        console.error('Error importing assets:', error);
      }
    };
    input.click();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE_WARRANTY': { label: 'Active Warranty', color: 'success' },
      'WARRANTY_EXPIRED': { label: 'Warranty Expired', color: 'danger' },
      'EXPIRING_SOON': { label: 'Expiring Soon', color: 'warning' },
      'OVERDUE': { label: 'Overdue', color: 'danger' }
    };
    const config = statusConfig[status] || { label: status, color: 'secondary' };
    return config;
  };

  const getKPIData = () => {
    const needAttention = assets.filter(a => a.status === 'NEEDS_ATTENTION').length;
    const activeWarranties = assets.filter(a => a.warrantyStatus === 'ACTIVE_WARRANTY').length;
    const overdueHours = assets.filter(a => a.maintenanceStatus === 'OVERDUE').length;
    const avgAge = assets.length > 0 ? (assets.reduce((sum, a) => sum + (a.ageYears || 0), 0) / assets.length).toFixed(1) : 0;

    return {
      total: totalAssets,
      needAttention,
      activeWarranties,
      overdueHours,
      avgAge
    };
  };

  const kpi = getKPIData();
  const totalPages = Math.ceil(totalAssets / itemsPerPage);

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteAsset) return;
    try {
      setDeleting(true);
      await deleteAsset(confirmDeleteAsset.id);
      setConfirmDeleteAsset(null);
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteAsset(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Assets</h1>
            <p className="text-sm text-muted-foreground">Comprehensive view of all facility assets and equipment</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs uppercase text-gray-500 font-semibold">Total Assets:</div>
              <div className="text-2xl font-bold">{kpi.total.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => navigate('/assets/new')}>
          <Plus size={20} /> Add Asset
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border" onClick={handleImport}>
          <Upload size={20} /> Import
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border" onClick={handleExport}>
          <Download size={20} /> Export
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border" onClick={() => setScannerOpen(true)}>
          <QrCode size={20} /> Scan QR
        </button>

        <div className="ml-auto inline-flex items-center gap-2 bg-card border rounded-md p-1">
          <button 
            className={`${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'} p-2 rounded`} 
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid3x3 size={20} />
          </button>
          <button 
            className={`${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'} p-2 rounded`} 
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={20} />
          </button>
          <button className="text-gray-500 p-2 rounded" title="Settings">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg shadow flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Category</option>
          <option value="HVAC">HVAC</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="SECURITY">Security</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Location</option>
          <option value="BUILDING_A">Building A</option>
          <option value="BUILDING_B">Building B</option>
          <option value="BUILDING_C">Building C</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <select
          value={filters.warranty}
          onChange={(e) => handleFilterChange('warranty', e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Warranty</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
        </select>

        <button className="text-indigo-600 font-semibold underline" onClick={handleClearFilters}>
          Clear all filters
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="name">Asset Name</option>
            <option value="date_added">Date Added</option>
            <option value="next_service">Next Service</option>
            <option value="warranty">Warranty Status</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-card shadow-sm flex items-center hover:shadow-md transition">
          <div className="p-2 w-10 h-10 rounded-md bg-gray-200 text-gray-800 flex items-center justify-center mr-3">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1 ml-2">
            <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
            <p className="text-2xl font-semibold text-gray-900">{kpi.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Across all properties</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card shadow-sm flex items-center hover:shadow-md transition">
          <div className="p-2 w-10 h-10 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center mr-3">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 ml-2">
            <h3 className="text-sm font-medium text-gray-500">Need Attention</h3>
            <p className="text-2xl font-semibold text-gray-900">{kpi.needAttention}</p>
            <p className="text-sm text-gray-500">Maintenance required</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card shadow-sm flex items-center hover:shadow-md transition">
          <div className="p-2 w-10 h-10 rounded-md bg-green-100 text-green-700 flex items-center justify-center mr-3">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1 ml-2">
            <h3 className="text-sm font-medium text-gray-500">Active Warranties</h3>
            <p className="text-2xl font-semibold text-gray-900">{kpi.activeWarranties}</p>
            <p className="text-sm text-gray-500">Under warranty</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card shadow-sm flex items-center hover:shadow-md transition">
          <div className="p-2 w-10 h-10 rounded-md bg-red-100 text-red-700 flex items-center justify-center mr-3">
            <Clock size={24} />
          </div>
          <div className="flex-1 ml-2">
            <h3 className="text-sm font-medium text-gray-500">Overdue PM</h3>
            <p className="text-2xl font-semibold text-gray-900">{kpi.overdueHours}</p>
            <p className="text-sm text-gray-500">Past due date</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card shadow-sm flex items-center hover:shadow-md transition">
          <div className="p-2 w-10 h-10 rounded-md bg-gray-200 text-gray-800 flex items-center justify-center mr-3">
            <Clock size={24} />
          </div>
          <div className="flex-1 ml-2">
            <h3 className="text-sm font-medium text-gray-500">Average Age</h3>
            <p className="text-2xl font-semibold text-gray-900">{kpi.avgAge}y</p>
            <p className="text-sm text-gray-500">Portfolio average</p>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading assets...</p>
        </div>
      ) : (
        <>
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-4'}`}>
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-card rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition p-4 flex flex-col"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <div className="relative w-full pb-[100%] bg-gray-100 rounded overflow-hidden">
                    <img src={asset.imageUrl || '/placeholder-asset.png'} alt={asset.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white ${asset.status === 'ACTIVE' ? 'bg-green-500' : asset.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                  </div>

                  <div className="mt-3 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{asset.id}</h3>
                      <div className="flex items-center gap-2 relative">
                        <button
                          className="p-1 text-gray-500 rounded hover:bg-gray-50"
                          title="Edit asset"
                          onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}/edit`); }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-500 rounded hover:bg-gray-50"
                          title="More actions"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === asset.id ? null : asset.id); }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {menuOpenId === asset.id && (
                          <div className="absolute right-0 top-8 w-40 bg-card border rounded-md shadow-md z-20" onClick={(e) => e.stopPropagation()}>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => { navigate(`/assets/${asset.id}/edit`); setMenuOpenId(null); }}>Edit</button>
                            <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50" onClick={() => { setConfirmDeleteAsset(asset); setMenuOpenId(null); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold">{asset.name}</h2>
                    <p className="text-sm text-gray-600">{asset.category} • {asset.type}</p>
                    <p className="text-sm text-gray-500">Building • {asset.location || 'N/A'}</p>

                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-1">
                      {((asset.imageUrls && asset.imageUrls.length > 0) ? asset.imageUrls : [asset.imageUrl || '/placeholder-asset.svg']).slice(0,3).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-md overflow-hidden border" onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}`); }}>
                          <img src={img} alt={`${asset.name} thumb ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Last Maintenance</div>
                        <div className="text-sm font-semibold">{asset.lastMaintenance || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Next Service</div>
                        <div className="text-sm font-semibold">{asset.nextService || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {asset.warrantyStatus && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(asset.warrantyStatus).color === 'success' ? 'bg-green-100 text-green-700' : getStatusBadge(asset.warrantyStatus).color === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {getStatusBadge(asset.warrantyStatus).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-lg shadow p-8 text-center text-gray-500">
                <AlertCircle size={48} className="mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">No assets found</h3>
                <p>Try adjusting your filters or add a new asset</p>
              </div>
            )}
          </div>

          {/* Delete confirmation modal */}
          {confirmDeleteAsset && (
            <Modal>
              <div className="max-w-lg w-full p-6 bg-card rounded-lg shadow">
                <h3 className="text-lg font-semibold">Delete asset?</h3>
                <p>Are you sure you want to delete <strong>{confirmDeleteAsset.name}</strong>? This action cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button className="px-3 py-2 rounded-md border" onClick={handleCancelDelete} disabled={deleting}>Cancel</button>
                  <button className="px-3 py-2 rounded-md bg-indigo-600 text-white" onClick={handleDeleteConfirmed} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
                </div>
              </div>
            </Modal>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                if (page <= 3 || page > totalPages - 3 || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === 4 || page === totalPages - 3) {
                  return <span key={page} className="pagination-dots">...</span>;
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>

              <span className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalAssets)} of {totalAssets} assets
              </span>
            </div>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      <AssetQRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(val) => {
          // try to navigate to matching asset id or show result
          const found = assets.find(a => String(a.id) === String(val) || (a.assetTag && String(a.assetTag) === String(val)));
          if (found) {
            navigate(`/assets/${found.id}`);
          } else {
            alert(`Scanned value: ${val}`);
          }
          setScannerOpen(false);
        }}
      />

      {/* Quick Actions */}
      <div className="bg-card p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 rounded-md border text-left flex flex-col gap-1">
            <div className="text-indigo-600"><FileText size={20} /></div>
            <h4 className="font-semibold">Bulk Operations</h4>
            <p className="text-sm text-gray-500">Update multiple assets</p>
          </button>
          <button className="p-3 rounded-md border text-left flex flex-col gap-1">
            <div className="text-indigo-600"><Calendar size={20} /></div>
            <h4 className="font-semibold">Schedule PM</h4>
            <p className="text-sm text-gray-500">Preventive maintenance</p>
          </button>
          <button className="p-3 rounded-md border text-left flex flex-col gap-1">
            <div className="text-indigo-600"><Check size={20} /></div>
            <h4 className="font-semibold">Update Status</h4>
            <p className="text-sm text-gray-500">Bulk status changes</p>
          </button>
          <button className="p-3 rounded-md border text-left flex flex-col gap-1">
            <div className="text-indigo-600"><BarChart size={20} /></div>
            <h4 className="font-semibold">Generate Report</h4>
            <p className="text-sm text-gray-500">Asset reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}