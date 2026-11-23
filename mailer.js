// Email via Resend (https://resend.com). No SDK needed: one HTTPS call per email.
//
// Env vars:
//   RESEND_API_KEY  - from resend.com → API Keys. If missing, emails are skipped (logged) and the site keeps working.
//   EMAIL_FROM      - sender; the domain must be verified in Resend (default: MZB Academy <training@mzbacademy.com>)
//   NOTIFY_EMAIL    - where every site notification goes (default: training@mzbacademy.com)
//   CONTACT_EMAIL   - the public "contact us" address and contact-form inbox (default: support@mzbacademy.com)
//
// Sending never breaks a page: errors are logged and the request carries on.
const FROM = process.env.EMAIL_FROM || 'MZB Academy <training@mzbacademy.com>';
const NOTIFY = process.env.NOTIFY_EMAIL || 'training@mzbacademy.com';
const SUPPORT = process.env.CONTACT_EMAIL || 'support@mzbacademy.com';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function send({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[email skipped: RESEND_API_KEY not set] to=${to} subject="${subject}"`); return { skipped: true }; }
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [].concat(to), subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!r.ok) { console.error('Resend error', r.status, (await r.text()).slice(0, 300)); return { ok: false }; }
    return { ok: true };
  } catch (e) { console.error('Resend failed:', e.message); return { ok: false }; }
  finally { clearTimeout(t); }
}

// Branded email layout (inline styles; works in Gmail/Outlook).
function layout(title, bodyHtml, cta) {
  const btn = cta ? `<p style="margin:28px 0 8px"><a href="${esc(cta.url)}" style="display:inline-block;background:#C9A14A;color:#071226;font-weight:700;text-decoration:none;padding:13px 24px;border-radius:999px;font-family:Arial,sans-serif">${esc(cta.label)}</a></p>` : '';
  return `<!doctype html><html><body style="margin:0;background:#F6F4EE;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1E2636">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:580px;background:#fff;border-radius:14px;overflow:hidden" cellspacing="0" cellpadding="0">
<tr><td style="background:#071226;padding:20px 28px;color:#fff;font-size:15px;letter-spacing:3px"><b>MZB</b> ACADEMY<div style="height:2px;width:48px;background:#C9A14A;margin-top:10px"></div></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6"><h1 style="margin:0 0 14px;font-size:21px;color:#071226">${esc(title)}</h1>${bodyHtml}${btn}</td></tr>
<tr><td style="padding:18px 28px;background:#FAF7F0;font-size:12px;color:#6B7486">MZB Academy · Live GMAT Quant coaching on Zoom<br>Questions? Reply to this email or write to <a href="mailto:${SUPPORT}" style="color:#1E4C8F">${SUPPORT}</a>.</td></tr>
</table></td></tr></table></body></html>`;
}
const p = (s) => `<p style="margin:0 0 12px">${s}</p>`;
const table = (rows) => '<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:14px">' +
  rows.filter(r => r[1] !== undefined && r[1] !== '').map(([k, v]) => `<tr><td style="padding:7px 10px 7px 0;color:#6B7486;border-bottom:1px solid #EEE9DD;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:7px 0;border-bottom:1px solid #EEE9DD">${esc(v)}</td></tr>`).join('') + '</table>';
const plain = (rows) => rows.filter(r => r[1] !== undefined && r[1] !== '').map(([k, v]) => `${k}: ${v}`).join('\n');

// Internal notification → training@mzbacademy.com. Reply goes straight to the student.
function notify(subject, rows, { replyTo, link } = {}) {
  return send({ to: NOTIFY, subject: `[MZB] ${subject}`, replyTo,
    html: layout(subject, table(rows), link ? { url: link, label: 'Open in admin' } : null),
    text: plain(rows) + (link ? `\n\n${link}` : '') });
}
// Email to a student / visitor. Replies go to support@mzbacademy.com.
function toStudent(to, subject, title, paragraphs, cta) {
  return send({ to, subject, replyTo: SUPPORT,
    html: layout(title, paragraphs.map(x => p(esc(x))).join(''), cta),
    text: paragraphs.join('\n\n') + (cta ? `\n\n${cta.label}: ${cta.url}` : '') + `\n\nMZB Academy · ${SUPPORT}` });
}
// Contact form → support@mzbacademy.com.
function contact({ name, email, topic, message }) {
  return send({ to: SUPPORT, subject: `[Contact] ${topic || 'Message'} from ${name}`, replyTo: email,
    html: layout(`New message from ${name}`, table([['Name', name], ['Email', email], ['Topic', topic]]) + `<div style="margin-top:16px;white-space:pre-wrap">${esc(message)}</div>`),
    text: plain([['Name', name], ['Email', email], ['Topic', topic]]) + '\n\n' + message });
}

module.exports = { send, notify, toStudent, contact, NOTIFY, SUPPORT, FROM };
