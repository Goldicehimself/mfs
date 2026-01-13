import React, { useMemo, useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  Popover,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  isToday,
  subMonths,
  addMonths,
} from 'date-fns';
import mockWorkOrders from '../../mocks/mockWorkOrders';

/* =========================
   Constants
========================= */
const PRIORITY_COLOR = {
  critical: '#dc2626',
  high: '#fb923c',
  medium: '#f59e0b',
  low: '#10b981',
};

/* =========================
   Component
========================= */
export default function PMCalendar() {
  const navigate = useNavigate();
  const closeTimerRef = useRef(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [popover, setPopover] = useState({ anchor: null, event: null });

  /* =========================
     Events
  ========================= */
  const events = useMemo(() => {
    return mockWorkOrders
      .filter(
        (w) =>
          ['Maintenance', 'Inspection', 'Calibration'].includes(
            w.serviceType
          ) || /preventive/i.test(w.title)
      )
      .map((w) => ({
        ...w,
        date: w.dueDate ? parseISO(w.dueDate) : null,
      }))
      .filter((w) => w.date);
  }, []);

  /* =========================
     Memoized events by day (PERFORMANCE)
  ========================= */
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = format(e.date, 'yyyy-MM-dd');
      map[key] = map[key] || [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const eventsForDay = (date) =>
    eventsByDay[format(date, 'yyyy-MM-dd')] || [];

  /* =========================
     Month matrix
  ========================= */
  const monthMatrix = useMemo(() => {
    const startMonth = startOfMonth(currentMonth);
    const endMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(startMonth);
    const endDate = endOfWeek(endMonth);

    const matrix = [];
    let row = [];
    let day = startDate;

    while (day <= endDate) {
      row.push(day);
      if (row.length === 7) {
        matrix.push(row);
        row = [];
      }
      day = addDays(day, 1);
    }
    return matrix;
  }, [currentMonth]);

  /* =========================
     Navigation
  ========================= */
  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  /* =========================
     Popover handlers
  ========================= */
  const openPopover = (anchorEl, ev) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setPopover({ anchor: anchorEl, event: ev });
  };

  const closePopover = () => {
    closeTimerRef.current = setTimeout(
      () => setPopover({ anchor: null, event: null }),
      150
    );
  };

  const handleView = (ev) => {
    navigate(`/work-orders/${ev.id}`);
    setPopover({ anchor: null, event: null });
  };

  const handleReschedule = (ev) => {
    alert(`Reschedule: ${ev.title}`);
    setPopover({ anchor: null, event: null });
  };

  /* =========================
     Render
  ========================= */
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
      }}
    >
      {/* ================= Calendar ================= */}
      <Box sx={{ flex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRight size={16} />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} ml={1}>
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Clock size={12} />}
              onClick={goToday}
              sx={{ textTransform: 'none' }}
            >
              Today
            </Button>
            <Button
              size="small"
              startIcon={<CalendarIcon size={12} />}
              sx={{ textTransform: 'none' }}
            >
              This Month
            </Button>
          </Box>
        </Box>

        {/* Weekdays */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderTop: '1px solid #eef2f7',
            borderBottom: '1px solid #eef2f7',
            mb: 1,
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Box key={d} sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" fontWeight={700} color="#64748b">
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Days grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {monthMatrix.flat().map((day, idx) => {
            const dayEvents = eventsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <Box
                key={idx}
                tabIndex={0}
                onClick={() => setSelectedDate(day)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && setSelectedDate(day)
                }
                sx={{
                  p: 1,
                  minHeight: 104,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSameDay(day, selectedDate)
                    ? '#c7d2fe'
                    : 'transparent',
                  backgroundColor: isSameDay(day, selectedDate)
                    ? '#e0e7ff'
                    : isToday(day)
                    ? '#eef2ff'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    borderColor: '#e6eef8',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    fontWeight={700}
                    color={inMonth ? '#111827' : '#9ca3af'}
                  >
                    {format(day, 'd')}
                  </Typography>
                  {dayEvents.length > 0 && (
                    <Chip
                      label={dayEvents.length}
                      size="small"
                      sx={{
                        bgcolor: '#eef2ff',
                        color: '#1e3a8a',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>

                <Box mt={0.5}>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <Box
                      key={ev.id}
                      onMouseEnter={(e) =>
                        openPopover(e.currentTarget, ev)
                      }
                      onMouseLeave={closePopover}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(ev);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5,
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: 99,
                          bgcolor:
                            PRIORITY_COLOR[ev.priority] || '#64748b',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ev.title}
                      </Typography>
                    </Box>
                  ))}
                  {dayEvents.length > 2 && (
                    <Typography variant="caption" color="#94a3b8">
                      +{dayEvents.length - 2} more
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ================= Details Panel ================= */}
      <Box
        sx={{
          width: { xs: '100%', md: 360 },
          position: 'sticky',
          top: 16,
          alignSelf: 'flex-start',
        }}
      >
        <Typography fontWeight={700}>
          {format(selectedDate, 'EEE, MMM d')}
        </Typography>
        <Typography variant="caption" color="#9ca3af">
          {eventsForDay(selectedDate).length} tasks
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
          {eventsForDay(selectedDate).length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              p={2}
            >
              No scheduled preventive tasks
            </Typography>
          )}

          {eventsForDay(selectedDate).map((ev) => (
            <Box
              key={ev.id}
              sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}
            >
              <Typography fontWeight={700}>{ev.title}</Typography>
              <Typography variant="caption" color="#6b7280">
                {ev.location?.name || ev.asset?.name || ev.category}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ================= Popover ================= */}
      <Popover
        open={Boolean(popover.anchor)}
        anchorEl={popover.anchor}
        onClose={() => setPopover({ anchor: null, event: null })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          onMouseEnter: () =>
            closeTimerRef.current &&
            clearTimeout(closeTimerRef.current),
          onMouseLeave: closePopover,
        }}
      >
        {popover.event && (
          <Box sx={{ p: 2, maxWidth: 320 }}>
            <Typography fontWeight={700}>
              {popover.event.title}
            </Typography>
            <Typography variant="caption" color="#6b7280">
              {popover.event.location?.name ||
                popover.event.asset?.name ||
                popover.event.category}
            </Typography>
            <Box mt={1} display="flex" gap={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleView(popover.event)}
              >
                View
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleReschedule(popover.event)}
              >
                Reschedule
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
