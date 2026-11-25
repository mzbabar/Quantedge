// Admin live activity panel: refreshes every 10 seconds while the tab is visible.
(function () {
  var box = document.getElementById('live');
  if (!box) return;
  var $ = function (id) { return document.getElementById(id); };
  var flag = function (cc) { return /^[A-Z]{2}$/.test(cc || '') ? String.fromCodePoint.apply(null, cc.split('').map(function (c) { return 0x1F1E6 + c.charCodeAt(0) - 65; })) : '🌐'; };
  var place = function (e) { return e.city ? e.city + (e.region && e.country === 'US' ? ', ' + e.region : '') : (e.country || 'Unknown'); };
  var time = function (iso) { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }); };
  var ago = function (iso, now) { var s = Math.max(0, Math.round((Date.parse(now) - Date.parse(iso)) / 1000)); return s < 60 ? s + 's ago' : Math.round(s / 60) + ' min ago'; };
  var dur = function (a, b) { var m = Math.round((Date.parse(b) - Date.parse(a)) / 60000); return m < 1 ? '<1 min' : m + ' min'; };
  var short = function (p) { return String(p || '').replace(/([0-9a-f]{6})[0-9a-f]{2}-[0-9a-f-]{27}/i, '$1…'); };
  var tidy = function (t) { return String(t || '').replace(/\s*[|·]\s*MZB Academy\s*$/, ''); };
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  function whereCell(e) { var td = el('td', 'lv-where'); td.appendChild(el('span', 'lv-flag', flag(e.country))); td.appendChild(document.createTextNode(' ' + place(e))); return td; }
  var LABEL = { plan: 'Score plan', playbook: 'Playbook', signup: 'Sign-up', freecall: 'Free call', bootcamp: 'Bootcamp', contact: 'Contact' };

  function what(e) {
    var td = el('td');
    if (e.type === 'view') {
      td.appendChild(document.createTextNode('Viewed '));
      td.appendChild(el('b', null, short(e.path)));
      if (e.title) td.appendChild(el('span', 'lv-muted', ' ' + tidy(e.title)));
    } else if (e.type === 'scroll' || e.type === 'click') {
      td.appendChild(document.createTextNode('Event '));
      td.appendChild(el('span', 'lv-chip', e.type));
      td.appendChild(document.createTextNode(' on ' + short(e.path) + ' '));
      td.appendChild(el('span', 'lv-muted', e.type === 'scroll' ? 'depth=' + e.depth : '“' + (e.detail || '') + '”'));
    } else {
      td.appendChild(el('span', 'lv-chip lv-chip-gold', LABEL[e.type] || e.type));
      td.appendChild(document.createTextNode(' ' + (e.detail || '')));
    }
    return td;
  }

  function render(d) {
    $('lv-active').textContent = d.activeCount;
    $('lv-hour').textContent = d.lastHour;
    var vb = $('lv-visitors'); vb.textContent = '';
    if (!d.active.length) { var r = el('tr'); var c = el('td', 'lv-empty', 'No one on the site right now.'); c.colSpan = 5; r.appendChild(c); vb.appendChild(r); }
    d.active.forEach(function (v) {
      var r = el('tr'); r.appendChild(whereCell(v));
      var pg = el('td'); pg.appendChild(el('b', null, short(v.page))); if (v.title) pg.appendChild(el('span', 'lv-muted', ' ' + tidy(v.title))); r.appendChild(pg);
      r.appendChild(el('td', 'lv-num', String(v.views))); r.appendChild(el('td', null, dur(v.first, v.last))); r.appendChild(el('td', 'lv-muted', ago(v.last, d.now)));
      vb.appendChild(r);
    });
    var eb = $('lv-events'); eb.textContent = '';
    if (!d.events.length) { var r2 = el('tr'); var c2 = el('td', 'lv-empty', 'No activity in the last hour.'); c2.colSpan = 3; r2.appendChild(c2); eb.appendChild(r2); }
    d.events.forEach(function (e) { var r = el('tr', e.type === 'view' || e.type === 'scroll' || e.type === 'click' ? '' : 'lv-key'); r.appendChild(el('td', 'lv-time', time(e.t))); r.appendChild(whereCell(e)); r.appendChild(what(e)); eb.appendChild(r); });
    $('lv-updated').textContent = 'Updated ' + time(d.now);
  }

  var timer = null;
  function load() {
    fetch('/admin/live.json', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { $('lv-updated').textContent = 'Could not refresh. Retrying…'; });
  }
  function start() { if (!timer) { load(); timer = setInterval(load, 10000); } }
  function stop() { clearInterval(timer); timer = null; }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  start();
})();
