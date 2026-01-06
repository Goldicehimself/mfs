import mockWorkOrders from '../mocks/mockWorkOrders';

let _mockWorkOrders = [...mockWorkOrders];

export async function getWorkOrders(params = {}) {
  // Temporary mock - supports basic filtering for status / priority / search
  const { status, priority, search } = params;
  let results = [..._mockWorkOrders];
  if (status && status !== 'all') results = results.filter(r => r.status === status);
  if (priority && priority !== 'all') results = results.filter(r => r.priority === priority);
  if (search && search.trim()) {
    const s = search.toLowerCase();
    results = results.filter(r => (r.woNumber || '').toLowerCase().includes(s) || (r.title || '').toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s));
  }
  return results;
}

export async function getWorkOrder(id) {
  return _mockWorkOrders.find(w => w.id === id) || null;
}

export async function createWorkOrder(payload) {
  // mock create - in real app replace with API call
  const newWO = {
    id: `wo-${Date.now()}`,
    woNumber: `WO-${1000 + Math.floor(Math.random() * 9000)}`,
    ...payload,
    status: payload.status || 'open',
    createdAt: new Date().toISOString(),
  };
  _mockWorkOrders = [newWO, ..._mockWorkOrders];
  return newWO;
}

export async function deleteWorkOrder(id) {
  const before = _mockWorkOrders.length;
  _mockWorkOrders = _mockWorkOrders.filter(w => w.id !== id);
  return before !== _mockWorkOrders.length;
}

export async function bulkAssignWorkOrders({ ids = null, assignee = null, filters = {} } = {}) {
  // If ids is null, apply to all matching items by filters
  let targets = [];
  if (!ids) {
    targets = await getWorkOrders(filters);
  } else {
    targets = _mockWorkOrders.filter(w => ids.includes(w.id));
  }

  let updatedCount = 0;
  _mockWorkOrders = _mockWorkOrders.map(w => {
    if (targets.find(t => t.id === w.id)) {
      updatedCount += 1;
      return { ...w, assignedTo: assignee };
    }
    return w;
  });

  return { updatedCount, updatedIds: targets.map(t => t.id) };
}