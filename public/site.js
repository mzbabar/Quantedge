// Home page enhancements. Everything on the page works without this file;
// it only adds motion, the header style on scroll, and the interactive 60-second challenge.
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  // Header: transparent over the hero, solid once you scroll.
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Fade sections in as they enter the screen.
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  // Count-up numbers in the stats band.
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = +el.dataset.count; if (reduce || !target) return;
    var started = false;
    var run = function () {
      if (started) return; started = true;
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { run(); o.disconnect(); } }).observe(el); else run();
  });

  // Sticky cohort bar: slides in after the hero; live countdown to the cohort start.
  var bar = document.getElementById('cohort-bar');
  if (bar) {
    var startAt = Date.parse(bar.dataset.start), countEl = document.getElementById('cohort-count');
    var showBar = function () { bar.classList.toggle('on', window.scrollY > 520); };
    window.addEventListener('scroll', showBar, { passive: true }); showBar();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var ms = Math.max(0, startAt - Date.now()), s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
      countEl.innerHTML = 'Starts in <b>' + d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(sec) + 's</b>';
    };
    if (countEl && !isNaN(startAt)) { tick(); setInterval(tick, 1000); }
  }

  // 60-second challenge.
  var box = document.getElementById('challenge');
  if (!box) return;
  var answer = +box.dataset.answer, done = false, secs = 60;
  var ring = document.getElementById('ch-ring'), secsEl = document.getElementById('ch-secs');
  var result = document.getElementById('ch-result'), sol = document.getElementById('ch-sol');
  var C = 2 * Math.PI * 15.5; ring.style.strokeDasharray = C; ring.style.strokeDashoffset = 0;
  box.classList.add('live');
  var timer = null;
  function start() {
    if (timer || done) return;
    var t0 = Date.now();
    timer = setInterval(function () {
      var left = Math.max(0, 60 - Math.floor((Date.now() - t0) / 1000));
      if (left !== secs) { secs = left; secsEl.textContent = secs; ring.style.strokeDashoffset = C * (1 - secs / 60); }
      if (secs === 0) finish(null);
    }, 200);
  }
  // Start the clock when the card is on screen.
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: 0.6 }).observe(box); else start();

  function finish(k) {
    if (done) return; done = true; clearInterval(timer);
    var used = 60 - secs;
    box.querySelectorAll('.v-ch-choice').forEach(function (b) {
      var bk = +b.dataset.k; b.disabled = true;
      if (bk === answer) b.classList.add('right'); else if (bk === k) b.classList.add('wrong');
    });
    result.hidden = false;
    result.className = 'v-ch-result ' + (k === answer ? 'ok' : 'no');
    result.textContent = k === null ? "Time's up. Here's the trick that solves it in 5 seconds:"
      : k === answer ? 'Correct in ' + used + ' seconds. Here is the fastest way:'
      : 'Not quite. Most people try to square the numbers. Here is the trick:';
    sol.open = true;
    box.classList.add('done');
  }
  box.querySelectorAll('.v-ch-choice').forEach(function (b) {
    b.addEventListener('click', function () { start(); finish(+b.dataset.k); });
  });
})();
