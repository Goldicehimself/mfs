const http = require('http');
const https = require('https');
const crypto = require('crypto');
const Organization = require('../models/Organization');
const constants = require('../constants/constants');
const { appendWebhookDeliveryLog } = require('./orgService');

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1000, 2000, 4000, 8000, 16000];

const sendWebhookRequest = (url, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const payload = Buffer.from(body);
    const options = {
      method: 'POST',
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        ...headers
      }
    };

    const client = target.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const buildSignatureHeaders = (secret, timestamp, payload) => {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return {
    'x-maintainpro-signature': `sha256=${signature}`,
    'x-maintainpro-timestamp': timestamp
  };
};

const deliverWithRetry = async ({ organizationId, webhook, event, payload, attempt = 1 }) => {
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    event,
    data: payload,
    organizationId,
    occurredAt: timestamp
  });
  const headers = buildSignatureHeaders(webhook.secret, timestamp, body);
  headers['x-maintainpro-event'] = event;

  try {
    const response = await sendWebhookRequest(webhook.url, body, headers);
    const success = response.statusCode >= 200 && response.statusCode < 300;
    await appendWebhookDeliveryLog(organizationId, webhook.id, {
      event,
      attempt,
      success,
      statusCode: response.statusCode,
      responseSnippet: String(response.body || '').slice(0, 500),
      createdAt: new Date()
    });

    if (!success && attempt < MAX_ATTEMPTS) {
      const delay = BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)];
      setTimeout(() => {
        deliverWithRetry({ organizationId, webhook, event, payload, attempt: attempt + 1 });
      }, delay);
    }
  } catch (error) {
    await appendWebhookDeliveryLog(organizationId, webhook.id, {
      event,
      attempt,
      success: false,
      error: error?.message || 'Webhook delivery failed',
      createdAt: new Date()
    });

    if (attempt < MAX_ATTEMPTS) {
      const delay = BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)];
      setTimeout(() => {
        deliverWithRetry({ organizationId, webhook, event, payload, attempt: attempt + 1 });
      }, delay);
    }
  }
};

const emitWebhookEvent = async (organizationId, event, payload) => {
  if (!constants.WEBHOOK_EVENTS.includes(event)) return;

  const org = await Organization.findById(organizationId).select('settings');
  if (!org) return;

  const webhooks = org.settings?.integrations?.webhooks || [];
  const targets = webhooks.filter((hook) => {
    if (!hook.active) return false;
    const events = hook.events || [];
    if (!events.length) return true;
    return events.includes(event);
  });
  if (!targets.length) return;

  targets.forEach((hook) => {
    deliverWithRetry({ organizationId, webhook: hook, event, payload, attempt: 1 });
  });
};

module.exports = {
  emitWebhookEvent
};
