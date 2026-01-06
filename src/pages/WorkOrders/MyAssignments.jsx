// ShadCN + Tailwind (JSX) – My Assignments
// Matches screenshot layout, responsive, animated, real date logic

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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
  const [visible, setVisible] = useState(5);

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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Assignments</h1>
        <p className="text-sm text-muted-foreground">
          Work orders assigned to you for completion
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Assigned Today" value={stats.assigned} color="blue" />
        <KPI title="In Progress" value={stats.inProgress} color="yellow" />
        <KPI title="Completed This Week" value={stats.completed} color="green" />
        <KPI title="Overdue" value={stats.overdue} color="red" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search work orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all','to_do','in_progress','completed'].map(s => (
              <Button
                key={s}
                variant={status === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus(s)}
              >
                {s === 'to_do' ? 'To Do' : s.replace('_',' ')}
              </Button>
            ))}

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <AnimatePresence>
        <div className="space-y-4">
          {data.slice(0, visible).map((wo) => (
            <motion.div
              key={wo.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className={wo.overdue ? "border-l-4 border-red-500" : ""}>
                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{wo.woNumber}</span>
                      <Badge variant={priorityVariant(wo.priority)}>
                        {wo.priority}
                      </Badge>
                      <Badge variant={statusVariant(wo.status, wo.overdue)}>
                        {wo.overdue ? 'Overdue' : wo.status.replace('_',' ')}
                      </Badge>
                    </div>
                    <p className="font-medium">{wo.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {wo.description}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <Meta label={wo.overdue ? 'Due Date' : 'Scheduled'} value={formatDate(wo.scheduledDate)} danger={wo.overdue} />
                    <Meta label="Location" value={wo.location?.name} />
                    <Meta label="Category" value={wo.category} />
                  </div>

                  {/* Actions */}
                 <div className="flex gap-2 justify-end">
  {wo.overdue ? (
    <Button variant="destructive">Start Now</Button>
  ) : wo.status === "in_progress" ? (
    <Button>Continue</Button>
  ) : wo.status === "to_do" ? (
    <Button>Start</Button>
  ) : (
    <Button variant="outline">View</Button>
  )}

  <Button variant="outline">Details</Button>
</div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <div className="text-center">
        <Button variant="outline" onClick={() => setVisible(v => v + 5)}>
          Load More Work Orders
        </Button>
      </div>
    </div>
  );
}

// ---------- sub components ----------
function KPI({ title, value, color }) {
  const map = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-sm ${map[color]}`}>+{Math.floor(Math.random()*10)}</div>
      </CardContent>
    </Card>
  );
}

function Meta({ label, value, danger }) {
  return (
    <div>
      <p className={`text-xs ${danger ? 'text-red-600' : 'text-muted-foreground'}`}>{label}</p>
      <p className={`font-medium ${danger ? 'text-red-600' : ''}`}>{value}</p>
    </div>
  );
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const priorityVariant = (p) => ({
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
}[p]);

const statusVariant = (s, overdue) => overdue
  ? 'destructive'
  : s === 'completed'
  ? 'default'
  : 'secondary';
