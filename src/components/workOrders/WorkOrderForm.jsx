import React, { useState } from 'react';
import { Plus, Delete, ArrowLeft, Upload } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createWorkOrder } from '../../services/workOrderService';
import { useQuery } from 'react-query';
import { getAssets } from '../../api/assets';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WorkOrderForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleSubmit, control, watch } = useForm({
    defaultValues: {
      title: '',
      priority: 'medium',
      serviceCategory: '',
      asset: '',
      location: '',
      description: '',
      instructions: '',
      parts: [],
      requestedBy: user?.name || '',
      assignTo: '',
      scheduledDate: '',
      estimatedDuration: '',
      recurring: false,
    },
  });

  const [parts, setParts] = useState([]);
  const [files, setFiles] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');

  const { data: assets = [], isLoading: assetsLoading } = useQuery(
    ['assets', assetQuery],
    async () => {
      try {
        const res = await getAssets({ q: assetQuery });
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return [];
      }
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  const onSubmit = async (data) => {
    const payload = { ...data, parts, attachments: files };
    try {
      await createWorkOrder(payload);
      toast.success('Work order created successfully');
      navigate('/work-orders');
    } catch (err) {
      toast.error('Failed to create work order');
    }
  };

  const addPart = () => {
    setParts((p) => [...p, { name: '', qty: '' }]);
  };

  const updatePart = (index, key, value) => {
    setParts((p) => p.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removePart = (index) => {
    setParts((p) => p.filter((_, i) => i !== index));
  };

  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const priority = watch('priority');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <button 
              type="button"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-3"
            >
              <ArrowLeft size={18} /> Back to Work Orders
            </button>
            <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">Create Work Order</h1>
            <p className="text-indigo-700 dark:text-indigo-300 mt-1">Fill in the details to create a new maintenance work order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Basic Information</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Work Order Title *</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input 
                      {...field}
                      placeholder="e.g., Fix HVAC unit in Building A"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Priority Level *</label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="low">🟢 Low</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="high">🟠 High</option>
                        <option value="critical">🔴 Critical</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Service Category *</label>
                  <Controller
                    name="serviceCategory"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select category...</option>
                        <option value="electrical">⚡ Electrical</option>
                        <option value="plumbing">💧 Plumbing</option>
                        <option value="hvac">❄️ HVAC</option>
                        <option value="general">🔧 General</option>
                      </select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset & Location */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Asset & Location</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Select Asset</label>
                <Controller
                  name="asset"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="text"
                      placeholder="Search for asset..."
                      onChange={(e) => setAssetQuery(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
                {assets.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {assets.map(asset => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          document.querySelector('input[name="asset"]')?.setAttribute('value', asset.id);
                          setAssetQuery('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{asset.name}</p>
                        <p className="text-xs text-zinc-500">{asset.category || asset.model}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Location Details</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <input 
                      {...field}
                      placeholder="Building, Floor, Room (e.g., Building A, 3rd Floor, Room 301)"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Problem Description</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Describe the Issue *</label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <textarea 
                      {...field}
                      rows={4}
                      placeholder="Provide detailed information about the problem..."
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Special Instructions</label>
                <Controller
                  name="instructions"
                  control={control}
                  render={({ field }) => (
                    <textarea 
                      {...field}
                      rows={2}
                      placeholder="Any special notes or safety instructions..."
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Required Parts */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Required Parts & Materials</h2>
              <Button size="sm" onClick={addPart} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                <Plus size={14} /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {parts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {parts.map((part, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input 
                        placeholder="Part name" 
                        value={part.name} 
                        onChange={(e) => updatePart(idx, 'name', e.target.value)} 
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm"
                      />
                      <input 
                        placeholder="Qty" 
                        value={part.qty} 
                        onChange={(e) => updatePart(idx, 'qty', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm"
                      />
                      <button type="button" onClick={() => removePart(idx)} className="text-red-600 hover:text-red-700 p-2">
                        <Delete size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Attachments</h2>
            </CardHeader>
            <CardContent className="p-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Drop files here or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, PDF (Max 10MB each)</p>
                  <input type="file" multiple onChange={onFilesChange} className="hidden" />
                </div>
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">{f.name}</span>
                      <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-700">
                        <Delete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm sticky top-24">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Assignment</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Requested By</label>
                <Controller
                  name="requestedBy"
                  control={control}
                  render={({ field }) => (
                    <input 
                      {...field}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Assign to Technician</label>
                <Controller
                  name="assignTo"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Unassigned</option>
                      <option value="tech1">John Doe</option>
                      <option value="tech2">Jane Smith</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Scheduled Date</label>
                <Controller
                  name="scheduledDate"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="date" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Estimated Duration</label>
                <Controller
                  name="estimatedDuration"
                  control={control}
                  render={({ field }) => (
                    <input {...field} placeholder="e.g., 2 hours" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                <label className="flex items-center gap-3">
                  <Controller
                    name="recurring"
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="checkbox" className="w-4 h-4 rounded border-gray-200" />
                    )}
                  />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Recurring Maintenance</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Order
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/work-orders')} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
