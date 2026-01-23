import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LeaveCenter = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      staffName: 'Current User',
      type: 'Annual',
      startDate: '2026-01-28',
      endDate: '2026-02-02',
      reason: 'Family event',
      status: 'Approved',
      managerName: 'Facility Manager',
      updatedAt: '2026-01-20',
    },
    {
      id: 2,
      staffName: 'Current User',
      type: 'Sick',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      reason: 'Medical appointment',
      status: 'Pending',
      managerName: 'Facility Manager',
      updatedAt: '2026-01-21',
    },
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Leave approved',
      message: 'Your annual leave was approved by Facility Manager.',
      createdAt: '2026-01-20 16:40',
      type: 'approved',
    },
  ]);
  const [newLeave, setNewLeave] = useState({
    staffName: 'Current User',
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const leaveTypes = ['Annual', 'Sick', 'Emergency', 'Other'];

  const parseDate = (dateString) => {
    if (!dateString) return null;
    return new Date(`${dateString}T00:00:00`);
  };

  const formatDate = (dateString) => {
    const date = parseDate(dateString);
    if (!date || Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString();
  };

  const getLeavePhase = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const now = new Date();
    if (!start || !end) return 'Scheduled';
    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'In progress';
  };

  const getLeaveProgress = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const now = new Date();
    if (!start || !end) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
    }
    if (status === 'Rejected') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
  };

  const pushNotification = (payload) => {
    setNotifications((prev) => [
      {
        ...payload,
        id: Date.now() + Math.floor(Math.random() * 1000),
        createdAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  const handleLeaveSubmit = (event) => {
    event.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast.error('Please complete all leave request fields.');
      return;
    }

    const request = {
      id: Date.now(),
      staffName: newLeave.staffName,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'Pending',
      managerName: 'Facility Manager',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests((prev) => [request, ...prev]);
    setNewLeave((prev) => ({
      ...prev,
      startDate: '',
      endDate: '',
      reason: '',
    }));

    pushNotification({
      title: 'Leave request submitted',
      message: `Your ${request.type} leave request was sent to the facility manager.`,
      type: 'pending',
    });
  };

  useEffect(() => {
    leaveRequests.forEach((request) => {
      if (request.status !== 'Approved') return;
      const end = parseDate(request.endDate);
      if (!end) return;
      const now = new Date();
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 3) return;
      const alreadyNotified = notifications.some(
        (item) => item.type === 'ending_soon' && item.requestId === request.id
      );
      if (!alreadyNotified) {
        pushNotification({
          title: 'Leave ending soon',
          message: `Your leave ends on ${formatDate(request.endDate)}.`,
          type: 'ending_soon',
          requestId: request.id,
        });
      }
    });
  }, [leaveRequests, notifications]);

  const staffLeaveRequests = leaveRequests.filter((request) => request.staffName === 'Current User');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leave Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit leave requests, track progress, and see updates from your manager.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Leave Requests
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Apply for leave and track each request.
                </p>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Apply for Leave
                  </h4>
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100">
                    Staff
                  </Badge>
                </div>
                <form onSubmit={handleLeaveSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      Leave Type
                    </label>
                    <select
                      value={newLeave.type}
                      onChange={(event) =>
                        setNewLeave((prev) => ({ ...prev, type: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                    >
                      {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newLeave.startDate}
                        onChange={(event) =>
                          setNewLeave((prev) => ({ ...prev, startDate: event.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newLeave.endDate}
                        onChange={(event) =>
                          setNewLeave((prev) => ({ ...prev, endDate: event.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      Reason
                    </label>
                    <textarea
                      rows={3}
                      value={newLeave.reason}
                      onChange={(event) =>
                        setNewLeave((prev) => ({ ...prev, reason: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                      placeholder="Add brief context for your manager."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
                    Submit Leave Request
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Your Leave Tracker
                  </h4>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                    Staff
                  </Badge>
                </div>
                <div className="space-y-3">
                  {staffLeaveRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No leave requests yet. Submit your first request.
                    </div>
                  ) : (
                    staffLeaveRequests.map((request) => {
                      const progress = getLeaveProgress(request.startDate, request.endDate);
                      const phase = getLeavePhase(request.startDate, request.endDate);
                      return (
                        <div
                          key={request.id}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {request.type} Leave
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(request.startDate)} to {formatDate(request.endDate)}
                              </p>
                            </div>
                            <Badge className={getStatusBadge(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-300">
                              <span>{phase}</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                              <div
                                className="h-2 rounded-full bg-blue-700"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Manager: {request.managerName}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                In-App Notifications
              </h3>
              <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                notifications.slice(0, 6).map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3"
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                      {notification.createdAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveCenter;


