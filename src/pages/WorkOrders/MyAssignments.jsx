// ShadCN + Tailwind (JSX) – My Assignments
// Professional, polished UI with enhanced UX

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, CheckCircle2, AlertCircle, Zap, Calendar, MapPin, Tag } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import mockWorkOrders from "@/mocks/mockWorkOrders";

// ---------- helpers ----------
const today = new Date();
const isOverdue = (date, status) => {
  if (!date || status === "completed") return false;
  return new Date(date) < today;
};

// ---------- component ----------
export default function MyAssignments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [visible, setVisible] = useState(6);

  const data = useMemo(() => {
    return mockWorkOrders
      .map((wo) => ({
        ...wo,
        overdue: isOverdue(wo.scheduledDate, wo.status),
      }))
      .filter((wo) => {
        if (status !== "all" && wo.status !== status) return false;
        if (priority !== "all" && wo.priority !== priority) return false;
        if (
          search &&
          !wo.title.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      });
  }, [search, status, priority]);

  const stats = useMemo(() => {
    return {
      assigned: 8,
      inProgress: data.filter((d) => d.status === "in_progress").length,
      completed: data.filter((d) => d.status === "completed").length,
      overdue: data.filter((d) => d.overdue).length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">My Assignments</h1>
        <p className="text-indigo-700 dark:text-indigo-300 mt-1">
          Manage and track your assigned work orders
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Zap className="h-5 w-5" />}
          title="Assigned Today" 
          value={stats.assigned} 
          color="indigo"
          trend="+2 from yesterday"
        />
        <StatCard 
          icon={<Clock className="h-5 w-5" />}
          title="In Progress" 
          value={stats.inProgress} 
          color="amber"
          trend="3 active"
        />
        <StatCard 
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Completed" 
          value={stats.completed} 
          color="emerald"
          trend="This week"
        />
        <StatCard 
          icon={<AlertCircle className="h-5 w-5" />}
          title="Overdue" 
          value={stats.overdue} 
          color="rose"
          trend="Urgent action needed"
        />
      </div>

      {/* Filter Section */}
      <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                className="pl-9 h-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                placeholder="Search work orders by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full md:w-[180px] h-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'to_do', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ].map((s) => (
              <Button
                key={s.value}
                variant={status === s.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus(s.value)}
                className={status === s.value ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <AnimatePresence>
        <div className="grid grid-cols-1 gap-4">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400">No work orders found</p>
            </div>
          ) : (
            data.slice(0, visible).map((wo, idx) => (
              <motion.div
                key={wo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <WorkOrderCard wo={wo} />
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      {/* Load More */}
      {visible < data.length && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => setVisible(v => v + 6)}
            className="px-8"
          >
            Load More Work Orders
          </Button>
        </div>
      )}

      {data.length > 0 && visible >= data.length && (
        <div className="text-center pt-4 text-sm text-muted-foreground">
          Showing {visible} of {data.length} work orders
        </div>
      )}
    </div>
  );
}

// ---------- Work Order Card Component ----------
function WorkOrderCard({ wo }) {
  return (
    <Card className={`border-l-4 transition-all hover:shadow-md ${
      wo.overdue 
        ? 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/20' 
        : wo.status === 'completed'
        ? 'border-l-emerald-500'
        : wo.status === 'in_progress'
        ? 'border-l-amber-500'
        : 'border-l-indigo-500'
    }`}>
      <CardContent className="p-5 space-y-4">
        {/* Top Row: ID, Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
              {wo.woNumber}
            </span>
            <Badge variant={priorityVariant(wo.priority)} className="font-medium">
              {wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1)} Priority
            </Badge>
            <Badge variant={statusVariant(wo.status, wo.overdue)} className="font-medium">
              {wo.overdue ? '🔴 Overdue' : statusLabel(wo.status)}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            {wo.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
            {wo.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <DetailItem 
            icon={<Calendar className="h-4 w-4" />}
            label={wo.overdue ? 'Due Date' : 'Scheduled'} 
            value={formatDate(wo.scheduledDate)}
            highlight={wo.overdue}
          />
          <DetailItem 
            icon={<MapPin className="h-4 w-4" />}
            label="Location" 
            value={wo.location?.name || 'N/A'}
          />
          <DetailItem 
            icon={<Tag className="h-4 w-4" />}
            label="Category" 
            value={wo.category}
          />
          <DetailItem 
            icon={<Zap className="h-4 w-4" />}
            label="Status" 
            value={wo.status === 'in_progress' ? 'In Progress' : wo.status === 'to_do' ? 'Pending' : 'Done'}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
          {wo.overdue ? (
            <Button 
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium"
              onClick={() => alert(`Starting overdue work order ${wo.id}...`)}
            >
              ⚠️ Start Now
            </Button>
          ) : wo.status === "in_progress" ? (
            <Button 
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
              onClick={() => alert(`Continuing work order ${wo.id}...`)}
            >
              ▶ Continue
            </Button>
          ) : wo.status === "to_do" ? (
            <Button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              onClick={() => alert(`Starting work order ${wo.id}...`)}
            >
              ▶ Start
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => alert(`Viewing details for work order ${wo.id}...`)}
            >
              ✓ View Details
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => alert(`Viewing details for work order ${wo.id}...`)}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Sub Components ----------
function StatCard({ icon, title, value, color, trend }) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rose: 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <p className="text-xs opacity-60 mt-2">{trend}</p>
          </div>
          <div className="opacity-40">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ icon, label, value, highlight }) {
  return (
    <div className={`flex items-start gap-2 ${highlight ? 'text-rose-600 dark:text-rose-400' : ''}`}>
      <span className="mt-0.5 opacity-60">{icon}</span>
      <div className="text-xs">
        <p className="opacity-60 uppercase tracking-wide font-medium">{label}</p>
        <p className={`font-semibold ${highlight ? 'font-bold text-sm' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const statusLabel = (s) => ({
  'to_do': 'To Do',
  'in_progress': 'In Progress',
  'completed': 'Completed',
}[s] || s);

const priorityVariant = (p) => ({
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
}[p] || 'outline');

const statusVariant = (s, overdue) => overdue
  ? 'destructive'
  : s === 'completed'
  ? 'default'
  : 'secondary';
