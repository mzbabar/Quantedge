// MZB Academy full-length practice test: one question at a time, 45:00 countdown,
// bookmarks, and an end-of-section review with up to 3 answer edits (like the GMAT).
// Without this script the form still works: all questions show and can be submitted.
(function () {
  var form = document.getElementById('exam');
  if (!form) return;
  var total = +form.dataset.total;
  var KEY = 'mzb-test-' + form.dataset.attempt;
  var MAX_EDITS = 3;
  var qs = Array.prototype.slice.call(form.querySelectorAll('fieldset.exam-q'));
  var $ = function (id) { return document.getElementById(id); };
  var timerEl = $('exam-timer'), countEl = $('exam-count'), hint = $('exam-hint');
  var btnNext = $('btn-next'), btnReview = $('btn-review'), btnSubmit = $('btn-submit'), btnBm = $('btn-bookmark');
  var review = $('exam-review'), grid = $('review-grid'), editsLeft = $('edits-left');

  var st = { idx: 0, phase: 'test', bookmarks: [], times: [], first: [], edited: [], edits: 0 };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) st = saved; } catch (e) {}
  for (var i = 0; i < total; i++) { st.times[i] = st.times[i] || 0; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function answerOf(i) { var r = qs[i].querySelector('input:checked'); return r ? +r.value : null; }
  // Restore answers saved before a refresh.
  if (st.answers) st.answers.forEach(function (v, i) { if (v !== null && v !== undefined) { var r = qs[i].querySelector('input[value="' + v + '"]'); if (r) r.checked = true; } });
  function snapshot() { st.answers = qs.map(function (_, i) { return answerOf(i); }); save(); }

  form.classList.add('js');
  btnSubmit.hidden = true;
  var current = null, shownAt = Date.now();

  function track() { if (current !== null) { st.times[current] += Math.round((Date.now() - shownAt) / 1000); } shownAt = Date.now(); }

  function show(i) {
    track();
    current = i;
    qs.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    review.hidden = true;
    var revisit = st.phase !== 'test';
    countEl.textContent = 'Question ' + (i + 1) + ' of ' + total;
    btnBm.hidden = false;
    btnBm.textContent = st.bookmarks.indexOf(i) >= 0 ? 'Bookmarked ✓' : 'Bookmark';
    btnBm.classList.toggle('on', st.bookmarks.indexOf(i) >= 0);
    btnNext.hidden = revisit; btnReview.hidden = !revisit; btnSubmit.hidden = true;
    var lock = revisit && st.edits >= MAX_EDITS && st.edited.indexOf(i) < 0;
    qs[i].querySelectorAll('input').forEach(function (r) { r.disabled = lock; });
    hint.textContent = lock ? 'You have used all 3 edits. This answer is locked.' : (revisit ? 'Changing this answer uses 1 of your edits.' : '');
    btnNext.disabled = answerOf(i) === null;
    btnNext.textContent = i === total - 1 ? 'Finish & review' : 'Next';
    window.scrollTo(0, 0);
  }

  function showReview() {
    track(); current = null;
    st.phase = 'review'; save();
    qs.forEach(function (f) { f.classList.remove('on'); });
    review.hidden = false;
    countEl.textContent = 'Review';
    btnBm.hidden = true; btnNext.hidden = true; btnReview.hidden = true; btnSubmit.hidden = false;
    hint.textContent = '';
    editsLeft.textContent = MAX_EDITS - st.edits;
    grid.innerHTML = '';
    qs.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rv';
      var a = answerOf(i);
      b.innerHTML = '<b>' + (i + 1) + '</b><span>' + (a === null ? '—' : 'ABCDE'[a]) + '</span>';
      if (st.bookmarks.indexOf(i) >= 0) b.classList.add('bm');
      if (st.edited.indexOf(i) >= 0) b.classList.add('ed');
      if (a === null) b.classList.add('un');
      b.addEventListener('click', function () { st.phase = 'revisit'; st.idx = i; save(); show(i); });
      grid.appendChild(b);
    });
    window.scrollTo(0, 0);
  }

  form.addEventListener('change', function (e) {
    if (current === null) return;
    if (st.phase === 'test') { btnNext.disabled = answerOf(current) === null; }
    snapshot();
  });

  btnNext.addEventListener('click', function () {
    if (answerOf(current) === null) return;
    st.first[current] = answerOf(current);
    if (current === total - 1) { showReview(); return; }
    st.idx = current + 1; save(); show(st.idx);
  });

  btnReview.addEventListener('click', function () {
    var i = current, a = answerOf(i);
    if (a !== st.first[i] && st.edited.indexOf(i) < 0) { st.edits++; st.edited.push(i); }
    snapshot(); showReview();
  });

  btnBm.addEventListener('click', function () {
    var k = st.bookmarks.indexOf(current);
    if (k >= 0) st.bookmarks.splice(k, 1); else st.bookmarks.push(current);
    save(); btnBm.textContent = k >= 0 ? 'Bookmark' : 'Bookmarked ✓'; btnBm.classList.toggle('on', k < 0);
  });

  var armed = false, submitted = false;
  function finish() {
    if (submitted) return; submitted = true;
    track();
    qs.forEach(function (f) { f.querySelectorAll('input').forEach(function (r) { r.disabled = false; }); });
    $('times').value = JSON.stringify(st.times);
    $('edits').value = st.edits;
    try { localStorage.removeItem(KEY); } catch (e) {}
    form.submit();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!armed) { armed = true; btnSubmit.textContent = 'Click again to end the section'; setTimeout(function () { armed = false; btnSubmit.textContent = 'Submit test'; }, 4000); return; }
    finish();
  });

  // Countdown from the server's remaining time, so a refresh can't reset the clock.
  var end = Date.now() + (+form.dataset.remaining) * 1000;
  function tick() {
    var s = Math.max(0, Math.round((end - Date.now()) / 1000));
    timerEl.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    timerEl.classList.toggle('warn', s <= 300);
    if (s === 0) { hint.textContent = 'Time is up. Submitting your test…'; finish(); return; }
    setTimeout(tick, 250);
  }
  tick();

  if (st.phase === 'test') show(st.idx || 0); else showReview();
})();
