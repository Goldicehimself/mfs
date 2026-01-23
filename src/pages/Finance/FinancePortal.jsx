import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  FileText,
  Download,
  Filter,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  CreditCard,
  Receipt
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

// Mock data for finance
const mockFinanceData = {
  summary: {
    totalRevenue: 125000,
    totalExpenses: 42500,
    netProfit: 82500,
    pendingPayments: 18500,
    budgetUtilization: 68
  },
  invoices: [
    {
      id: 'INV-2026-001',
      clientName: 'Acme Corp',
      amount: 5200,
      status: 'paid',
      date: '2026-01-15',
      dueDate: '2026-01-25',
      description: 'HVAC System Maintenance',
      workOrderId: 'WO-001'
    },
    {
      id: 'INV-2026-002',
      clientName: 'Global Industries',
      amount: 8500,
      status: 'pending',
      date: '2026-01-16',
      dueDate: '2026-02-15',
      description: 'Plumbing Repairs',
      workOrderId: 'WO-002'
    },
    {
      id: 'INV-2026-003',
      clientName: 'Tech Solutions LLC',
      amount: 3200,
      status: 'overdue',
      date: '2025-12-20',
      dueDate: '2026-01-10',
      description: 'Electrical Inspection',
      workOrderId: 'WO-003'
    },
    {
      id: 'INV-2026-004',
      clientName: 'BuildRight Enterprises',
      amount: 6800,
      status: 'paid',
      date: '2026-01-10',
      dueDate: '2026-01-20',
      description: 'Equipment Installation',
      workOrderId: 'WO-004'
    },
    {
      id: 'INV-2026-005',
      clientName: 'Metro Manufacturing',
      amount: 12300,
      status: 'pending',
      date: '2026-01-17',
      dueDate: '2026-02-16',
      description: 'Preventive Maintenance',
      workOrderId: 'WO-005'
    }
  ],
  expenses: [
    {
      id: 'EXP-001',
      category: 'Parts & Materials',
      amount: 12500,
      date: '2026-01-15',
      vendor: 'Industrial Supplies Inc',
      status: 'approved'
    },
    {
      id: 'EXP-002',
      category: 'Labor',
      amount: 18200,
      date: '2026-01-18',
      vendor: 'Internal',
      status: 'approved'
    },
    {
      id: 'EXP-003',
      category: 'Travel',
      amount: 2100,
      date: '2026-01-17',
      vendor: 'Various',
      status: 'pending'
    },
    {
      id: 'EXP-004',
      category: 'Equipment',
      amount: 9700,
      date: '2026-01-16',
      vendor: 'Tech Equipment Co',
      status: 'approved'
    }
  ]
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, trend, color = 'indigo' }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <Icon className={`h-5 w-5 text-${color}-600`} />
    </div>
  </motion.div>
);

// Invoice Card Component
const InvoiceCard = ({ invoice, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'pending':
        return '⏱';
      case 'overdue':
        return '!';
      default:
        return '○';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{invoice.id}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.clientName}</p>
        </div>
        <Badge className={getStatusColor(invoice.status)}>
          {getStatusIcon(invoice.status)} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{invoice.description}</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
        <p className="text-xl font-bold text-indigo-600">${invoice.amount.toLocaleString()}</p>
      </div>
    </motion.div>
  );
};

export default function FinancePortal() {
  const [search, setSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedTab, setSelectedTab] = useState('invoices');
  const [newPaymentModalOpen, setNewPaymentModalOpen] = useState(false);
  const [newExpenseModalOpen, setNewExpenseModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const filteredInvoices = useMemo(() => {
    return mockFinanceData.invoices.filter((invoice) => {
      if (invoiceStatusFilter !== 'all' && invoice.status !== invoiceStatusFilter) return false;
      if (search && !invoice.clientName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, invoiceStatusFilter]);

  const filteredExpenses = useMemo(() => {
    return mockFinanceData.expenses.filter((expense) => {
      if (expenseStatusFilter !== 'all' && expense.status !== expenseStatusFilter) return false;
      if (search && !expense.vendor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, expenseStatusFilter]);

  const handleProcessPayment = () => {
    if (paymentAmount && paymentAmount > 0) {
      alert(`✓ Payment of $${paymentAmount} processed for ${selectedInvoice.id}`);
      setNewPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNote('');
      setSelectedInvoice(null);
    } else {
      alert('⚠ Please enter a valid payment amount');
    }
  };

  const handleAddExpense = () => {
    alert(`✓ Expense added successfully`);
    setNewExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Finance Portal</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage invoices, expenses, and financial reports</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`$${mockFinanceData.summary.totalRevenue.toLocaleString()}`}
          trend={12}
          color="emerald"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Expenses"
          value={`$${mockFinanceData.summary.totalExpenses.toLocaleString()}`}
          trend={-5}
          color="red"
        />
        <StatCard
          icon={DollarSign}
          label="Net Profit"
          value={`$${mockFinanceData.summary.netProfit.toLocaleString()}`}
          trend={18}
          color="indigo"
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={`$${mockFinanceData.summary.pendingPayments.toLocaleString()}`}
          color="blue"
        />
        <StatCard
          icon={PieChart}
          label="Budget Used"
          value={`${mockFinanceData.summary.budgetUtilization}%`}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setSelectedTab('invoices')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          📄 Invoices
        </button>
        <button
          onClick={() => setSelectedTab('expenses')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'expenses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          💰 Expenses
        </button>
        <button
          onClick={() => setSelectedTab('reports')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          📊 Reports
        </button>
      </div>

      {/* Invoices Tab */}
      {selectedTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  />
                </div>

                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                  <SelectTrigger className="h-10 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-700/50 font-medium hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900">
                    <SelectItem value="all" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 hover:from-indigo-700 hover:to-purple-700 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                        All Status
                      </span>
                    </SelectItem>
                    <SelectItem value="paid" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer">✓ Paid</SelectItem>
                    <SelectItem value="pending" className="hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">⏱ Pending</SelectItem>
                    <SelectItem value="overdue" className="hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">! Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  className="bg-blue-700 hover:bg-blue-800 text-white h-10"
                  onClick={() => alert(`Exporting invoice report...`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Cards */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invoices ({filteredInvoices.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onSelect={() => setSelectedInvoice(invoice)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {selectedTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  />
                </div>

                <Select value={expenseStatusFilter} onValueChange={setExpenseStatusFilter}>
                  <SelectTrigger className="h-10 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-700/50 font-medium hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 hover:border-amber-300 dark:hover:border-amber-600 transition-all cursor-pointer">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900">
                    <SelectItem value="all" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-2 hover:from-amber-700 hover:to-orange-700 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                        All Status
                      </span>
                    </SelectItem>
                    <SelectItem value="approved" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer">✓ Approved</SelectItem>
                    <SelectItem value="pending" className="hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">⏱ Pending Review</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  className="bg-blue-700 hover:bg-blue-800 text-white h-10"
                  onClick={() => setNewExpenseModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{expense.category}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{expense.vendor}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-amber-600">${expense.amount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Badge className={
                          expense.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }>
                          {expense.status === 'approved' ? '✓ Approved' : '⏱ Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Revenue chart visualization</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Trend analysis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md"
            >
              <CardHeader className="border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <CardTitle>{selectedInvoice.id}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedInvoice.clientName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-indigo-600">${selectedInvoice.amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedInvoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {selectedInvoice.status !== 'paid' && (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setNewPaymentModalOpen(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                )}
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {newPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setNewPaymentModalOpen(false)}
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
                  Process Payment
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Note
                  </label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Optional payment note..."
                    className="w-full h-20 p-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNewPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleProcessPayment()}
                >
                  Process Payment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {newExpenseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setNewExpenseModalOpen(false)}
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
                  Add Expense
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parts">Parts & Materials</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor
                  </label>
                  <Input
                    placeholder="Vendor name..."
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNewExpenseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={() => handleAddExpense()}
                >
                  Add Expense
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

