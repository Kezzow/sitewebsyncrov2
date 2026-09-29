(function () {
  'use strict';

  /* ---------- Scroll fluide (Lenis) ---------- */
  var lenis = null;
  var lenisTries = 0;
  function initLenis() {
    if (lenis) return;
    if (!window.Lenis) { if (++lenisTries < 100) setTimeout(initLenis, 100); return; }
    try {
      lenis = new window.Lenis({ duration: 1.2, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }

  /* ---------- Liens d'ancre (ex. "Voir la vidéo") ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"][data-scroll]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -72 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- VSL ---------- */
  function initVsl() {
    document.querySelectorAll('[data-vsl]').forEach(function (box) {
      var video = box.querySelector('video');
      var play = box.querySelector('[data-vsl-play]');
      var end = box.querySelector('[data-vsl-end]');
      var replay = box.querySelector('[data-vsl-replay]');
      if (!video || !play) return;

      function start() {
        play.hidden = true;
        if (end) end.hidden = true;
        video.controls = true;
        video.currentTime = video.ended ? 0 : video.currentTime;
        var p = video.play();
        if (p && p.catch) p.catch(function () { play.hidden = false; });
      }
      play.addEventListener('click', start);
      if (replay) replay.addEventListener('click', function () { video.currentTime = 0; start(); });
      video.addEventListener('ended', function () {
        video.controls = false;
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
        if (end) end.hidden = false;
      });
    });
  }

  /* ---------- Simulateur (page Tarifs) ---------- */
  function initSimulator() {
    var range = document.querySelector('[data-sim="range"]');
    if (!range) return;
    var out = {
      volume: document.querySelector('[data-sim="volume"]'),
      time: document.querySelector('[data-sim="time"]'),
      freed: document.querySelector('[data-sim="freed"]')
    };
    function fmt(n) { return n.toFixed(1).replace('.', ','); }
    function update() {
      var v = parseInt(range.value, 10);
      var hours = (v * 5) / 60;
      if (out.volume) out.volume.textContent = v >= 1000 ? '1000+' : String(v);
      if (out.time) out.time.textContent = fmt(hours) + ' h/mois';
      if (out.freed) out.freed.textContent = fmt(hours / 4.345) + ' h/sem';
    }
    range.addEventListener('input', update);
    update();
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-faq-q]'));
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wasOpen = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach(function (b) { setOpen(b, false); });
        if (!wasOpen) setOpen(btn, true);
        if (lenis) lenis.resize();
      });
    });
    function setOpen(btn, open) {
      var item = btn.parentElement;
      var answer = item.querySelector('[data-faq-a]');
      var sym = btn.querySelector('[data-faq-sym]');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (answer) answer.hidden = !open;
      if (sym) sym.textContent = open ? '−' : '+';
    }
  }

  /* ---------- Formulaire de contact ---------- */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var label = form.querySelector('[data-form-label]');
    var button = form.querySelector('button[type="submit"]');
    var errorMsg = form.querySelector('[data-form-error]');
    var invalidMsg = form.querySelector('[data-form-invalid]');
    var modal = document.querySelector('[data-form-success]');
    var confetti = document.querySelector('[data-confetti]');
    var close = document.querySelector('[data-form-close]');

    function setSubmitting(on) {
      button.disabled = on;
      button.style.opacity = on ? '0.6' : '1';
      if (label) label.textContent = on ? 'Envoi en cours...' : 'Envoyer';
    }

    function burst() {
      if (!confetti) return;
      confetti.innerHTML = '';
      var colors = ['#0faa6d', '#35d492', '#006849', '#f3f7f5'];
      for (var i = 0; i < 30; i++) {
        var s = document.createElement('span');
        var size = (5 + Math.random() * 6) + 'px';
        s.style.cssText = 'position:absolute;top:0;left:' + (Math.random() * 100) + '%;width:' + size + ';height:' + size +
          ';background:' + colors[Math.floor(Math.random() * colors.length)] + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') +
          ';animation:confetti-fall ' + (1.2 + Math.random()) + 's ease-in ' + (Math.random() * 0.6) + 's 1 both;';
        confetti.appendChild(s);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      var required = ['nom', 'entreprise', 'email', 'telephone', 'message'];
      var missing = required.some(function (k) { return !data[k] || !String(data[k]).trim(); });
      var badEmail = !data.email || String(data.email).indexOf('@') === -1;
      var badPhone = !data.telephone || String(data.telephone).trim().length < 9;
      errorMsg.hidden = true;
      invalidMsg.hidden = true;
      if (missing || badEmail || badPhone) { invalidMsg.hidden = false; return; }

      setSubmitting(true);
      fetch('https://syncro.servegame.com/webhook/contact-syncro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        setSubmitting(false);
        if (res.ok) {
          form.reset();
          burst();
          modal.hidden = false;
        } else {
          errorMsg.hidden = false;
        }
      }).catch(function () {
        setSubmitting(false);
        errorMsg.hidden = false;
      });
    });

    if (close) close.addEventListener('click', function () { modal.hidden = true; });
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal) modal.hidden = true; });
  }

  function init() {
    document.documentElement.lang = 'fr';
    initLenis();
    initAnchors();
    initVsl();
    initSimulator();
    initFaq();
    initContactForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
