// Forwards website leads to the CRM without exposing the webhook URL in the browser.
// The CRM URL is read from the CRM_WEBHOOK_URL environment variable (set in Netlify).

const MAX = { name: 100, phone: 20, project_type: 100, property_type: 100, address: 120, notes: 1000, landing_page: 200 };

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  const target = (process.env.CRM_WEBHOOK_URL || '').trim().replace(/^["']|["']$/g, '');
  if (!target) {
    console.error('CRM_WEBHOOK_URL is not set');
    return Response.json({ ok: false }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const lead = {};
  for (const [k, max] of Object.entries(MAX)) lead[k] = clean(body[k], max);
  lead.lead_source = 'אתר';

  const phoneDigits = lead.phone.replace(/[\s-]/g, '');
  if (!lead.name || !/^0[5-9]\d{8}$/.test(phoneDigits)) {
    return Response.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      console.error('CRM responded', res.status, detail);
      return Response.json({ ok: false, crm_status: res.status, crm_error: detail }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error('CRM request failed', err);
    return Response.json({ ok: false, crm_error: String(err && err.message || err).slice(0, 200), url_ok: /^https:\/\//.test(target) }, { status: 502 });
  }
};

export const config = { path: '/api/lead' };
