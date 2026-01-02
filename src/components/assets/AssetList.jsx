import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, bulkImportAssets, deleteAsset } from '../../api/assets';
import { AlertCircle, Plus, Upload, Download, Grid3x3, List, Settings2, CheckCircle, AlertTriangle, Clock, QrCode, Edit, MoreVertical, FileText, Calendar, Check, BarChart } from 'lucide-react';
import './AssetList.css';
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
    <div className="asset-list-container">
      {/* Header */}
      <div className="asset-list-header">
        <div className="header-title">
          <h1>Assets</h1>
          <p>Comprehensive view of all facility assets and equipment</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Assets:</span>
            <span className="stat-value">{kpi.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={() => navigate('/assets/new')}>
          <Plus size={20} /> Add Asset
        </button>
        <button className="btn btn-secondary" onClick={handleImport}>
          <Upload size={20} /> Import
        </button>
        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={20} /> Export
        </button>
        <button className="btn btn-secondary" onClick={() => setScannerOpen(true)}>
          <QrCode size={20} /> Scan QR
        </button>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid3x3 size={20} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={20} />
          </button>
          <button className="view-btn" title="Settings">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
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
          className="filter-select"
        >
          <option value="">Location</option>
          <option value="BUILDING_A">Building A</option>
          <option value="BUILDING_B">Building B</option>
          <option value="BUILDING_C">Building C</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <select
          value={filters.warranty}
          onChange={(e) => handleFilterChange('warranty', e.target.value)}
          className="filter-select"
        >
          <option value="">Warranty</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
        </select>

        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear all filters
        </button>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Asset Name</option>
            <option value="date_added">Date Added</option>
            <option value="next_service">Next Service</option>
            <option value="warranty">Warranty Status</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">Total Assets</h3>
            <p className="kpi-value">{kpi.total.toLocaleString()}</p>
            <p className="kpi-subtitle">Across all properties</p>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">Need Attention</h3>
            <p className="kpi-value">{kpi.needAttention}</p>
            <p className="kpi-subtitle">Maintenance required</p>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">Active Warranties</h3>
            <p className="kpi-value">{kpi.activeWarranties}</p>
            <p className="kpi-subtitle">Under warranty</p>
          </div>
        </div>

        <div className="kpi-card danger">
          <div className="kpi-icon">
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">Overdue PM</h3>
            <p className="kpi-value">{kpi.overdueHours}</p>
            <p className="kpi-subtitle">Past due date</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">Average Age</h3>
            <p className="kpi-value">{kpi.avgAge}y</p>
            <p className="kpi-subtitle">Portfolio average</p>
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
          <div className={`assets-container ${viewMode}`}>
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="asset-card"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <div className="asset-image">
                    <img src={asset.imageUrl || '/placeholder-asset.png'} alt={asset.name} />
                    <div className={`status-indicator ${asset.status?.toLowerCase()}`}></div>
                  </div>

                  <div className="asset-content">
                    <div className="asset-header">
                      <h3 className="asset-id">{asset.id}</h3>
                      <div className="asset-actions">
                        <button
                          className="asset-menu-btn"
                          title="Edit asset"
                          onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}/edit`); }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="asset-menu-btn"
                          title="More actions"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === asset.id ? null : asset.id); }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {menuOpenId === asset.id && (
                          <div className="asset-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button className="dropdown-item" onClick={() => { navigate(`/assets/${asset.id}/edit`); setMenuOpenId(null); }}>Edit</button>
                            <button className="dropdown-item danger" onClick={() => { setConfirmDeleteAsset(asset); setMenuOpenId(null); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h2 className="asset-name">{asset.name}</h2>
                    <p className="asset-category">
                      {asset.category} • {asset.type}
                    </p>
                    <p className="asset-location">Building • {asset.location || 'N/A'}</p>

                    <div className="maintenance-info">
                      <div className="maintenance-item">
                        <span className="label">Last Maintenance</span>
                        <span className="value">{asset.lastMaintenance || 'N/A'}</span>
                      </div>
                      <div className="maintenance-item">
                        <span className="label">Next Service</span>
                        <span className="value">{asset.nextService || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="warranty-badge">
                      {asset.warrantyStatus && (
                        <span className={`badge badge-${getStatusBadge(asset.warrantyStatus).color}`}>
                          {getStatusBadge(asset.warrantyStatus).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} />
                <h3>No assets found</h3>
                <p>Try adjusting your filters or add a new asset</p>
              </div>
            )}
          </div>

          {/* Delete confirmation modal */}
          {confirmDeleteAsset && (
            <Modal>
              <div className="delete-modal">
                <h3>Delete asset?</h3>
                <p>Are you sure you want to delete <strong>{confirmDeleteAsset.name}</strong>? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={handleCancelDelete} disabled={deleting}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleDeleteConfirmed} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
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
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <div className="action-icon"><FileText size={20} /></div>
            <h4>Bulk Operations</h4>
            <p>Update multiple assets</p>
          </button>
          <button className="action-card">
            <div className="action-icon"><Calendar size={20} /></div>
            <h4>Schedule PM</h4>
            <p>Preventive maintenance</p>
          </button>
          <button className="action-card">
            <div className="action-icon"><Check size={20} /></div>
            <h4>Update Status</h4>
            <p>Bulk status changes</p>
          </button>
          <button className="action-card">
            <div className="action-icon"><BarChart size={20} /></div>
            <h4>Generate Report</h4>
            <p>Asset reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}