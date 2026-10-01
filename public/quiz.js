// Optional enhancement for the Quant score check: a running timer and answered counter.
// The quiz works without this file (e.g. if a web filter blocks it); time just isn't recorded.
(function () {
  var form = document.getElementById('quiz-form');
  if (!form) return;
  var bar = document.getElementById('quiz-bar');
  var timer = document.getElementById('quiz-timer');
  var progress = document.getElementById('quiz-progress');
  var elapsed = document.getElementById('elapsed');
  var total = form.querySelectorAll('fieldset.quiz-q').length;
  var start = Date.now();
  bar.hidden = false;

  function secs() { return Math.round((Date.now() - start) / 1000); }
  function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function tick() {
    var s = secs();
    timer.textContent = fmt(s) + ' elapsed · target ' + fmt(total * 128);
    timer.className = s > total * 128 ? 'over' : '';
  }
  function count() {
    var n = new Set(Array.prototype.map.call(form.querySelectorAll('input[type=radio]:checked'), function (r) { return r.name; })).size;
    progress.textContent = n + ' of ' + total + ' answered';
  }
  form.addEventListener('change', count);
  form.addEventListener('submit', function () { elapsed.value = secs(); });
  tick(); count();
  setInterval(tick, 1000);
})();
