(function () {
  'use strict';

  /* ДАННЫЕ РАСЧЁТА — единственное место, которое нужно править.
     Вариант «до 35 м²» взят со скриншота; остальные значения примерные, замените на свои. */
  var AREAS = [
    { label: 'до 20 м²',    power: '2,6', price: 29900 },
    { label: 'до 35 м²',    power: '3,5', price: 39900 },
    { label: 'до 50 м²',    power: '5,3', price: 54900 },
    { label: 'более 50 м²', power: '7,0', price: 74900 }
  ];

  var form = document.getElementById('calc-form');
  var steps = form.querySelectorAll('[data-step]');
  var labels = document.querySelectorAll('[data-step-label]');
  var bar = document.getElementById('progress');
  var areasBox = document.getElementById('areas');
  var chosen = document.getElementById('chosen');
  var chosenValue = document.getElementById('chosen-value');
  var calcBtn = document.getElementById('calculate');
  var selectedArea = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); }

  function goTo(n) {
    steps.forEach(function (s) { s.classList.toggle('is-active', +s.dataset.step === n); });
    labels.forEach(function (l) {
      var k = +l.dataset.stepLabel;
      l.classList.toggle('is-active', k === n);
      l.classList.toggle('is-done', k < n);
    });
    bar.style.width = (n / steps.length * 100) + '%';
    document.getElementById('calc').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  AREAS.forEach(function (a, i) {
    var l = document.createElement('label');
    l.className = 'option';
    l.innerHTML = '<input type="radio" name="area" value="' + i + '"><span class="option__body"></span>';
    l.querySelector('.option__body').textContent = a.label;
    areasBox.appendChild(l);
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'type') goTo(2);
    if (e.target.name === 'area') {
      selectedArea = AREAS[+e.target.value];
      chosenValue.textContent = selectedArea.label;
      chosen.hidden = false;
      calcBtn.disabled = false;
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!selectedArea) return;
    document.getElementById('res-model').textContent = 'Кондиционер • ' + selectedArea.power + ' кВт';
    document.getElementById('res-note').textContent =
      form.elements.type.value + ', для помещения ' + selectedArea.label;
    var priceEl = document.getElementById('res-price');
    var target = selectedArea.price;
    goTo(3);
    if (reduced) { priceEl.textContent = 'от ' + fmt(target) + ' ₽'; return; }
    var start = performance.now(), dur = 700;
    (function tick(t) {
      var p = Math.min((t - start) / dur, 1);
      priceEl.textContent = 'от ' + fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + ' ₽';
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });

  document.getElementById('back').addEventListener('click', function () { goTo(1); });
  document.getElementById('restart').addEventListener('click', function () {
    form.reset();
    selectedArea = null;
    chosen.hidden = true;
    calcBtn.disabled = true;
    goTo(1);
  });

  bar.style.width = (100 / steps.length) + '%';
})();
