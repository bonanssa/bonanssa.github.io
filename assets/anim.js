/* ============================================================
   Animações - GSAP + ScrollTrigger

   Progressive enhancement: se o GSAP não carregar (CDN bloqueado,
   offline), a página continua 100% legível. Nenhum estado inicial
   fica no CSS - só o JS esconde, e só quando vai animar.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var animated = [];

  /* ---------- Impressão: desfaz qualquer estado intermediário ---------- */

  function revealAll() {
    if (hasGsap) {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      }
      window.gsap.killTweensOf(animated);
      window.gsap.set(animated, { clearProps: 'all' });
    }
    document.querySelectorAll('[data-tl]').forEach(function (tl) {
      tl.style.setProperty('--tl-progress', '100%');
    });
  }

  window.addEventListener('beforeprint', revealAll);
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    if (mq.addEventListener) {
      mq.addEventListener('change', function (e) { if (e.matches) { revealAll(); } });
    }
  }

  /* ---------- Sem GSAP ou com movimento reduzido: para por aqui ---------- */

  if (!hasGsap || reduced) { return; }

  var gsap = window.gsap;
  if (window.ScrollTrigger) { gsap.registerPlugin(window.ScrollTrigger); }

  function collect(sel) {
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    animated = animated.concat(els);
    return els;
  }

  var photo = collect('[data-anim="photo"]');
  var names = collect('[data-anim="name"]');
  var sideBlocks = collect('[data-anim="side"]');
  var secs = collect('[data-anim="sec"]');
  var items = collect('[data-anim="item"]');
  var brands = collect('[data-anim="brand"]');
  var wins = collect('[data-anim="win"]');

  // Entram no array de limpeza para que o failsafe/impressão os restaure também.
  var sideEl = collect('.side');
  var toolbarBtns = collect('.toolbar .btn');

  /* ---------- Entrada ---------- */

  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  intro
    .from(sideEl, { xPercent: -100, duration: .9, ease: 'power4.out' })
    .from(photo, { scale: .55, opacity: 0, duration: .8, ease: 'back.out(1.6)' }, '-=.45')
    .from(names, { y: 22, opacity: 0, duration: .6, stagger: .1 }, '-=.5')
    .from(sideBlocks, { x: -18, opacity: 0, duration: .5, stagger: .09 }, '-=.35')
    .from(toolbarBtns, { y: -14, opacity: 0, duration: .45, stagger: .07 }, '-=.7');

  /* Failsafe: animação é enfeite, conteúdo é obrigação. Se a intro não
     terminar no prazo (aba em segundo plano, rAF estrangulado, GSAP a
     meio carregar), joga tudo para o estado final e desiste do efeito. */
  var WATCHDOG_MS = 4000;

  function hiddenInViewport() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return animated.some(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { return false; }
      return parseFloat(getComputedStyle(el).opacity) < .9;
    });
  }

  function watchdog() {
    if (document.visibilityState !== 'visible') {
      // rAF está pausado pelo navegador: não é travamento. Reavalia na volta.
      document.addEventListener('visibilitychange', function once() {
        document.removeEventListener('visibilitychange', once);
        setTimeout(watchdog, WATCHDOG_MS);
      });
      return;
    }
    if (intro.progress() < 1) { revealAll(); return; }
    // A intro terminou, mas algum elemento já dentro da janela pode ter
    // ficado preso em opacity 0 (ScrollTrigger travado). Nesse caso desiste.
    if (hiddenInViewport()) { revealAll(); }
  }

  setTimeout(watchdog, WATCHDOG_MS);

  /* ---------- Revelação por scroll ---------- */

  if (!window.ScrollTrigger) { return; }

  // Cabeçalhos de seção
  secs.forEach(function (sec) {
    var parts = Array.prototype.slice.call(
      sec.querySelectorAll('.sec-head .ico, .sec-head h2, .sec-head .rule'));
    animated = animated.concat(parts);
    gsap.from(parts, {
      scrollTrigger: { trigger: sec, start: 'top 88%' },
      x: -20, opacity: 0, duration: .55, stagger: .08, ease: 'power2.out'
    });
  });

  // Itens da timeline e card do projeto
  items.forEach(function (item) {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 90%' },
      y: 26, opacity: 0, duration: .6, ease: 'power2.out'
    });
  });

  // Linha da timeline preenchendo conforme o scroll
  document.querySelectorAll('[data-tl]').forEach(function (tl) {
    gsap.to(tl, {
      scrollTrigger: { trigger: tl, start: 'top 80%', end: 'bottom 65%', scrub: .6 },
      '--tl-progress': '100%', ease: 'none'
    });
  });

  // Principais realizações
  if (wins.length) {
    gsap.from(wins, {
      scrollTrigger: { trigger: wins[0], start: 'top 90%' },
      x: -16, opacity: 0, duration: .5, stagger: .07, ease: 'power2.out'
    });
  }

  // Chips de marcas
  gsap.from(brands, {
    scrollTrigger: { trigger: '.brands', start: 'top 88%' },
    scale: .8, opacity: 0, duration: .45, stagger: .035, ease: 'back.out(1.8)'
  });
})();
