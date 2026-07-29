(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'cv-theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.setAttribute('aria-label', dark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
      btn.querySelector('.theme-label').textContent = dark ? 'Claro' : 'Escuro';
      btn.querySelector('.icon-sun').hidden = !dark;
      btn.querySelector('.icon-moon').hidden = dark;
    }
  }

  // Restaura a preferência salva antes da primeira pintura útil.
  var saved = stored();
  if (saved === 'dark' || saved === 'light') {
    root.setAttribute('data-theme', saved);
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(currentTheme());

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* modo privado */ }
      });
    }

    var print = document.getElementById('print-btn');
    if (print) {
      print.addEventListener('click', function () { window.print(); });
    }
  });
})();
