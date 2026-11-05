/* Bilbotruck · lógica común: tarjetas, catálogo con filtros y ficha con galería */
(function () {
  'use strict';
  var ALL = window.STOCK || [];
  var S = ALL.filter(function (v) { return !v.oculto; });
  var WA = '34687953751';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var CATS = { camion: 'Camiones y carrozados', furgoneta: 'Furgonetas', pickup: 'Pick-up', turismo: 'Turismos y SUV' };
  var ICO = {
    cam: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    l: '<path d="m15 18-6-6 6-6"/>', r: '<path d="m9 18 6-6-6-6"/>',
    zoom: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>'
  };
  var ico = function (n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICO[n] + '</svg>'; };
  var WA_ICO = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm5.8 14.1c-.25.7-1.44 1.33-2 1.38-.52.05-1 .24-3.38-.7-2.85-1.12-4.65-4.04-4.79-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35l.53.01c.17 0 .4-.06.62.48.25.6.84 2.05.91 2.2.07.14.12.31.02.5-.1.19-.14.31-.28.48l-.42.49c-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.7-.82.89-1.1.19-.28.37-.23.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.18 1.38z"/></svg>';

  var nombre = function (v) { return v.marca + ' ' + v.modelo; };
  var final = function (v) { return v.iva ? v.precio : v.precio * 1.21; };
  var kmTxt = function (v) { return v.nuevo ? '0 km' : fmt(v.km) + ' km'; };
  var garTxt = function (m) { return !m ? null : m % 12 === 0 && m >= 24 ? (m / 12) + ' años' : m + ' meses'; };
  var precioTxt = function (v) { return fmt(v.precio) + ' €' + (v.iva ? '' : ' + IVA'); };

  function badge(v) {
    if (v.nuevo && v.garantia >= 60) return '<span class="badge red">Nuevo</span>';
    if (v.nuevo) return '<span class="badge red">KM 0</span>';
    if (v.ayto) return '<span class="badge blue">Ex-ayuntamiento</span>';
    if (v.garantia && v.garantia >= 12) return '<span class="badge">Garantía ' + garTxt(v.garantia) + '</span>';
    return '';
  }
  function card(v) {
    var specs = [v.anio, kmTxt(v)];
    if (v.cv) specs.push(v.cv + ' CV'); else if (v.comb) specs.push(v.comb);
    return '<article class="card"><a href="vehiculo.html?id=' + v.id + '">' +
      '<div class="card-img"><img src="assets/stock/' + v.id + '-card.jpg" width="480" height="360" alt="' + esc(nombre(v) + ', ' + v.carroceria.toLowerCase() + ' de ' + v.anio) + '" loading="lazy">' +
      badge(v) + '<span class="card-fotos">' + ico('cam') + v.fotos + '</span></div>' +
      '<div class="card-body"><p class="card-cat">' + esc(v.carroceria) + '</p>' +
      '<h3>' + esc(nombre(v)) + '</h3><p class="card-ver">' + esc(v.version) + '</p>' +
      '<ul class="card-specs">' + specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="card-price"><b>' + fmt(v.precio) + ' €</b><span>' + (v.iva ? 'IVA incluido' : '+ IVA') + '</span></div>' +
      '</div></a></article>';
  }

  // ---------- común ----------
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var page = document.body.getAttribute('data-page');

  // ---------- portada ----------
  if (page === 'home') {
    var DEST = ['71712048', '71750009', '71799527', '71743747', '71743659', '71376593', '71712586', '71710105'];
    var box = $('#destacados');
    if (box) box.innerHTML = DEST.map(function (id) { return S.find(function (v) { return v.id === id; }); }).filter(Boolean).map(card).join('');
    var f = $('#form-cita');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { return (f.elements[n].value || '').trim(); };
      var bad = ['nombre', 'tel'].filter(function (n) { return !g(n); });
      $$('input', f).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      if (bad.length) {
        bad.forEach(function (n) { f.elements[n].setAttribute('aria-invalid', 'true'); });
        f.elements[bad[0]].focus();
        $('#cita-msg').textContent = 'Falta tu ' + (bad[0] === 'nombre' ? 'nombre' : 'teléfono') + ' para poder llamarte.';
        return;
      }
      var dia = g('dia') ? new Date(g('dia') + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
      var t = 'Hola, quiero pedir cita en el taller.\n' +
        'Nombre: ' + g('nombre') + '\nTeléfono: ' + g('tel') +
        (g('vehiculo') ? '\nVehículo: ' + g('vehiculo') : '') + (g('matricula') ? '\nMatrícula: ' + g('matricula').toUpperCase() : '') +
        '\nServicio: ' + g('servicio') + (dia ? '\nDía preferido: ' + dia : '') + (g('comentario') ? '\nDetalle: ' + g('comentario') : '');
      window.open(wa(t), '_blank', 'noopener');
      $('#cita-msg').textContent = 'Listo. Envía el mensaje en WhatsApp y te confirmamos la cita.';
    });
  }

  // ---------- catálogo ----------
  if (page === 'stock') {
    var qs = new URLSearchParams(location.search);
    var st = { cat: qs.get('cat') || '', serie: qs.get('serie') || '', q: qs.get('q') || '', marca: '', pmax: '', anio: '', orden: 'dest' };
    var el = { cats: $('#cats'), q: $('#f-q'), marca: $('#f-marca'), pmax: $('#f-precio'), anio: $('#f-anio'), orden: $('#f-orden'), res: $('#results'), count: $('#count'), reset: $('#reset') };
    var SERIES = { dmax: 'Isuzu D-Max', N: 'Isuzu Serie N', F: 'Isuzu Serie F' };
    var marcas = S.map(function (v) { return v.marca; }).filter(function (m, i, a) { return a.indexOf(m) === i; }).sort();
    el.marca.innerHTML += marcas.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
    el.q.value = st.q;

    var drawCats = function () {
      var opts = [['', 'Todos', S.length]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k], S.filter(function (v) { return v.cat === k; }).length]; }));
      if (st.serie) opts.push(['serie', SERIES[st.serie] || 'Serie', S.filter(function (v) { return v.serie === st.serie; }).length]);
      el.cats.innerHTML = opts.map(function (o) {
        var on = o[0] === 'serie' ? true : (!st.serie && st.cat === o[0]);
        return '<button type="button" data-cat="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + ' <span>' + o[2] + '</span></button>';
      }).join('');
    };
    var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    var render = function () {
      var q = norm(st.q.trim());
      var list = S.filter(function (v) {
        if (st.serie) { if (v.serie !== st.serie) return false; }
        else if (st.cat && v.cat !== st.cat) return false;
        if (st.marca && v.marca !== st.marca) return false;
        if (st.pmax && final(v) > +st.pmax) return false;
        if (st.anio && v.anio < +st.anio) return false;
        if (q) {
          var hay = norm([v.marca, v.modelo, v.version, v.carroceria, v.comb, CATS[v.cat], (v.desc || []).join(' ')].join(' '));
          if (/pluma|grua|pulpo/.test(hay)) hay += ' grua pluma';
          if (/basculante|volquete/.test(hay)) hay += ' basculante volquete';
          if (!q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; })) return false;
        }
        return true;
      });
      var o = st.orden;
      list.sort(function (a, b) {
        if (o === 'pa') return final(a) - final(b);
        if (o === 'pd') return final(b) - final(a);
        if (o === 'km') return a.km - b.km;
        if (o === 'an') return b.anio - a.anio || a.km - b.km;
        if (o === 'dest') { var R = { camion: 0, pickup: 1, furgoneta: 2, turismo: 3 }; return R[a.cat] - R[b.cat] || b.pub.localeCompare(a.pub); }
        return b.pub.localeCompare(a.pub);
      });
      el.count.textContent = list.length === 1 ? '1 vehículo' : list.length + ' vehículos';
      el.reset.hidden = !(st.cat || st.serie || st.q || st.marca || st.pmax || st.anio);
      el.res.innerHTML = list.length ? list.map(card).join('') :
        '<div class="empty" style="grid-column:1/-1"><h2>Ahora mismo no hay ninguno así</h2><p>Prueba a quitar algún filtro o <a href="' + wa('Hola, busco un vehículo que no encuentro en la web: ') + '" target="_blank" rel="noopener">dinos qué buscas por WhatsApp</a>.</p></div>';
      var p = new URLSearchParams();
      if (st.serie) p.set('serie', st.serie); else if (st.cat) p.set('cat', st.cat);
      if (st.q) p.set('q', st.q);
      history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    };
    el.cats.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var c = b.getAttribute('data-cat');
      if (c === 'serie') return;
      st.serie = ''; st.cat = c; drawCats(); render();
    });
    var t;
    el.q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = el.q.value; render(); }, 150); });
    ['marca', 'pmax', 'anio', 'orden'].forEach(function (k) { el[k].addEventListener('change', function () { st[k] = el[k].value; render(); }); });
    el.reset.addEventListener('click', function () {
      st = { cat: '', serie: '', q: '', marca: '', pmax: '', anio: '', orden: st.orden };
      el.q.value = ''; el.marca.value = ''; el.pmax.value = ''; el.anio.value = '';
      drawCats(); render();
    });
    drawCats(); render();
  }

  // ---------- ficha ----------
  if (page === 'ficha') {
    var id = new URLSearchParams(location.search).get('id');
    var v = ALL.find(function (x) { return x.id === id; });
    var root = $('#ficha');
    if (!v) {
      root.innerHTML = '<div class="notfound"><h1>Este vehículo ya no está</h1><p>Es posible que se haya vendido. Echa un vistazo al resto del stock.</p><p style="margin-top:20px"><a class="btn btn-red" href="stock.html">Ver vehículos disponibles</a></p></div>';
      return;
    }
    document.title = nombre(v) + ' (' + v.anio + ') · ' + precioTxt(v) + ' · Bilbotruck';
    var imgs = []; for (var k = 1; k <= v.fotos; k++) imgs.push('assets/stock/' + v.id + '-' + k + '.jpg');
    var rows = [
      ['Marca', v.marca], ['Modelo', v.modelo], ['Versión', v.version], ['Carrocería', v.carroceria],
      ['Año', v.anio], ['Kilómetros', v.nuevo ? '0 km (nuevo)' : fmt(v.km) + ' km'],
      ['Potencia', v.cv ? v.cv + ' CV' : null], ['Cilindrada', v.cc ? v.cc + ' cm³' : null],
      ['Combustible', v.comb], ['Cambio', v.cambio], ['MMA', v.mma], ['Plazas', v.plazas],
      ['Caja interior', v.medidas], ['Horas de trabajo', v.horas], ['Etiqueta DGT', v.etiqueta],
      ['Garantía', garTxt(v.garantia)], ['Precio sin IVA', v.iva ? null : fmt(v.precio) + ' €'], ['Precio con IVA', fmt(final(v)) + ' €'],
      ['Dónde verlo', 'Bedia (Bizkaia)']
    ].filter(function (r) { return r[1] !== null && r[1] !== undefined && r[1] !== ''; });
    var keys = [['Año', v.anio], ['Km', v.nuevo ? '0' : fmt(v.km)], v.cv ? ['Potencia', v.cv + ' CV'] : ['Combustible', v.comb || '-']];
    var trust = [];
    if (v.incluye && v.incluye.length) trust.push('Incluye ' + v.incluye.map(function (x) { return x === 'ITV' ? x : x.charAt(0).toLowerCase() + x.slice(1); }).join(', ').replace(/, ([^,]*)$/, ' y $1'));
    else trust.push('Revisado en nuestro taller oficial Isuzu');
    if (v.garantia) trust.push('Garantía de ' + garTxt(v.garantia));
    if (v.unico) trust.push('Único dueño: viene de nuestra propia flota');
    trust.push('Puedes verlo en Bedia de lunes a sábado');
    var msg = 'Hola, me interesa el ' + nombre(v) + ' (' + v.anio + ', ' + precioTxt(v) + ') que tenéis en la web. ¿Sigue disponible?';
    var rel = S.filter(function (x) { return x.cat === v.cat && x.id !== v.id; })
      .sort(function (a, b) { return Math.abs(final(a) - final(v)) - Math.abs(final(b) - final(v)); }).slice(0, 4);

    root.innerHTML =
      '<a class="back" href="stock.html' + (v.cat ? '?cat=' + v.cat : '') + '">' + ico('back') + ' Volver al stock</a>' +
      '<div class="ficha-grid">' +
        '<div>' +
          '<div class="gal-main" id="gal"><img id="gal-img" src="' + imgs[0] + '" width="800" height="600" alt="' + esc(nombre(v)) + ', foto 1 de ' + imgs.length + '">' +
            (imgs.length > 1 ? '<button class="gal-nav l" type="button" aria-label="Foto anterior">' + ico('l') + '</button><button class="gal-nav r" type="button" aria-label="Foto siguiente">' + ico('r') + '</button>' : '') +
            '<button class="gal-zoom" type="button">' + ico('zoom') + ' Ampliar</button>' +
            '<span class="gal-count" aria-live="polite"><b>1</b> / ' + imgs.length + '</span></div>' +
          (imgs.length > 1 ? '<div class="gal-thumbs">' + imgs.map(function (src, i) { return '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"' + (i ? '' : ' aria-current="true"') + '><img src="' + src + '" alt="" loading="lazy" width="160" height="120"></button>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<aside class="panel" aria-label="Precio y contacto">' +
          '<p class="p-cat">' + esc(v.carroceria) + (v.nuevo ? ' · ' + (v.garantia >= 60 ? 'Nuevo' : 'KM 0') : '') + '</p>' +
          '<h1>' + esc(nombre(v)) + '</h1><p class="p-ver">' + esc(v.version) + '</p>' +
          '<div class="p-price"><div class="big">' + fmt(v.precio) + ' €' + (v.iva ? '' : '<small>+ IVA</small>') + '</div>' +
            '<p class="iva">' + (v.iva ? 'IVA incluido' : fmt(final(v)) + ' € con IVA incluido') + '</p></div>' +
          '<div class="p-keys">' + keys.map(function (k) { return '<div><b>' + esc(k[1]) + '</b><span>' + k[0] + '</span></div>'; }).join('') + '</div>' +
          '<div class="p-actions">' +
            '<a class="btn btn-wa btn-full" href="' + wa(msg) + '" target="_blank" rel="noopener">' + WA_ICO + ' ¿Sigue disponible?</a>' +
            '<a class="btn btn-line btn-full" href="tel:+34687953751">' + ico('phone') + ' Llamar al 687 95 37 51</a>' +
          '</div>' +
          '<ul class="p-trust">' + trust.map(function (t) { return '<li>' + ico('check') + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul>' +
        '</aside>' +
      '</div>' +
      '<section class="ficha-sec" aria-labelledby="t-datos"><h2 id="t-datos">Datos del vehículo</h2><dl class="specs">' +
        rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></section>' +
      (v.desc && v.desc.length ? '<section class="ficha-sec" aria-labelledby="t-desc"><h2 id="t-desc">Lo que te contamos</h2><ul class="desc-list">' +
        v.desc.map(function (d) { return '<li>' + ico('check') + '<span>' + esc(d) + '</span></li>'; }).join('') + '</ul></section>' : '') +
      (rel.length ? '<section class="ficha-sec" aria-labelledby="t-rel"><h2 id="t-rel">También te puede interesar</h2><div class="grid-cards">' + rel.map(card).join('') + '</div></section>' : '');

    // galería
    var cur = 0, gimg = $('#gal-img'), cnt = $('.gal-count b'), thumbs = $$('.gal-thumbs button');
    var lb = $('#lb'), lbImg = $('img', lb), lbN = $('.n', lb), lastFocus = null;
    var show = function (i) {
      cur = (i + imgs.length) % imgs.length;
      gimg.src = imgs[cur]; gimg.alt = nombre(v) + ', foto ' + (cur + 1) + ' de ' + imgs.length;
      cnt.textContent = cur + 1;
      thumbs.forEach(function (b, j) { if (j === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (thumbs[cur]) { var tb = thumbs[cur], p = tb.parentNode; if (tb.offsetTop > p.offsetTop + p.clientHeight) tb.scrollIntoView({ block: 'nearest' }); }
      if (lb.classList.contains('open')) { lbImg.src = imgs[cur]; lbImg.alt = gimg.alt; lbN.textContent = (cur + 1) + ' / ' + imgs.length; }
    };
    var openLb = function () { lastFocus = document.activeElement; lb.classList.add('open'); show(cur); document.body.style.overflow = 'hidden'; $('.x', lb).focus(); };
    var closeLb = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    var gl = $('.gal-nav.l'), gr = $('.gal-nav.r');
    if (gl) gl.addEventListener('click', function () { show(cur - 1); });
    if (gr) gr.addEventListener('click', function () { show(cur + 1); });
    thumbs.forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-i')); }); });
    gimg.addEventListener('click', openLb);
    $('.gal-zoom').addEventListener('click', openLb);
    $('.x', lb).addEventListener('click', closeLb);
    $('.l', lb).addEventListener('click', function () { show(cur - 1); });
    $('.r', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'Tab') { var f = $$('button', lb), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    var x0 = null;
    [$('#gal'), lb].forEach(function (zone) {
      zone.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      zone.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; }, { passive: true });
    });
    imgs.slice(1, 3).forEach(function (s) { var im = new Image(); im.src = s; });
  }
})();
