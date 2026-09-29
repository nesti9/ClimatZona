(function () {
  'use strict';

  /* НАСТРОЙКИ — то, что нужно править под себя.
     «до 35 м²» взято с исходного макета; остальные мощности и цены примерные. */
  var CONSULT_URL = 'tel:+70000000000'; // замените на настоящий телефон или ссылку
  var AREAS = [
    { prefix: 'до',    value: '20 м²', power: '2,6', price: 29900, image: 'images/result-1.jpg' },
    { prefix: 'до',    value: '35 м²', power: '3,5', price: 39900, image: 'images/result-2.jpg' },
    { prefix: 'до',    value: '50 м²', power: '5,3', price: 54900, image: 'images/result-3.jpg' },
    { prefix: 'более', value: '50 м²', power: '7,0', price: 74900, image: 'images/result-4.jpg' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var form = $('calc-form');
  var steps = form.querySelectorAll('[data-step]');
  var labels = document.querySelectorAll('[data-step-label]');
  var bar = $('progress');
  var chosen = $('chosen');
  var calcBtn = $('calculate');
  var selectedArea = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); }
  function areaLabel(a) { return a.prefix + ' ' + a.value; }

  /* Если фото не загрузилось — показываем аккуратный запасной фон вместо сломанной картинки */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function miss() { img.classList.add('is-missing'); }
    img.addEventListener('error', miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });

  function goTo(n) {
    steps.forEach(function (s) { s.classList.toggle('is-active', +s.dataset.step === n); });
    labels.forEach(function (l) {
      var k = +l.dataset.stepLabel;
      l.classList.toggle('is-active', k === n);
      l.classList.toggle('is-done', k < n);
    });
    bar.style.width = (n / steps.length * 100) + '%';
    $('calc').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  AREAS.forEach(function (a, i) {
    var l = document.createElement('label');
    l.className = 'area';
    l.innerHTML = '<input type="radio" name="area" value="' + i + '">' +
      '<span class="area__card"><span class="area__prefix"></span><span class="area__value"></span></span>';
    l.querySelector('.area__prefix').textContent = a.prefix;
    l.querySelector('.area__value').textContent = a.value;
    $('areas').appendChild(l);
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'type') goTo(2);
    if (e.target.name === 'area') {
      selectedArea = AREAS[+e.target.value];
      $('chosen-value').textContent = form.elements.type.value + ' · ' + areaLabel(selectedArea);
      chosen.hidden = false;
      calcBtn.disabled = false;
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!selectedArea) return;
    var a = selectedArea;
    $('res-model').textContent = 'Кондиционер • ' + a.power + ' кВт';
    $('res-type').textContent = form.elements.type.value;
    $('res-area').textContent = areaLabel(a);
    $('res-power').textContent = a.power + ' кВт';
    $('res-badge').textContent = a.power + ' кВт';
    var img = $('res-img');
    img.classList.remove('is-missing');
    img.src = a.image;
    $('consult').href = CONSULT_URL;

    var priceEl = $('res-price');
    goTo(3);
    if (reduced) { priceEl.textContent = 'от ' + fmt(a.price) + ' ₽'; return; }
    var start = performance.now(), dur = 700;
    (function tick(t) {
      var p = Math.min((t - start) / dur, 1);
      priceEl.textContent = 'от ' + fmt(Math.round(a.price * (1 - Math.pow(1 - p, 3)))) + ' ₽';
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });

  $('back').addEventListener('click', function () { goTo(1); });
  $('restart').addEventListener('click', function () {
    form.reset();
    selectedArea = null;
    chosen.hidden = true;
    calcBtn.disabled = true;
    goTo(1);
  });

  bar.style.width = (100 / steps.length) + '%';
})();
