import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchVendors } from '../../api/vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VendorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');

  const { data: vendors = [] } = useQuery('vendors', fetchVendors);

  // Categories from vendors data
  const categories = useMemo(() => {
    const cats = ['All Categories'];
    const uniqueCats = new Set(vendors.map((v) => v.category));
    return [...cats, ...Array.from(uniqueCats).sort()];
  }, [vendors]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let result = vendors;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.email.toLowerCase().includes(search) ||
          v.phone.includes(search)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      result = result.filter((v) => v.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'rating') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'spend') {
      result = result.sort((a, b) => b.monthlySpend - a.monthlySpend);
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [vendors, searchTerm, selectedCategory, sortBy]);

  // Calculate KPI stats
  const stats = useMemo(() => {
    return {
      totalVendors: vendors.length,
      activeContracts: vendors.reduce((sum, v) => sum + (v.contractStatus === 'Active' ? 1 : 0), 0),
      averageRating: vendors.length > 0 
        ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)
        : 0,
      monthlySpend: vendors.reduce((sum, v) => sum + v.monthlySpend, 0),
    };
  }, [vendors]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'Expired':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      HVAC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      Electrical: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      Plumbing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
      Cleaning: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
      Security: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
      General: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    };
    return colors[category] || colors.General;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.7) return 'text-emerald-600 dark:text-emerald-400';
    if (rating >= 4.3) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 4.0) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
              Vendors Management
            </h1>
            <p className="text-indigo-700 dark:text-indigo-300 mt-1">
              Manage vendor directory, contracts, and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => navigate('/vendors/import')}
            >
              Import
            </Button>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => navigate('/vendors/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vendors */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Total Vendors
                </p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.totalVendors}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 rounded">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  +8%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Active Contracts
                </p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.activeContracts}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900 rounded">
                <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  +3%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.averageRating}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">
                <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  +0.2
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spend */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Monthly Spend
                </p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  ${(stats.monthlySpend / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-rose-100 dark:bg-rose-900 rounded">
                <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  -3%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Category Filters */}
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-auto px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="spend">Sort by Spend</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Contract Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Last Service
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Vendor Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg text-lg">
                        {vendor.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {vendor.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {vendor.email}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {vendor.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <Badge className={`${getCategoryColor(vendor.category)} border-0`}>
                      {vendor.category}
                    </Badge>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-semibold ${getRatingColor(vendor.rating)}`}>
                        {vendor.rating}
                      </span>
                      <span className="text-lg">⭐</span>
                    </div>
                  </td>

                  {/* Contract Status */}
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(vendor.contractStatus)} border-0`}>
                      {vendor.contractStatus}
                    </Badge>
                  </td>

                  {/* Last Service */}
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {vendor.lastService}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing 1-{Math.min(5, filteredVendors.length)} of {filteredVendors.length} vendors
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium">
              1
            </button>
            {Math.ceil(filteredVendors.length / 5) > 1 && (
              <>
                <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium">
                  2
                </button>
                <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium">
                  3
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VendorsPage;

