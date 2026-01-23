import React, { useState } from 'react';
import { Save, Clock, Calendar, Bell, Lock, Database, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import {
  AdminSettings,
  FacilityManagerSettings,
  TechnicianSettings,
  VendorSettings,
  FinanceSettings,
  StaffSettings,
} from './RoleSpecificSettings';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // System Configuration State
  const [timeZone, setTimeZone] = useState('UTC-5 (Eastern Time)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [autoAssignOrders, setAutoAssignOrders] = useState(false);
  const [maintenanceReminders, setMaintenanceReminders] = useState(false);

  // Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('2 hours');
  const [strongPassword, setStrongPassword] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(false);

  // Default Settings State
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [defaultStatus, setDefaultStatus] = useState('Open');
  const [requireImages, setRequireImages] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState('Standard Maintenance');

  // Data Management State
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Daily');
  const [dataRetention, setDataRetention] = useState('7 years');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'users', label: 'Users & Permissions', icon: '👥', roles: ['admin', 'facility_manager'] },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', roles: ['admin'] },
    { id: 'company', label: 'Company Profile', icon: '🏢', roles: ['admin', 'facility_manager'] },
    { id: 'role-specific', label: 'Role Settings', icon: '👤' },
  ];

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.roles || tab.roles.includes(user?.role));

  const handleToggle = (setter) => {
    setter(prev => {
      setHasChanges(true);
      return !prev;
    });
  };

  const handleChange = (setter) => (value) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    toast.success('Settings saved successfully!');
    setHasChanges(false);
  };

  const handleExportData = () => {
    toast.info('Exporting all data...');
    // Implement actual export logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">Settings</h1>
        <p className="text-indigo-700 dark:text-indigo-300 mt-1">
          Manage system configuration and preferences
        </p>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-0">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-b-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-b-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Role Badge */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <span className="text-sm text-gray-600 dark:text-gray-300">Your Role:</span>
                <Badge className="bg-blue-700 text-white capitalize">{user?.role?.replace(/_/g, ' ')}</Badge>
              </div>

              {/* System Configuration - Admin & Facility Manager Only */}
              {['admin', 'facility_manager'].includes(user?.role) && (
                <>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Configuration</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
                    <select
                      value={timeZone}
                      onChange={(e) => handleChange(setTimeZone)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-6 (Central Time)</option>
                      <option>UTC-7 (Mountain Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleChange(setDateFormat)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auto assign Work Orders</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically assign work orders based on availability</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setAutoAssignOrders)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        autoAssignOrders ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          autoAssignOrders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Reminders</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send automatic reminders for scheduled maintenance</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setMaintenanceReminders)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        maintenanceReminders ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          maintenanceReminders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <hr className="dark:border-gray-700" />

              {/* Security */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                    <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Two Factor Authentication</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setTwoFactorAuth)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        twoFactorAuth ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => handleChange(setSessionTimeout)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strong Password Requirements</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Require complex passwords for all users</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setStrongPassword)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        strongPassword ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          strongPassword ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Notify when new login are detected</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setLoginNotifications)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        loginNotifications ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          loginNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <hr className="dark:border-gray-700" />

              {/* Default Settings */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Default Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Work Order Priority</label>
                    <select
                      value={defaultPriority}
                      onChange={(e) => handleChange(setDefaultPriority)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Work Order Status</label>
                    <select
                      value={defaultStatus}
                      onChange={(e) => handleChange(setDefaultStatus)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>On Hold</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Require Asset Images</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mandate photo uploads for new asset registrations</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setRequireImages)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        requireImages ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          requireImages ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Work Order Template</label>
                    <select
                      value={defaultTemplate}
                      onChange={(e) => handleChange(setDefaultTemplate)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>Standard Maintenance</option>
                      <option>Emergency Repair</option>
                      <option>Preventive Maintenance</option>
                      <option>Inspection</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="dark:border-gray-700" />
                </>
              )}

              {/* Data Management - Admin Only */}
              {user?.role === 'admin' && (
                <>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-50 dark:bg-cyan-900 rounded-lg">
                    <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Management</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Automatic Backups</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enable automatic daily backups</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setAutoBackup)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        autoBackup ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          autoBackup ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup Frequency</label>
                    <select
                      value={backupFrequency}
                      onChange={(e) => handleChange(setBackupFrequency)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Retention Period</label>
                    <select
                      value={dataRetention}
                      onChange={(e) => handleChange(setDataRetention)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>1 year</option>
                      <option>3 years</option>
                      <option>7 years</option>
                      <option>Indefinite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Data</label>
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <Download className="h-5 w-5" />
                      Export All Data
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}

              {/* Personal Preferences - All Users */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive email updates about your work</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setLoginNotifications)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        loginNotifications ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          loginNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
                    <select
                      value={timeZone}
                      onChange={(e) => handleChange(setTimeZone)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-6 (Central Time)</option>
                      <option>UTC-7 (Mountain Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleChange(setDateFormat)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg">
                    <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Two Factor Authentication</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setTwoFactorAuth)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        twoFactorAuth ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => handleChange(setSessionTimeout)(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    >
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>4 hours</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strong Password Requirements</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Require complex passwords</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setStrongPassword)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                        strongPassword ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          strongPassword ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Tab */}
          {activeTab === 'role-specific' && (
            <div className="space-y-8">
              {user?.role === 'admin' && <AdminSettings />}
              {user?.role === 'facility_manager' && <FacilityManagerSettings />}
              {user?.role === 'technician' && <TechnicianSettings />}
              {user?.role === 'vendor' && <VendorSettings />}
              {user?.role === 'finance' && <FinanceSettings />}
              {user?.role === 'staff' && <StaffSettings />}
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['general', 'security', 'role-specific'].includes(activeTab) && (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">This tab is under development</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;



