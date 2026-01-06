import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAsset, updateAsset, getAsset } from '../../api/assets';
import { ArrowLeft, Save, X } from 'lucide-react';
// styles migrated to Tailwind - AssetForm.css will be removed after verification


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
        assetId: asset.assetTag || '',
        category: asset.category || '',
        type: asset.type || '',
        description: asset.description || asset.shortDescription || '',
        location: asset.location || '',
        building: asset.building || '',
        floor: asset.floor || '',
        room: asset.room || '',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serial || '',
        specifications: asset.specs ? JSON.stringify(asset.specs) : asset.specifications || '',
        installDate: asset.installationDate?.split('T')[0] || asset.installDate?.split('T')[0] || '',
        warrantyExpiry: (asset.warranty && asset.warranty.expires) ? asset.warranty.expires.split('T')[0] : '',
        warrantyProvider: (asset.warranty && asset.warranty.provider) ? asset.warranty.provider : asset.warrantyProvider || '',
        lastMaintenanceDate: asset.lastMaintenance || asset.lastMaintenanceDate || '',
        nextMaintenanceDate: asset.nextService || asset.nextMaintenanceDate || '',
        maintenanceFrequency: asset.maintenanceFrequency || 'monthly',
        maintenanceProvider: asset.maintenanceProvider || '',
        purchasePrice: asset.purchasePrice || '',
        purchaseDate: asset.purchaseDate?.split('T')[0] || '',
        depreciationRate: asset.depreciationRate || '',
        status: asset.status || 'active',
        notes: asset.notes || '',
        imageUrl: asset.imageUrl || (asset.imageUrls && asset.imageUrls[0]) || ''
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
      // Map form fields to asset shape used by the app
      const payload = {
        name: formData.name,
        assetTag: formData.assetId,
        category: formData.category,
        type: formData.type,
        description: formData.description,
        shortDescription: formData.description,
        location: formData.location,
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        manufacturer: formData.manufacturer,
        model: formData.model,
        serial: formData.serialNumber,
        // Simple conversion for specs: store as 'specs' object if JSON, otherwise leave as string in specifications
        specs: (() => {
          try { return formData.specifications ? JSON.parse(formData.specifications) : undefined; } catch (e) { return { notes: formData.specifications }; }
        })(),
        installationDate: formData.installDate || undefined,
        warranty: { expires: formData.warrantyExpiry || undefined, provider: formData.warrantyProvider || undefined, purchaseDate: formData.purchaseDate || undefined },
        purchaseDate: formData.purchaseDate || undefined,
        lastMaintenance: formData.lastMaintenanceDate || undefined,
        nextService: formData.nextMaintenanceDate || undefined,
        maintenanceFrequency: formData.maintenanceFrequency || undefined,
        maintenanceProvider: formData.maintenanceProvider || undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        depreciationRate: formData.depreciationRate ? Number(formData.depreciationRate) : undefined,
        status: formData.status,
        notes: formData.notes,
        imageUrl: formData.imageUrl || imagePreview || undefined
      };

      if (isEditMode) {
        saved = await updateAsset(id, payload);
      } else {
        saved = await createAsset(payload);
      }

      // Upload image if provided
      try {
        if (imageFile) {
          const assetId = isEditMode ? id : (saved?.id || saved?.data?.id);
          if (assetId) {
            const { uploadAssetImage } = await import('../../api/assets');
            const res = await uploadAssetImage(assetId, imageFile);
            // If upload returns an imageUrl (fallback or server), update preview and form data
            if (res && res.imageUrl) {
              setImagePreview(res.imageUrl);
              setFormData(fd => ({ ...fd, imageUrl: res.imageUrl }));
            }
          }
        }
      } catch (imgErr) {
        console.warn('Image upload failed but asset saved:', imgErr);
      }

      // wait a tick so user sees the updated preview if they remain on the form
      await new Promise(r => setTimeout(r, 150));
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
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-indigo-500 animate-spin mb-3"></div>
            <p>Loading asset...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button className="p-2 rounded hover:bg-gray-100" onClick={() => navigate('/assets')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">{isEditMode ? 'Edit Asset' : 'Create New Asset'}</h1>
            <p className="text-sm text-gray-500">{isEditMode ? `Updating ${formData.name}` : 'Add a new facility asset or equipment'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 border-l-4 border-red-400 p-3 mb-4">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block font-semibold mb-1">Asset Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Rooftop Chiller Unit"
                className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
            </div>

            <div>
              <label htmlFor="assetId" className="block font-semibold mb-1">Asset ID *</label>
              <input
                type="text"
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleInputChange}
                placeholder="e.g., AC-001"
                className={`w-full px-3 py-2 border rounded-md ${errors.assetId ? 'border-red-500' : ''}`}
              />
              {errors.assetId && <span className="text-sm text-red-600">{errors.assetId}</span>}
            </div>

            <div>
              <label htmlFor="category" className="block font-semibold mb-1">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : ''}`}
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
              {errors.category && <span className="text-sm text-red-600">{errors.category}</span>}
            </div>

            <div>
              <label htmlFor="type" className="block font-semibold mb-1">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., Chiller"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block font-semibold mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about this asset"
                rows="3"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Location & Details Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Location & Building Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block mb-1 font-semibold">Location *</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : ''}`}
              >
                <option value="">Select location</option>
                <option value="BUILDING_A">Building A</option>
                <option value="BUILDING_B">Building B</option>
                <option value="BUILDING_C">Building C</option>
                <option value="PARKING">Parking Structure</option>
                <option value="OUTDOOR">Outdoor</option>
              </select>
              {errors.location && <span className="text-sm text-red-600">{errors.location}</span>}
            </div>

            <div>
              <label htmlFor="building" className="block mb-1 font-semibold">Building</label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                placeholder="e.g., Main Building"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block mb-1 font-semibold">Floor</label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                placeholder="e.g., Roof"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="room" className="block mb-1 font-semibold">Room/Space</label>
              <input
                type="text"
                id="room"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="e.g., Mechanical Room A"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manufacturer" className="block mb-1 font-semibold">Manufacturer *</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., Carrier"
                className={`w-full px-3 py-2 border rounded-md ${errors.manufacturer ? 'border-red-500' : ''}`}
              />
              {errors.manufacturer && <span className="text-sm text-red-600">{errors.manufacturer}</span>}
            </div>

            <div>
              <label htmlFor="model" className="block mb-1 font-semibold">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., X200"
                className={`w-full px-3 py-2 border rounded-md ${errors.model ? 'border-red-500' : ''}`}
              />
              {errors.model && <span className="text-sm text-red-600">{errors.model}</span>}
            </div>

            <div>
              <label htmlFor="serialNumber" className="block mb-1 font-semibold">Serial Number *</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., SN123456"
                className={`w-full px-3 py-2 border rounded-md ${errors.serialNumber ? 'border-red-500' : ''}`}
              />
              {errors.serialNumber && <span className="text-sm text-red-600">{errors.serialNumber}</span>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="specifications" className="block mb-1 font-semibold">Specifications</label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder="Technical specifications, capacity, power requirements, etc."
                rows="3"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Installation & Warranty Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Installation & Warranty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="installDate" className="block mb-1 font-semibold">Installation Date *</label>
              <input
                type="date"
                id="installDate"
                name="installDate"
                value={formData.installDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.installDate ? 'border-red-500' : ''}`}
              />
              {errors.installDate && <span className="text-sm text-red-600">{errors.installDate}</span>}
            </div>

            <div>
              <label htmlFor="warrantyExpiry" className="block mb-1 font-semibold">Warranty Expiry Date</label>
              <input
                type="date"
                id="warrantyExpiry"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="warrantyProvider" className="block mb-1 font-semibold">Warranty Provider</label>
              <input
                type="text"
                id="warrantyProvider"
                name="warrantyProvider"
                value={formData.warrantyProvider}
                onChange={handleInputChange}
                placeholder="e.g., Carrier Warranty"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Maintenance Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lastMaintenanceDate" className="block mb-1 font-semibold">Last Maintenance Date</label>
              <input
                type="date"
                id="lastMaintenanceDate"
                name="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="nextMaintenanceDate" className="block mb-1 font-semibold">Next Maintenance Date</label>
              <input
                type="date"
                id="nextMaintenanceDate"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="maintenanceFrequency" className="block mb-1 font-semibold">Maintenance Frequency</label>
              <select
                id="maintenanceFrequency"
                name="maintenanceFrequency"
                value={formData.maintenanceFrequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>

            <div>
              <label htmlFor="maintenanceProvider" className="block mb-1 font-semibold">Maintenance Provider</label>
              <input
                type="text"
                id="maintenanceProvider"
                name="maintenanceProvider"
                value={formData.maintenanceProvider}
                onChange={handleInputChange}
                placeholder="e.g., ABC Maintenance Co."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className="block mb-1 font-semibold">Purchase Price</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="purchaseDate" className="block mb-1 font-semibold">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="depreciationRate" className="block mb-1 font-semibold">Depreciation Rate (%)</label>
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
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Status & Additional Notes */}
        <div className="bg-card p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Status & Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block mb-1 font-semibold">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block mb-1 font-semibold">Image</label>
              <input
                type="file"
                id="imageUrl"
                name="imageUrl"
                accept="image/*"
                onChange={handleFileChange}
                className="block"
              />
              {imagePreview && (
                <div className="mt-2 max-w-[220px] rounded-md overflow-hidden border">
                  <img src={imagePreview} alt="preview" className="w-full h-auto block" />
                </div>
              )}
              {errors.imageUrl && <span className="text-sm text-red-600">{errors.imageUrl}</span>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block mb-1 font-semibold">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes and comments about this asset"
                rows="3"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="px-3 py-2 rounded-md border flex items-center gap-2" onClick={() => navigate('/assets')}>
            <X size={20} /> Cancel
          </button>
          <button type="submit" className="px-3 py-2 rounded-md bg-indigo-600 text-white flex items-center gap-2" disabled={saving}>
            <Save size={20} /> {saving ? 'Saving...' : isEditMode ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}