let _mockWorkOrders = [];

export async function getWorkOrders() {
  // temporary mock
  return _mockWorkOrders;
}

export async function createWorkOrder(payload) {
  // mock create - in real app replace with API call
  const newWO = { id: Date.now().toString(), ...payload, status: 'open', createdAt: new Date().toISOString() };
  _mockWorkOrders = [newWO, ..._mockWorkOrders];
  return newWO;
}