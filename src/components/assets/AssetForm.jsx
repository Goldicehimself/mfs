import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAsset, updateAsset, getAsset } from '../../api/assets';
import { ArrowLeft, Save, X } from 'lucide-react';
import './AssetForm.css';


export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    assetId: '',
    category: '',
    type: '',
    description: '',

    // Location & Details
    location: '',
    building: '',
    floor: '',
    room: '',

    // Technical Specifications
    manufacturer: '',
    model: '',
    serialNumber: '',
    specifications: '',

    // Installation & Warranty
    installDate: '',
    warrantyExpiry: '',
    warrantyProvider: '',

    // Maintenance
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    maintenanceFrequency: 'monthly',
    maintenanceProvider: '',

    // Cost & Financial
    purchasePrice: '',
    purchaseDate: '',
    depreciationRate: '',

    // Status & Notes
    status: 'active',
    notes: '',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const asset = await getAsset(id);
      setFormData({
        name: asset.name || '',
        assetId: asset.assetId || '',
        category: asset.category || '',
        type: asset.type || '',
        description: asset.description || '',
        location: asset.location || '',
        building: asset.building || '',
        floor: asset.floor || '',
        room: asset.room || '',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        specifications: asset.specifications || '',
        installDate: asset.installDate?.split('T')[0] || '',
        warrantyExpiry: asset.warrantyExpiry?.split('T')[0] || '',
        warrantyProvider: asset.warrantyProvider || '',
        lastMaintenanceDate: asset.lastMaintenanceDate?.split('T')[0] || '',
        nextMaintenanceDate: asset.nextMaintenanceDate?.split('T')[0] || '',
        maintenanceFrequency: asset.maintenanceFrequency || 'monthly',
        maintenanceProvider: asset.maintenanceProvider || '',
        purchasePrice: asset.purchasePrice || '',
        purchaseDate: asset.purchaseDate?.split('T')[0] || '',
        depreciationRate: asset.depreciationRate || '',
        status: asset.status || 'active',
        notes: asset.notes || '',
        imageUrl: asset.imageUrl || ''
      });

      if (asset.imageUrl) {
        setImagePreview(asset.imageUrl);
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.assetId.trim()) newErrors.assetId = 'Asset ID is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.installDate) newErrors.installDate = 'Install date is required';

    // Numeric validation
    if (formData.purchasePrice && Number(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'Purchase price must be 0 or greater';
    }

    if (formData.depreciationRate && (Number(formData.depreciationRate) < 0 || Number(formData.depreciationRate) > 100)) {
      newErrors.depreciationRate = 'Depreciation must be between 0 and 100';
    }

    // Date validation
    if (formData.installDate && formData.warrantyExpiry) {
      const install = new Date(formData.installDate);
      const warranty = new Date(formData.warrantyExpiry);
      if (warranty < install) newErrors.warrantyExpiry = 'Warranty expiry cannot be before installation date';
    }

    if (formData.lastMaintenanceDate && formData.nextMaintenanceDate) {
      const last = new Date(formData.lastMaintenanceDate);
      const next = new Date(formData.nextMaintenanceDate);
      if (next < last) newErrors.nextMaintenanceDate = 'Next maintenance must be after last maintenance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Basic file validation - only images under 5MB
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imageUrl: 'Only image files are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imageUrl: 'Image must be smaller than 5MB' }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // clear any image errors
      if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      let saved;
      if (isEditMode) {
        saved = await updateAsset(id, formData);
      } else {
        saved = await createAsset(formData);
      }

      // Upload image if provided
      try {
        if (imageFile) {
          const assetId = isEditMode ? id : (saved?.id || saved?.data?.id);
          if (assetId) {
            const { uploadAssetImage } = await import('../../api/assets');
            await uploadAssetImage(assetId, imageFile);
          }
        }
      } catch (imgErr) {
        console.warn('Image upload failed but asset saved:', imgErr);
      }

      navigate('/assets');
    } catch (error) {
      console.error('Error saving asset:', error);
      setErrors({ submit: error.message || 'Failed to save asset' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="asset-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading asset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-form-container">
      {/* Header */}
      <div className="form-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/assets')}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-title">
            <h1>{isEditMode ? 'Edit Asset' : 'Create New Asset'}</h1>
            <p>{isEditMode ? `Updating ${formData.name}` : 'Add a new facility asset or equipment'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="asset-form">
        {/* Error Message */}
        {errors.submit && (
          <div className="alert alert-error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Asset Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Rooftop Chiller Unit"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="assetId">Asset ID *</label>
              <input
                type="text"
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleInputChange}
                placeholder="e.g., AC-001"
                className={errors.assetId ? 'error' : ''}
              />
              {errors.assetId && <span className="error-text">{errors.assetId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                <option value="HVAC">HVAC</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="SECURITY">Security</option>
                <option value="FIRE_SAFETY">Fire Safety</option>
                <option value="ELEVATOR">Elevator</option>
                <option value="LIGHTING">Lighting</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., Chiller"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about this asset"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Location & Details Section */}
        <div className="form-section">
          <h2 className="section-title">Location & Building Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'error' : ''}
              >
                <option value="">Select location</option>
                <option value="BUILDING_A">Building A</option>
                <option value="BUILDING_B">Building B</option>
                <option value="BUILDING_C">Building C</option>
                <option value="PARKING">Parking Structure</option>
                <option value="OUTDOOR">Outdoor</option>
              </select>
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="building">Building</label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                placeholder="e.g., Main Building"
              />
            </div>

            <div className="form-group">
              <label htmlFor="floor">Floor</label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                placeholder="e.g., Roof"
              />
            </div>

            <div className="form-group">
              <label htmlFor="room">Room/Space</label>
              <input
                type="text"
                id="room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="e.g., Mechanical Room A"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="form-section">
          <h2 className="section-title">Technical Specifications</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer *</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., Carrier"
                className={errors.manufacturer ? 'error' : ''}
              />
              {errors.manufacturer && <span className="error-text">{errors.manufacturer}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., X200"
                className={errors.model ? 'error' : ''}
              />
              {errors.model && <span className="error-text">{errors.model}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number *</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., SN123456"
                className={errors.serialNumber ? 'error' : ''}
              />
              {errors.serialNumber && <span className="error-text">{errors.serialNumber}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="specifications">Specifications</label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder="Technical specifications, capacity, power requirements, etc."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Installation & Warranty Section */}
        <div className="form-section">
          <h2 className="section-title">Installation & Warranty</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="installDate">Installation Date *</label>
              <input
                type="date"
                id="installDate"
                name="installDate"
                value={formData.installDate}
                onChange={handleInputChange}
                className={errors.installDate ? 'error' : ''}
              />
              {errors.installDate && <span className="error-text">{errors.installDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="warrantyExpiry">Warranty Expiry Date</label>
              <input
                type="date"
                id="warrantyExpiry"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warrantyProvider">Warranty Provider</label>
              <input
                type="text"
                id="warrantyProvider"
                name="warrantyProvider"
                value={formData.warrantyProvider}
                onChange={handleInputChange}
                placeholder="e.g., Carrier Warranty"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="form-section">
          <h2 className="section-title">Maintenance Schedule</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lastMaintenanceDate">Last Maintenance Date</label>
              <input
                type="date"
                id="lastMaintenanceDate"
                name="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nextMaintenanceDate">Next Maintenance Date</label>
              <input
                type="date"
                id="nextMaintenanceDate"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maintenanceFrequency">Maintenance Frequency</label>
              <select
                id="maintenanceFrequency"
                name="maintenanceFrequency"
                value={formData.maintenanceFrequency}
                onChange={handleInputChange}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="maintenanceProvider">Maintenance Provider</label>
              <input
                type="text"
                id="maintenanceProvider"
                name="maintenanceProvider"
                value={formData.maintenanceProvider}
                onChange={handleInputChange}
                placeholder="e.g., ABC Maintenance Co."
              />
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="form-section">
          <h2 className="section-title">Financial Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="depreciationRate">Depreciation Rate (%)</label>
              <input
                type="number"
                id="depreciationRate"
                name="depreciationRate"
                value={formData.depreciationRate}
                onChange={handleInputChange}
                placeholder="10"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Status & Additional Notes */}
        <div className="form-section">
          <h2 className="section-title">Status & Additional Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image</label>
              <input
                type="file"
                id="imageUrl"
                name="imageUrl"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="preview" />
                </div>
              )}
              {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes and comments about this asset"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/assets')}>
            <X size={20} /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={20} /> {saving ? 'Saving...' : isEditMode ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}