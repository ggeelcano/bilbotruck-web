/* Bilbotruck · versión concesionario: carrusel, buscador, listado, ficha, cita previa y formularios a WhatsApp */
(function () {
  'use strict';
  var ALL = window.STOCK || [];
  var S = ALL.filter(function (v) { return !v.oculto; });
  var B = '../';
  var WA = '34687953751', TEL = 'tel:+34687953751', TEL_TXT = '687 95 37 51', MAIL = 'info@bilbotruck.com';
  var MAPS_DIR = 'https://www.google.com/maps/dir/?api=1&destination=Bilbotruck%20Isuzu%2C%20Bedia';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var cmp = function (a, b) { return a.localeCompare(b, 'es'); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var debounce = function (fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; };
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var CATS = { camion: 'Camiones y carrozados', furgoneta: 'Furgonetas', pickup: 'Pick-up', turismo: 'Turismos y SUV' };
  var SERIES = { dmax: 'Isuzu D-Max', N: 'Isuzu Serie N', F: 'Isuzu Serie F' };

  var nombre = function (v) { return v.marca + ' ' + v.modelo; };
  var final = function (v) { return v.iva ? v.precio : v.precio * 1.21; };
  var kmTxt = function (v) { return v.nuevo ? '0 km' : fmt(v.km) + ' km'; };
  var garTxt = function (m) { return !m ? null : m % 12 === 0 && m >= 24 ? (m / 12) + ' años' : m + ' meses'; };
  var precioTxt = function (v) { return fmt(v.precio) + ' €' + (v.iva ? '' : ' + IVA'); };
  var base = function (v) { return /^Serie\b/.test(v.modelo) ? v.modelo.split(' ').slice(0, 2).join(' ') : v.modelo.split(' ')[0]; };

  var ICO = {
    chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
    gear: '<path d="M5 4v16M12 4v16M19 4v8M5 12h14"/>',
    weight: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.9 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.54L19.4 9.5A2 2 0 0 0 17.48 8z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.3a1 1 0 0 0-.2-.6l-3.5-4.4A1 1 0 0 0 17.5 8H14"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  var ico = function (n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICO[n] + '</svg>'; };
  var thin = function (d) { return '<svg class="thin" viewBox="0 0 20 100" aria-hidden="true"><path d="' + (d === 'l' ? 'M18 2 3 50l15 48' : 'M2 2l15 48L2 98') + '"/></svg>'; };
  var WA_ICO = '<svg class="i wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm5.8 14.1c-.25.7-1.44 1.33-2 1.38-.52.05-1 .24-3.38-.7-2.85-1.12-4.65-4.04-4.79-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35l.53.01c.17 0 .4-.06.62.48.25.6.84 2.05.91 2.2.07.14.12.31.02.5-.1.19-.14.31-.28.48l-.42.49c-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.7-.82.89-1.1.19-.28.37-.23.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.18 1.38z"/></svg>';

  // ---------- tarjeta de vehículo ----------
  function rib(v) { return v.nuevo ? '<span class="c-rib">' + (v.garantia >= 60 ? 'Nuevo' : 'KM 0') + '</span>' : ''; }
  function card(v, list) {
    var spec = list
      ? '<div class="c-spec2"><span>' + v.anio + '</span><span>' + kmTxt(v) + '</span><span>' + esc(v.cambio || v.carroceria) + '</span><span>' + (v.cv ? v.cv + ' CV' : '') + '</span><span>' + esc(v.comb || '') + '</span><span>' + (v.garantia ? 'Garantía ' + garTxt(v.garantia) : '') + '</span></div>'
      : '<div class="c-spec"><div><span>' + v.anio + '</span><span>' + kmTxt(v) + '</span></div><div><span>' + esc(v.comb || '') + '</span><span>' + esc(v.cambio || (v.cv ? v.cv + ' CV' : v.carroceria)) + '</span></div></div>';
    return '<article class="card"><a href="vehiculo.html?id=' + v.id + '">' +
      '<div class="c-img"><img src="' + B + 'assets/stock/' + v.id + '-card.jpg" width="480" height="360" alt="" loading="lazy">' + rib(v) + (v.ayto ? '<span class="c-tag">Ex-ayuntamiento</span>' : '') + '</div>' +
      '<h3 class="c-tit">' + esc(nombre(v)) + '</h3>' + spec +
      '<p class="c-price"><b>' + fmt(v.precio) + ' €</b><small>' + (v.iva ? 'IVA incl.' : '+ IVA') + '</small></p>' +
      '</a></article>';
  }

  // ---------- formularios que abren WhatsApp con el mensaje escrito ----------
  var FALTA = { nombre: 'tu nombre', tel: 'tu teléfono', acepto: 'marcar la casilla de aceptación', mensaje: 'el mensaje', dia: 'elegir un día en el calendario' };
  function waForm(f, req, build) {
    if (!f) return;
    var msg = $('.form-msg', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; };
      $$('[aria-invalid]', f).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      $$('.is-err', f).forEach(function (el) { el.classList.remove('is-err'); });
      var bad = req.filter(function (n) {
        var el = f.elements[n];
        if (!el) return false;
        if (el.type === 'checkbox') return !el.checked;
        if (n === 'tel') return g(n).replace(/\D/g, '').length < 9;
        return !g(n);
      });
      if (bad.length) {
        bad.forEach(function (n) {
          var el = f.elements[n];
          if (el.type === 'hidden') { var box = $('[data-for="' + n + '"]', f); if (box) box.classList.add('is-err'); }
          else el.setAttribute('aria-invalid', 'true');
        });
        var first = f.elements[bad[0]];
        if (first.type === 'hidden') { var bx = $('[data-for="' + bad[0] + '"]', f); var fb = bx && ($('button[tabindex="0"]', bx) || bx); if (fb) fb.focus(); }
        else first.focus();
        msg.className = 'form-msg err';
        msg.textContent = 'Falta ' + bad.map(function (n) { return n === 'tel' && g('tel') ? 'un teléfono válido' : (FALTA[n] || n); }).join(', ').replace(/, ([^,]*)$/, ' y $1') + '.';
        return;
      }
      window.open(wa(build(g)), '_blank', 'noopener');
      msg.className = 'form-msg';
      msg.textContent = 'Se ha abierto WhatsApp con tu mensaje. Envíalo y te contestamos enseguida.';
    });
  }

  // ---------- común ----------
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  var mb = $('.mb-menu'), nav = $('#nav');
  if (mb && nav) {
    var setNav = function (open) { nav.classList.toggle('open', open); mb.setAttribute('aria-expanded', open ? 'true' : 'false'); $('span', mb).textContent = open ? 'Cerrar' : 'Menú'; };
    mb.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); mb.focus(); } });
  }
  $$('.has-sub').forEach(function (li) {
    li.addEventListener('keydown', function (e) { if (e.key === 'Escape') { li.classList.add('shut'); $('a', li).focus(); } });
    li.addEventListener('mouseleave', function () { li.classList.remove('shut'); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) li.classList.remove('shut'); });
  });
  waForm($('#form-llamada'), ['nombre', 'tel', 'acepto'], function (g) {
    return 'Hola Bilbotruck, ¿me podéis llamar?\nNombre: ' + g('nombre') + '\nTeléfono: ' + g('tel');
  });

  // carrusel de portada
  var sl = $('#slider');
  if (sl) {
    var slides = $$('.slide', sl), dots = $$('.s-dots button:not(.s-pause)', sl), pb = $('.s-pause', sl);
    var cur = 0, timer = null, userPaused = reduce, hold = false;
    var show = function (i) {
      var o = slides[cur];
      o.classList.remove('on'); o.setAttribute('aria-hidden', 'true'); o.setAttribute('inert', '');
      cur = (i + slides.length) % slides.length;
      var s = slides[cur], im = $('.s-img', s);
      if (im && im.loading === 'lazy') im.loading = 'eager';
      s.classList.add('on'); s.removeAttribute('aria-hidden'); s.removeAttribute('inert');
      dots.forEach(function (d, j) { d.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
    };
    var tick = function () { clearTimeout(timer); if (!userPaused && !hold && !document.hidden) timer = setTimeout(function () { show(cur + 1); tick(); }, 6000); };
    var setPause = function () {
      if (!pb) return;
      pb.classList.toggle('paused', userPaused);
      pb.setAttribute('aria-label', userPaused ? 'Reanudar el carrusel' : 'Pausar el carrusel');
    };
    $('.s-prev', sl).addEventListener('click', function () { show(cur - 1); tick(); });
    $('.s-next', sl).addEventListener('click', function () { show(cur + 1); tick(); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { show(j); tick(); }); });
    if (pb) pb.addEventListener('click', function () { userPaused = !userPaused; setPause(); tick(); });
    sl.addEventListener('mouseenter', function () { hold = true; clearTimeout(timer); });
    sl.addEventListener('mouseleave', function () { hold = false; tick(); });
    sl.addEventListener('focusin', function () { hold = true; clearTimeout(timer); });
    sl.addEventListener('focusout', function (e) { if (!sl.contains(e.relatedTarget)) { hold = false; tick(); } });
    document.addEventListener('visibilitychange', tick);
    var sx = null;
    sl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); tick(); } sx = null; }, { passive: true });
    setPause(); tick();
  }

  // filas con flechas finas (gama y miniaturas de la ficha)
  function rowScroller(list, prev, next) {
    if (!list || !prev || !next) return;
    var upd = function () {
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    };
    var step = function () { return Math.max(list.clientWidth * 0.8, 120); };
    prev.addEventListener('click', function () { list.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { list.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    list.addEventListener('scroll', debounce(upd, 60), { passive: true });
    window.addEventListener('resize', debounce(upd, 120));
    upd();
    return upd;
  }
  var gl = $('#gama-list');
  if (gl) rowScroller(gl, $('.gama-sec .gcar-prev'), $('.gama-sec .gcar-next'));

  // ---------- buscador (portada y listado) ----------
  var page = document.body.getAttribute('data-page');
  var sf = $('#search'), F = {}, R = {}, onChange = function () {};
  var FMT_R = { p: function (n) { return fmt(n) + ' €'; }, k: function (n) { return fmt(n) + ' km'; }, a: function (n) { return String(n); } };
  var TXT_R = { p: function (n) { return fmt(n) + ' euros'; }, k: function (n) { return fmt(n) + ' kilómetros'; }, a: function (n) { return 'año ' + n; } };
  function syncR(k, moved) {
    var r = R[k], lo = +r.lo.value, hi = +r.hi.value;
    if (lo > hi) { if (moved === r.lo) { r.lo.value = hi; lo = hi; } else { r.hi.value = lo; hi = lo; } }
    var span = (r.max - r.min) || 1, a = (lo - r.min) / span, b = (hi - r.min) / span;
    r.fill.style.left = 'calc(8px + (100% - 16px) * ' + a + ')';
    r.fill.style.right = 'calc(8px + (100% - 16px) * ' + (1 - b) + ')';
    r.vlo.textContent = FMT_R[k](lo);
    r.vhi.textContent = FMT_R[k](hi);
    r.lo.setAttribute('aria-valuetext', TXT_R[k](lo));
    r.hi.setAttribute('aria-valuetext', TXT_R[k](hi));
    r.lo.style.zIndex = a > 0.97 ? 3 : 1;
    r.hi.style.zIndex = 2;
  }
  function setR(k, lo, hi) {
    var r = R[k];
    r.lo.value = lo != null && lo !== '' ? lo : r.min;
    r.hi.value = hi != null && hi !== '' ? hi : r.max;
    syncR(k, r.hi);
  }
  function fillModelos() {
    var m = F.marca.value, c = F.cat.value, prev = F.modelo.value, groups = {};
    S.forEach(function (v) { if ((!m || v.marca === m) && (!c || v.cat === c)) (groups[v.marca] = groups[v.marca] || {})[base(v)] = 1; });
    var ks = Object.keys(groups).sort(cmp), html = '<option value="">Modelo</option>';
    ks.forEach(function (g) {
      var opts = Object.keys(groups[g]).sort(cmp).map(function (b) { return '<option value="' + esc(b) + '" data-marca="' + esc(g) + '">' + esc(b) + '</option>'; }).join('');
      html += (m || ks.length === 1) ? opts : '<optgroup label="' + esc(g) + '">' + opts + '</optgroup>';
    });
    F.modelo.innerHTML = html;
    F.modelo.value = prev;
    if (F.modelo.value !== prev) F.modelo.value = '';
  }
  function readForm() {
    return {
      q: F.q ? F.q.value.trim() : '', cat: F.cat.value, marca: F.marca.value, modelo: F.modelo.value,
      pmin: +R.p.lo.value, pmax: +R.p.hi.value, kmin: +R.k.lo.value, kmax: +R.k.hi.value, amin: +R.a.lo.value, amax: +R.a.hi.value
    };
  }
  function match(v, s) {
    if (s.cat && v.cat !== s.cat) return false;
    if (s.marca && v.marca !== s.marca) return false;
    if (s.modelo && base(v) !== s.modelo) return false;
    if (s.serie && v.serie !== s.serie) return false;
    if (s.km0 && !v.nuevo) return false;
    var p = final(v);
    if (p < s.pmin || p > s.pmax) return false;
    if (v.km < s.kmin || v.km > s.kmax) return false;
    if (v.anio < s.amin || v.anio > s.amax) return false;
    if (s.q) {
      var hay = norm([v.marca, v.modelo, v.version, v.carroceria, v.comb, CATS[v.cat], (v.desc || []).join(' ')].join(' '));
      if (/pluma|grua|pulpo/.test(hay)) hay += ' grua pluma';
      if (/basculante|volquete/.test(hay)) hay += ' basculante volquete';
      if (/isoterm|frio|frigorif/.test(hay)) hay += ' isotermo frigorifico frio';
      if (v.ayto) hay += ' ayuntamiento';
      if (v.nuevo) hay += ' km0 nuevo';
      if (!norm(s.q).split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) > -1; })) return false;
    }
    return true;
  }
  function toQuery(s, X) {
    var p = new URLSearchParams();
    if (s.q) p.set('q', s.q);
    if (s.cat) p.set('cat', s.cat);
    if (s.marca) p.set('marca', s.marca);
    if (s.modelo) p.set('modelo', s.modelo);
    if (X && X.serie) p.set('serie', X.serie);
    if (X && X.km0) p.set('km0', '1');
    ['p', 'k', 'a'].forEach(function (k) {
      if (s[k + 'min'] > R[k].min) p.set(k + 'min', s[k + 'min']);
      if (s[k + 'max'] < R[k].max) p.set(k + 'max', s[k + 'max']);
    });
    if (X && X.orden && X.orden !== 'dest') p.set('orden', X.orden);
    if (X && X.pp && X.pp !== 12) p.set('pp', X.pp);
    if (X && X.pag > 1) p.set('pag', X.pag);
    var q = p.toString();
    return q ? '?' + q : '';
  }
  if (sf) {
    F = { q: $('#s-q'), cat: $('#s-cat'), marca: $('#s-marca'), modelo: $('#s-modelo') };
    $$('.rng-box', sf).forEach(function (bx) {
      var k = bx.getAttribute('data-rng'), ins = $$('input', bx);
      R[k] = { lo: ins[0], hi: ins[1], fill: $('.rng-fill', bx), vlo: $('.lo', bx), vhi: $('.hi', bx), min: +ins[0].min, max: +ins[0].max };
      ins.forEach(function (inp) { inp.addEventListener('input', function () { syncR(k, inp); onChange(); }); });
      syncR(k, ins[1]);
    });
    fillModelos();
    F.cat.addEventListener('change', function () { fillModelos(); onChange(); });
    F.marca.addEventListener('change', function () { fillModelos(); onChange(); });
    F.modelo.addEventListener('change', function () {
      var o = F.modelo.options[F.modelo.selectedIndex], m = o && o.getAttribute('data-marca');
      if (m && F.marca.value !== m) { F.marca.value = m; fillModelos(); }
      onChange();
    });
    if (F.q) F.q.addEventListener('input', debounce(function () { onChange(); }, 160));
  }

  // ---------- portada ----------
  if (page === 'home') {
    var DEST = ['71712048', '71750009', '71799527', '71743747', '71743659', '71376593', '71712586', '71710105'];
    var of = $('#ofertas');
    if (of) of.innerHTML = DEST.map(function (id) { return S.find(function (v) { return v.id === id; }); }).filter(Boolean).map(function (v) { return card(v); }).join('');
    var sbtn = $('#s-btn');
    onChange = function () {
      var s = readForm(), n = S.filter(function (v) { return match(v, s); }).length;
      sbtn.textContent = n === 1 ? 'Ver 1 vehículo' : 'Ver ' + n + ' vehículos';
    };
    sf.addEventListener('submit', function (e) { e.preventDefault(); location.href = 'stock.html' + toQuery(readForm()); });
    onChange();
  }

  // ---------- listado ----------
  if (page === 'stock') {
    var qs = new URLSearchParams(location.search);
    var setSel = function (el, val) { if (!val) return; el.value = val; if (el.value !== val) el.value = ''; };
    var ppOk = { 12: 1, 24: 1, 48: 1 };
    var X = { serie: SERIES[qs.get('serie')] ? qs.get('serie') : '', km0: qs.get('km0') === '1', orden: qs.get('orden') || 'dest', pp: ppOk[qs.get('pp')] ? +qs.get('pp') : 12, pag: Math.max(1, parseInt(qs.get('pag'), 10) || 1) };
    if (F.q) F.q.value = qs.get('q') || '';
    setSel(F.cat, qs.get('cat'));
    setSel(F.marca, qs.get('marca'));
    fillModelos();
    var qm = qs.get('modelo');
    if (qm && !F.marca.value) {
      var hit = S.find(function (v) { return base(v) === qm; });
      if (hit) { F.marca.value = hit.marca; fillModelos(); }
    }
    setSel(F.modelo, qm);
    setR('p', qs.get('pmin'), qs.get('pmax'));
    setR('k', qs.get('kmin'), qs.get('kmax'));
    setR('a', qs.get('amin'), qs.get('amax'));
    var ord = $('#orden'), ppSel = $('#pp'), res = $('#results'), count = $('#count'), pagesEl = $('#pages'), chips = $('#chips');
    ord.value = X.orden; if (ord.value !== X.orden) { X.orden = 'dest'; ord.value = 'dest'; }
    ppSel.value = String(X.pp);
    var render = function (scroll) {
      var s = readForm(); s.serie = X.serie; s.km0 = X.km0;
      var list = S.filter(function (v) { return match(v, s); });
      var o = X.orden, R0 = { camion: 0, pickup: 1, furgoneta: 2, turismo: 3 };
      list.sort(function (a, b) {
        if (o === 'pa') return final(a) - final(b);
        if (o === 'pd') return final(b) - final(a);
        if (o === 'km') return a.km - b.km;
        if (o === 'an') return b.anio - a.anio || a.km - b.km;
        if (o === 'pub') return b.pub.localeCompare(a.pub);
        return R0[a.cat] - R0[b.cat] || b.pub.localeCompare(a.pub);
      });
      var n = list.length, pages = Math.max(1, Math.ceil(n / X.pp));
      if (X.pag > pages) X.pag = pages;
      var part = list.slice((X.pag - 1) * X.pp, X.pag * X.pp);
      res.innerHTML = n ? part.map(function (v) { return card(v, true); }).join('')
        : '<div class="empty"><h2>Ahora mismo no hay ninguno así</h2><p>Prueba a quitar algún filtro o <a href="' + wa('Hola, busco un vehículo que no encuentro en la web: ') + '" target="_blank" rel="noopener">dinos qué buscas por WhatsApp</a>.</p></div>';
      count.innerHTML = '<b>' + n + '</b> ' + (n === 1 ? 'vehículo encontrado' : 'vehículos de ocasión encontrados') + (pages > 1 ? ' (' + X.pag + ' de ' + pages + ')' : '');
      pagesEl.textContent = pages > 1 ? 'Página ' + X.pag + ' de ' + pages : '';
      $$('.pg-prev').forEach(function (b) { b.disabled = X.pag <= 1; });
      $$('.pg-next').forEach(function (b) { b.disabled = X.pag >= pages; });
      var ch = [];
      if (X.serie) ch.push('<button class="chip" type="button" data-x="serie" aria-label="Quitar filtro: ' + SERIES[X.serie] + '">' + SERIES[X.serie] + '</button>');
      if (X.km0) ch.push('<button class="chip" type="button" data-x="km0" aria-label="Quitar filtro: nuevos y KM 0">Nuevos y KM 0</button>');
      chips.innerHTML = ch.join('');
      history.replaceState(null, '', location.pathname + toQuery(s, X));
      if (scroll) { var top = $('.listado').getBoundingClientRect().top + window.pageYOffset - 10; window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' }); }
    };
    onChange = function () { X.pag = 1; render(); };
    ord.addEventListener('change', function () { X.orden = ord.value; X.pag = 1; render(); });
    ppSel.addEventListener('change', function () { X.pp = +ppSel.value; X.pag = 1; render(); });
    $$('.pg-prev').forEach(function (b) { b.addEventListener('click', function () { if (X.pag > 1) { X.pag--; render(true); } }); });
    $$('.pg-next').forEach(function (b) { b.addEventListener('click', function () { X.pag++; render(true); }); });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      X[b.getAttribute('data-x')] = b.getAttribute('data-x') === 'km0' ? false : '';
      X.pag = 1; render(); (F.q || F.cat).focus();
    });
    sf.addEventListener('submit', function (e) { e.preventDefault(); });
    sf.addEventListener('reset', function (e) {
      e.preventDefault();
      if (F.q) F.q.value = '';
      F.cat.value = ''; F.marca.value = ''; F.modelo.value = '';
      fillModelos();
      ['p', 'k', 'a'].forEach(function (k) { setR(k); });
      X.serie = ''; X.km0 = false; X.pag = 1;
      render();
    });
    render();
  }

  // ---------- ficha ----------
  if (page === 'ficha') {
    var id = new URLSearchParams(location.search).get('id');
    var v = ALL.find(function (x) { return x.id === id; });
    var root = $('#ficha');
    if (!v) {
      root.innerHTML = '<div class="wrap notfound"><h1>Este vehículo ya no está</h1><p>Es posible que se haya vendido. Echa un vistazo al resto del stock.</p><p><a class="btn" href="stock.html">Ver vehículos de ocasión</a></p></div>';
      return;
    }
    document.title = nombre(v) + ' (' + v.anio + ') · ' + precioTxt(v) + ' | Bilbotruck';
    var imgs = []; for (var k = 1; k <= v.fotos; k++) imgs.push(B + 'assets/stock/' + v.id + '-' + k + '.jpg');
    var estado = v.nuevo ? (v.garantia >= 60 ? 'Nuevo' : 'KM 0') : 'De ocasión';
    var DROWS = [
      ['Año', v.anio, 'cal'], ['Kilómetros', v.nuevo ? '0 km' : fmt(v.km) + ' km', 'gauge'], ['Potencia', v.cv ? v.cv + ' CV' : null, 'zap'],
      ['Cilindrada', v.cc ? v.cc + ' cm³' : null, 'dots'], ['Combustible', v.comb, 'fuel'], ['Cambio', v.cambio, 'gear'],
      ['MMA', v.mma, 'weight'], ['Plazas', v.plazas, 'users'], ['Garantía', garTxt(v.garantia), 'shield'], ['Carrocería', v.carroceria, 'truck']
    ].filter(function (r) { return r[1] !== null && r[1] !== undefined && r[1] !== ''; }).slice(0, 7);
    var ROWS = [
      ['Marca', v.marca], ['Modelo', v.modelo], ['Versión', v.version], ['Carrocería', v.carroceria],
      ['Año', v.anio], ['Kilómetros', v.nuevo ? '0 km (nuevo)' : fmt(v.km) + ' km'],
      ['Potencia', v.cv ? v.cv + ' CV' : null], ['Cilindrada', v.cc ? v.cc + ' cm³' : null],
      ['Combustible', v.comb], ['Cambio', v.cambio], ['MMA', v.mma], ['Plazas', v.plazas],
      ['Caja interior', v.medidas], ['Horas de trabajo', v.horas], ['Etiqueta DGT', v.etiqueta],
      ['Garantía', garTxt(v.garantia)], ['Precio sin IVA', v.iva ? null : fmt(v.precio) + ' €'], ['Precio con IVA', fmt(final(v)) + ' €'],
      ['Dónde verlo', 'Bedia (Bizkaia)']
    ].filter(function (r) { return r[1] !== null && r[1] !== undefined && r[1] !== ''; });
    var trust = [];
    if (v.incluye && v.incluye.length) trust.push('Incluye ' + v.incluye.map(function (x) { return x === 'ITV' ? x : x.charAt(0).toLowerCase() + x.slice(1); }).join(', ').replace(/, ([^,]*)$/, ' y $1') + '.');
    else trust.push('Revisado en nuestro taller oficial Isuzu antes de la entrega.');
    if (v.garantia) trust.push('Garantía de ' + garTxt(v.garantia) + '.');
    if (v.unico) trust.push('Único dueño: viene de nuestra propia flota.');
    if (v.ayto) trust.push('Procede de un ayuntamiento.');
    trust.push('Puedes verlo en Bedia de lunes a sábado.');
    trust.push('Vendemos a cualquier punto de España.');
    var msg = 'Hola, me interesa el ' + nombre(v) + ' (' + v.anio + ', ' + precioTxt(v) + ') que tenéis en la web. ¿Sigue disponible?';
    var rel = S.filter(function (x) { return x.cat === v.cat && x.id !== v.id; })
      .sort(function (a, b) { return Math.abs(final(a) - final(v)) - Math.abs(final(b) - final(v)); }).slice(0, 4);
    var tabs = [['Ficha técnica', ROWS.map(function (r) { return '<li><b>' + r[0] + ':</b> ' + esc(r[1]) + '</li>'; }).join('')], ['Lo que incluye', trust.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('')]];
    if (v.desc && v.desc.length) tabs.push(['Descripción', v.desc.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('')]);

    root.innerHTML =
      '<div class="wrap f-top">' +
        '<a class="btn btn-volver" href="stock.html' + (v.cat ? '?cat=' + v.cat : '') + '" id="volver">' + ico('back') + '<span>Volver</span></a>' +
        '<div class="f-title"><h1>' + esc(nombre(v)) + '</h1><p>' + esc(v.version) + ' · ' + estado + '</p></div>' +
      '</div>' +
      '<section class="f-band" aria-label="Precio, foto principal y datos">' +
        '<div class="wrap f-band-in">' +
          '<div class="f-price">' +
            '<p class="porsolo"><span>Por solo</span><b>' + fmt(v.precio) + ' €</b></p>' +
            '<p class="iva-l">' + (v.iva ? 'IVA incluido' : '+ IVA · ' + fmt(final(v)) + ' € con IVA') + '</p>' +
            '<a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener"><span>¿Sigue disponible?</span>' + WA_ICO + '</a>' +
            '<a class="btn" href="' + TEL + '"><span>Llamar al ' + TEL_TXT + '</span>' + ico('phone') + '</a>' +
            '<a class="btn btn-dark" href="#solicitar">Solicitar información</a>' +
          '</div>' +
          '<div class="f-photo">' +
            '<button class="f-main" type="button" aria-label="Ampliar la foto"><img id="gal-img" src="' + imgs[0] + '" width="800" height="600" alt="' + esc(nombre(v)) + ', foto 1 de ' + imgs.length + '"></button>' +
            rib(v) + (v.ayto ? '<span class="f-ayto">Ex-ayuntamiento</span>' : '') +
            '<span class="f-count" aria-hidden="true">1 / ' + imgs.length + '</span>' +
          '</div>' +
          '<div class="f-data"><h2>Datos del vehículo</h2><dl>' +
            DROWS.map(function (r) { return '<dt>' + r[0] + '</dt><dd class="ic" aria-hidden="true">' + ico(r[2]) + '</dd><dd>' + esc(r[1]) + '</dd>'; }).join('') +
          '</dl></div>' +
        '</div>' +
      '</section>' +
      '<div class="wrap"><div class="f-thumbs">' +
        '<button class="gcar-btn gcar-prev" type="button" aria-label="Fotos anteriores">' + thin('l') + '</button>' +
        '<div class="f-thumbs-list" id="thumbs">' + imgs.map(function (src, i) { return '<button type="button" data-i="' + i + '" aria-label="Ver la foto ' + (i + 1) + ' de ' + imgs.length + '"' + (i ? '' : ' aria-current="true"') + '><img src="' + src + '" alt="" loading="lazy" width="800" height="600"></button>'; }).join('') + '</div>' +
        '<button class="gcar-btn gcar-next" type="button" aria-label="Más fotos">' + thin('r') + '</button>' +
      '</div></div>' +
      '<section class="f-dark" id="solicitar" aria-label="Solicitar información y dirección">' +
        '<div class="wrap f-dark-in">' +
          '<div><h2>Solicitar información</h2>' +
            '<form id="form-info" novalidate>' +
              '<div class="frows">' +
                '<label for="i-nombre">Nombre y apellidos <span aria-hidden="true">*</span></label><input id="i-nombre" name="nombre" autocomplete="name" required>' +
                '<label for="i-tel">Teléfono <span aria-hidden="true">*</span></label><input id="i-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required>' +
                '<label for="i-mail">Email</label><input id="i-mail" name="email" type="email" autocomplete="email">' +
                '<label for="i-com">Comentarios</label><textarea id="i-com" name="comentario" rows="4"></textarea>' +
              '</div>' +
              '<label class="chk"><input type="checkbox" name="acepto" required><span>Acepto que Bilbotruck use estos datos para contestar a mi solicitud. <span aria-hidden="true">*</span></span></label>' +
              '<button class="btn" type="submit"><span>Enviar solicitud</span>' + ico('chevR') + '</button>' +
              '<p class="form-msg" role="status"></p>' +
            '</form></div>' +
          '<div class="ven"><h2>Ven a conocerlo</h2>' +
            '<p><b>Bilbotruck · Bedia</b>Bº Murtazar s/n, pabellón 5<br>48390 Bedia (Bizkaia)</p>' +
            '<p><a href="mailto:' + MAIL + '">' + MAIL + '</a><br><a href="' + TEL + '">' + TEL_TXT + '</a></p>' +
            '<p>Lunes a viernes, de 8:00 a 18:30<br>Sábados, de 9:00 a 13:00</p>' +
            '<a class="btn" href="' + MAPS_DIR + '" target="_blank" rel="noopener"><span>Cómo llegar</span>' + ico('chevR') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="wrap f-info" aria-labelledby="t-info"><h2 class="h2 center" id="t-info">Información adicional</h2><hr>' +
        '<div class="tabs" role="tablist" aria-label="Información del vehículo">' + tabs.map(function (t, i) { return '<button type="button" role="tab" id="tab-' + i + '" aria-controls="pan-' + i + '" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '">' + t[0] + '</button>'; }).join('') + '</div>' +
        tabs.map(function (t, i) { return '<div class="tabpanel" role="tabpanel" id="pan-' + i + '" aria-labelledby="tab-' + i + '" tabindex="0"' + (i ? ' hidden' : '') + '><ul class="tri">' + t[1] + '</ul></div>'; }).join('') +
      '</section>' +
      (rel.length ? '<section class="wrap f-rel" aria-labelledby="t-rel"><h2 class="h2 center" id="t-rel">Otros vehículos que te pueden interesar</h2><div class="cards">' + rel.map(function (x) { return card(x); }).join('') + '</div></section>' : '');

    // volver: si vienes del listado, vuelve con tus filtros
    var vb = $('#volver');
    vb.addEventListener('click', function (e) {
      try { var r = new URL(document.referrer); if (r.origin === location.origin && /stock\.html$/.test(r.pathname) && history.length > 1) { e.preventDefault(); history.back(); } } catch (err) { /* sin referrer */ }
    });

    // pestañas
    var tbs = $$('[role=tab]', root), pans = $$('[role=tabpanel]', root);
    var selTab = function (i, focus) {
      tbs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); t.tabIndex = j === i ? 0 : -1; pans[j].hidden = j !== i; });
      if (focus) tbs[i].focus();
    };
    tbs.forEach(function (t, i) {
      t.addEventListener('click', function () { selTab(i); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tbs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); selTab((n + tbs.length) % tbs.length, true);
      });
    });

    // galería, miniaturas y visor
    var cur2 = 0, gimg = $('#gal-img'), cnt = $('.f-count'), list = $('#thumbs'), thumbs = $$('button', list);
    var updRow = rowScroller(list, $('.f-thumbs .gcar-prev'), $('.f-thumbs .gcar-next'));
    var lb = $('#lb'), lbImg = $('img', lb), lbN = $('.n', lb), lastFocus = null;
    var showImg = function (i) {
      cur2 = (i + imgs.length) % imgs.length;
      gimg.src = imgs[cur2]; gimg.alt = nombre(v) + ', foto ' + (cur2 + 1) + ' de ' + imgs.length;
      cnt.textContent = (cur2 + 1) + ' / ' + imgs.length;
      thumbs.forEach(function (b, j) { if (j === cur2) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      var tb = thumbs[cur2];
      if (tb && (tb.offsetLeft < list.scrollLeft || tb.offsetLeft + tb.offsetWidth > list.scrollLeft + list.clientWidth)) {
        list.scrollTo({ left: tb.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (lb.classList.contains('open')) { lbImg.src = imgs[cur2]; lbImg.alt = gimg.alt; lbN.textContent = (cur2 + 1) + ' / ' + imgs.length; }
      if (updRow) setTimeout(updRow, 350);
    };
    var openLb = function () { lastFocus = document.activeElement; lb.classList.add('open'); showImg(cur2); document.body.style.overflow = 'hidden'; $('.x', lb).focus(); };
    var closeLb = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    thumbs.forEach(function (b) { b.addEventListener('click', function () { showImg(+b.getAttribute('data-i')); }); });
    $('.f-main', root).addEventListener('click', openLb);
    $('.x', lb).addEventListener('click', closeLb);
    $('.l', lb).addEventListener('click', function () { showImg(cur2 - 1); });
    $('.r', lb).addEventListener('click', function () { showImg(cur2 + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showImg(cur2 - 1);
      else if (e.key === 'ArrowRight') showImg(cur2 + 1);
      else if (e.key === 'Tab') {
        var fs = $$('button', lb), a = fs[0], z = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    var x0 = null;
    [$('.f-photo', root), lb].forEach(function (zone) {
      zone.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      zone.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) showImg(cur2 + (dx < 0 ? 1 : -1)); x0 = null; }, { passive: true });
    });
    imgs.slice(1, 3).forEach(function (s) { var im = new Image(); im.src = s; });

    waForm($('#form-info'), ['nombre', 'tel', 'acepto'], function (g) {
      return 'Hola, me interesa el ' + nombre(v) + ' (' + v.anio + ', ' + precioTxt(v) + ') que tenéis en la web.\nReferencia: ' + v.id +
        '\nNombre: ' + g('nombre') + '\nTeléfono: ' + g('tel') + (g('email') ? '\nEmail: ' + g('email') : '') + (g('comentario') ? '\nComentarios: ' + g('comentario') : '');
    });
  }

  // ---------- cita previa ----------
  if (page === 'taller') {
    var cal = $('#cal'), hid = $('#c-dia'), csel = $('#cal-sel'), fc = $('#form-cita');
    var tarde = $('input[name=franja][value="Por la tarde"]'), manana = $('input[name=franja][value="Por la mañana"]');
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var DOWL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var minD = new Date(today); minD.setDate(minD.getDate() + 1);
    var maxD = new Date(today); maxD.setDate(maxD.getDate() + 60);
    var view = new Date(minD.getFullYear(), minD.getMonth(), 1), chosen = null, focusD = null;
    var ok = function (d) { return d >= minD && d <= maxD && d.getDay() !== 0; };
    var key = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var label = function (d) { return DOWL[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; };
    var same = function (a, b) { return a && b && +a === +b; };
    var inView = function (d) { return d && d.getMonth() === view.getMonth() && d.getFullYear() === view.getFullYear(); };
    cal.setAttribute('data-for', 'dia');
    var draw = function (focus, focusOn) {
      var y = view.getFullYear(), m = view.getMonth(), lead = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var target = focusOn && inView(focusOn) ? focusOn : inView(chosen) ? chosen : inView(focusD) && ok(focusD) ? focusD : null;
      if (!target) for (var t = 1; t <= days; t++) { var dd = new Date(y, m, t); if (ok(dd)) { target = dd; break; } }
      var h = '<div class="cal-head"><button type="button" class="cal-prev" aria-label="Mes anterior"' + (new Date(y, m, 0) >= minD ? '' : ' disabled') + '>' + ico('chevL') + '</button>' +
        '<b id="cal-mes" aria-live="polite">' + MESES[m] + ' ' + y + '</b>' +
        '<button type="button" class="cal-next" aria-label="Mes siguiente"' + (new Date(y, m + 1, 1) <= maxD ? '' : ' disabled') + '>' + ico('chevR') + '</button></div>' +
        '<div class="cal-grid" role="group" aria-labelledby="cal-mes">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(function (x) { return '<div class="cal-dow" aria-hidden="true">' + x + '</div>'; }).join('');
      for (var i = 0; i < lead; i++) h += '<div class="cal-day" aria-hidden="true"></div>';
      for (var d = 1; d <= days; d++) {
        var dt = new Date(y, m, d), av = ok(dt);
        h += '<div class="cal-day"><button type="button" data-d="' + key(dt) + '"' + (av ? '' : ' disabled') + ' aria-pressed="' + (same(dt, chosen) ? 'true' : 'false') + '"' +
          ' aria-label="' + label(dt) + (av ? '' : ', no disponible') + '" tabindex="' + (same(dt, target) ? '0' : '-1') + '"' + (same(dt, today) ? ' class="today"' : '') + '>' + d + '</button></div>';
      }
      cal.innerHTML = h + '</div>';
      if (focus) { var fb = $('.cal-day button[tabindex="0"]', cal); if (fb) fb.focus(); }
    };
    cal.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.classList.contains('cal-prev')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); $('.cal-prev', cal).focus(); return; }
      if (b.classList.contains('cal-next')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); var nx = $('.cal-next', cal); if (nx.disabled) $('.cal-prev', cal).focus(); else nx.focus(); return; }
      var p = b.getAttribute('data-d').split('-');
      chosen = new Date(+p[0], +p[1] - 1, +p[2]); focusD = chosen;
      hid.value = key(chosen);
      cal.classList.remove('is-err');
      var sab = chosen.getDay() === 6;
      tarde.disabled = sab; if (sab) manana.checked = true;
      csel.textContent = 'Has elegido el ' + label(chosen) + (sab ? '. Los sábados abrimos solo por la mañana.' : '.');
      draw(true);
    });
    cal.addEventListener('keydown', function (e) {
      var b = e.target.closest('.cal-day button'); if (!b) return;
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!step) return;
      e.preventDefault();
      var p = b.getAttribute('data-d').split('-'), n = new Date(+p[0], +p[1] - 1, +p[2]);
      for (var i = 0; i < 20; i++) { n.setDate(n.getDate() + step); if (n < minD || n > maxD) return; if (ok(n)) break; }
      if (!ok(n)) return;
      // el foco pasa al día nuevo sin cambiar el día elegido
      focusD = n;
      if (!inView(n)) view = new Date(n.getFullYear(), n.getMonth(), 1);
      draw(true, n);
    });
    draw();
    waForm(fc, ['dia', 'nombre', 'tel', 'acepto'], function (g) {
      return 'Hola, quiero pedir cita en el taller.\nDía: ' + label(chosen) + ', ' + g('franja').toLowerCase() + '\nServicio: ' + g('servicio') +
        '\nNombre: ' + g('nombre') + '\nTeléfono: ' + g('tel') + (g('email') ? '\nEmail: ' + g('email') : '') +
        (g('vehiculo') ? '\nVehículo: ' + g('vehiculo') : '') + (g('matricula') ? '\nMatrícula: ' + g('matricula').toUpperCase() : '') +
        (g('km') ? '\nKilómetros: ' + g('km') : '') + (g('comentario') ? '\nDetalle: ' + g('comentario') : '');
    });
  }

  // ---------- contacto ----------
  waForm($('#form-contacto'), ['nombre', 'tel', 'mensaje', 'acepto'], function (g) {
    return 'Hola Bilbotruck, os escribo desde la web.\nAsunto: ' + g('asunto') + '\nNombre: ' + g('nombre') + '\nTeléfono: ' + g('tel') + (g('email') ? '\nEmail: ' + g('email') : '') + '\n\n' + g('mensaje');
  });
})();
