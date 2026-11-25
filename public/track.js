// Anonymous live activity for the site owner's admin page: page view, scroll depth and button clicks.
// Sends a tiny beacon to /t. No cookies beyond the site's own session, no third parties.
(function () {
  var meta = document.querySelector('meta[name="csrf-token"]');
  if (!meta || !navigator.sendBeacon) return;
  var token = meta.content, path = location.pathname;
  function send(data) {
    data._csrf = token; data.path = path;
    try { navigator.sendBeacon('/t', new URLSearchParams(data)); } catch (e) {}
  }
  send({ type: 'view', title: document.title });

  var marks = [25, 50, 75, 100], sent = {}, ticking = false;
  function check() {
    ticking = false;
    var doc = document.documentElement, max = doc.scrollHeight - window.innerHeight;
    var pct = max <= 0 ? 100 : Math.round(100 * window.scrollY / max);
    marks.forEach(function (m) { if (pct >= m - 1 && !sent[m]) { sent[m] = 1; send({ type: 'scroll', depth: m }); } });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; setTimeout(check, 250); } }, { passive: true });

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a.btn, button.btn, .v-step-link, .v-ch-choice');
    if (!el) return;
    var label = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (label) send({ type: 'click', label: label });
  }, true);
})();
