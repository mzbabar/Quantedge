// "Find your plan": one question at a time with auto-advance. Without JS all steps show as one form.
(function () {
  var form = document.getElementById('plan-form');
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.plan-step'));
  var bar = document.getElementById('plan-bar'), nav = document.getElementById('plan-nav'), back = document.getElementById('plan-back');
  form.classList.add('js-steps');
  // Start at the first unanswered question (e.g. after a validation error).
  var cur = steps.findIndex(function (s) { var r = s.querySelector('input[type=radio]'); return r ? !s.querySelector('input:checked') : true; });
  if (cur < 0) cur = steps.length - 1;
  function show(i) {
    cur = i;
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    bar.style.width = Math.round(100 * i / (steps.length - 1)) + '%';
    nav.hidden = i === 0;
    var first = steps[i].querySelector('input:checked, input');
    if (first && i === steps.length - 1) setTimeout(function () { first.focus(); }, 50);
  }
  form.addEventListener('change', function (e) {
    if (e.target.type !== 'radio') return;
    var i = steps.indexOf(e.target.closest('.plan-step'));
    if (i === cur && i < steps.length - 1) setTimeout(function () { show(i + 1); }, 260);
  });
  back.addEventListener('click', function () { if (cur > 0) show(cur - 1); });
  show(cur);
})();
