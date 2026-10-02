/* ==========================================================================
   BERNICO — site engine. Vanilla, no dependencies.
   Every module is opt-in: it runs only if its markup is on the page.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ------------------------------------------------------------- OPENER */
  function opener() {
    var op = $("#op");
    if (!op) return;

    // Already seen this visit — the <head> gate hid it, so drop it entirely
    // and never take the scroll lock.
    if (doc.documentElement.classList.contains("no-opener")) {
      op.parentNode.removeChild(op);
      return;
    }

    doc.documentElement.classList.add("lock");

    // Measured from script start, NOT from the load event — otherwise a slow
    // image or video pushes the whole opener out and it just reads as a long
    // black screen. The logo is on screen for essentially all of this.
    var MIN = reduced ? 150 : 3000;
    var t0 = performance.now();
    var closed = false;

    function close() {
      if (closed) return;
      closed = true;
      op.classList.add("out");
      setTimeout(function () {
        op.classList.add("done");
        doc.documentElement.classList.remove("lock");
        scan();
      }, reduced ? 40 : 1250);   // logo fade (.42s) + curtain delay (.3s) + travel (.95s)
    }

    function ready() {
      setTimeout(close, Math.max(0, MIN - (performance.now() - t0)));
    }

    if (doc.readyState === "complete") ready();
    else window.addEventListener("load", ready);
    setTimeout(close, MIN + 2500);   // hard cap — never trap the page
  }

  /* ------------------------------------------------------------- HEADER */
  function header() {
    var hd = $("#hd");
    if (!hd) return;
    var last = window.scrollY, tick = false;

    function run() {
      var y = window.scrollY, d = y - last;
      hd.classList.toggle("solid", y > 20);
      if (!doc.body.classList.contains("menu-on") && Math.abs(d) > 6) {
        if (d > 0 && y > 200) hd.classList.add("up");
        else hd.classList.remove("up");
        last = y;
      }
      tick = false;
    }
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }

  /* --------------------------------------------------------------- MENU */
  function menu() {
    var mnu = $("#mnu"), brg = $("#brg"), hd = $("#hd"), scrim = $("#mnuScrim");
    if (!mnu || !brg) return;

    var figs = $$(".mnu__f img", mnu);
    var fName = $("#mnuFName"), fSub = $("#mnuFSub");
    var open = false;

    function feature(i) {
      if (!figs.length) return;
      figs.forEach(function (im, k) { im.classList.toggle("on", k === i); });
      var f = figs[i];
      if (f && fName) fName.textContent = f.dataset.name || "";
      if (f && fSub) fSub.textContent = f.dataset.sub || "";
    }
    $$("[data-f]", mnu).forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        var i = parseInt(a.dataset.f, 10);
        if (!isNaN(i)) feature(i);
      });
    });

    function set(state) {
      open = typeof state === "boolean" ? state : !open;
      mnu.classList.toggle("open", open);
      if (scrim) scrim.classList.toggle("on", open);
      if (hd) { hd.classList.toggle("open", open); if (open) hd.classList.remove("up"); }
      doc.body.classList.toggle("menu-on", open);
      doc.documentElement.classList.toggle("lock", open);
      brg.setAttribute("aria-expanded", open ? "true" : "false");
      mnu.setAttribute("aria-hidden", open ? "false" : "true");
    }

    brg.addEventListener("click", function () { set(); });
    if (scrim) scrim.addEventListener("click", function () { set(false); });
    $$("a", mnu).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) set(false); });
  }

  /* ------------------------------------------------------------ REVEALS */
  var io = null;
  function reveal() {
    var items = $$("[data-r]");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (e) { io.observe(e); });
  }
  function scan() {
    $$("[data-r]:not(.in)").forEach(function (e) {
      if (e.getBoundingClientRect().top < window.innerHeight * 0.95) e.classList.add("in");
    });
  }

  /* ----------------------------------------------------------- PROGRESS */
  function progress() {
    var bar = $("#prog"), top = $("#top");
    if (!bar && !top) return;
    var tick = false;
    function run() {
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = clamp(h > 0 ? (window.scrollY / h) * 100 : 0, 0, 100) + "%";
      if (top) top.classList.toggle("on", window.scrollY > window.innerHeight);
      tick = false;
    }
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; requestAnimationFrame(run); }
    }, { passive: true });
    if (top) top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    run();
  }

  /* -------------------------------------------------------------- COVER */
  function cover() {
    var root = $("#cov");
    if (!root) return;
    var slides = $$(".cov__s", root);
    var dots = $$(".cov__dot", root);
    var idxEl = $(".cov__idx", root);
    var prev = $(".cov__nav--p", root), next = $(".cov__nav--n", root);
    if (slides.length < 1) return;

    var i = 0, timer = null, DELAY = 6400;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle("on", k === i);
        var v = s.querySelector("video");
        if (v) { if (k === i) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
      });
      dots.forEach(function (d, k) {
        d.classList.remove("on");
        if (k === i) { void d.offsetWidth; d.classList.add("on"); }
      });
      if (idxEl) idxEl.textContent = String(i + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    }
    function auto() {
      if (reduced || slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(function () { show(i + 1); }, DELAY);
    }
    function go(n) { show(n); auto(); }

    if (next) next.addEventListener("click", function () { go(i + 1); });
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });

    var sx = 0;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 46) go(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });

    show(0); auto();
  }

  /* --------------------------------------------------------------- RAIL */
  function rails() {
    $$("[data-rail]").forEach(function (root) {
      var t = $(".rail__t", root);
      if (!t) return;
      var prev = $(".rail__p", root), next = $(".rail__n", root);

      function step() {
        var first = t.firstElementChild;
        if (!first) return 320;
        var gap = parseFloat(getComputedStyle(t).columnGap || getComputedStyle(t).gap) || 16;
        return first.getBoundingClientRect().width + gap;
      }
      function sync() {
        if (prev) prev.disabled = t.scrollLeft < 6;
        if (next) next.disabled = t.scrollLeft > t.scrollWidth - t.clientWidth - 6;
      }
      if (next) next.addEventListener("click", function () { t.scrollBy({ left: step(), behavior: "smooth" }); });
      if (prev) prev.addEventListener("click", function () { t.scrollBy({ left: -step(), behavior: "smooth" }); });
      t.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
      sync();

      // Pointer drag
      var down = false, startX = 0, startL = 0, moved = 0;
      t.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") return;
        down = true; moved = 0;
        startX = e.clientX; startL = t.scrollLeft;
        t.classList.add("drag");
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var d = e.clientX - startX;
        moved = Math.abs(d);
        t.scrollLeft = startL - d;
      });
      window.addEventListener("pointerup", function () {
        if (!down) return;
        down = false;
        t.classList.remove("drag");
      });
      t.addEventListener("click", function (e) {
        if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  }

  /* ------------------------------------------------------------- FILTER */
  function filters() {
    var bar = $("#fbar");
    if (!bar) return;
    var btns = $$("button", bar), items = $$("[data-cat]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.filter;
        btns.forEach(function (x) { x.classList.toggle("on", x === b); });
        items.forEach(function (c) {
          c.classList.toggle("hide", !(f === "all" || c.dataset.cat.split(" ").indexOf(f) > -1));
        });
      });
    });
  }

  /* --------------------------------------------------------- VIDEO CARD */
  function videoCards() {
    $$(".vc").forEach(function (card) {
      var v = $("video", card), cur = $(".vc__cur", card);
      card.addEventListener("pointermove", function (e) {
        if (!cur) return;
        var r = card.getBoundingClientRect();
        cur.style.left = (e.clientX - r.left) + "px";
        cur.style.top = (e.clientY - r.top) + "px";
      });
      card.addEventListener("mouseenter", function () {
        if (!v) return;
        card.classList.add("play");
        v.currentTime = 0;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
      card.addEventListener("mouseleave", function () {
        if (!v) return;
        card.classList.remove("play");
        v.pause(); v.currentTime = 0;
      });
    });
  }

  /* ------------------------------------------------------------- TYPING */
  function typing() {
    var el = $("[data-typing]");
    if (!el) return;
    var words;
    try { words = JSON.parse(el.dataset.typing); } catch (e) { return; }
    if (!words || !words.length) return;
    if (reduced) { el.placeholder = words[0]; return; }

    var w = 0, i = 0, del = false;
    (function loop() {
      var word = words[w];
      if (!del) { el.placeholder = word.substring(0, i++); if (i > word.length + 14) del = true; }
      else { el.placeholder = word.substring(0, i--); if (i < 1) { del = false; w = (w + 1) % words.length; i = 0; } }
      setTimeout(loop, del ? 30 : 68);
    })();
  }

  /* ----------------------------------------------------------- PARALLAX */
  /* One rAF loop for every [data-px] on the page. Transform only — no layout,
     no paint. Elements outside the viewport are skipped. */
  function parallax() {
    var els = $$("[data-px]");
    if (!els.length || reduced) return;

    var items = els.map(function (el) {
      return { el: el, speed: parseFloat(el.dataset.px) || 0.14 };
    });
    var tick = false;

    function run() {
      var vh = window.innerHeight;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) continue;
        // -1 while the element is below the fold, +1 once it has passed above
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        var y = -clamp(p, -1.4, 1.4) * it.speed * 100;
        it.el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
      }
      tick = false;
    }
    function req() { if (!tick) { tick = true; requestAnimationFrame(run); } }

    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    run();
  }

  /* -------------------------------------------------------- SPEC TOGGLE */
  /* Hulls offered in both racing and leisure trim carry two spec panels. */
  function toggles() {
    $$("[data-tog]").forEach(function (root) {
      var btns = $$("button", root);
      // Scope to the panels only — the buttons carry data-trim too.
      var panels = $$(".tog-panel", root.parentNode);
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.classList.toggle("on", x === b); });
          panels.forEach(function (p) { p.hidden = p.dataset.trim !== b.dataset.trim; });
        });
      });
    });
  }

  /* -------------------------------------------------------------- FORMS */
  function forms() {
    $$("form[data-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        var msg = $(".msg", f), btn = f.querySelector("[type=submit]");
        if (btn) { btn.disabled = true; btn.style.opacity = ".55"; }
        setTimeout(function () {
          f.reset();
          if (btn) { btn.disabled = false; btn.style.opacity = ""; }
          if (msg) {
            msg.textContent = msg.dataset.ok || "Thank you — we will be in touch.";
            msg.classList.add("on");
            setTimeout(function () { msg.classList.remove("on"); }, 6000);
          }
        }, 600);
      });
    });
  }

  /* ------------------------------------------------------------ ANCHORS */
  function anchors() {
    $$('a[href^="#"]:not([href="#"])').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = doc.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        var h = parseInt(getComputedStyle(doc.documentElement).getPropertyValue("--hd"), 10) || 64;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - h, behavior: reduced ? "auto" : "smooth" });
      });
    });
  }

  /* --------------------------------------------------------- ACTIVE NAV */
  function activeNav() {
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase().replace(/\.html$/, "") || "index";
    $$("[data-page]").forEach(function (a) {
      if (a.dataset.page.toLowerCase().replace(/\.html$/, "") === page) a.classList.add("on");
    });
  }

  /* ------------------------------------------------------------- VIDEOS */
  function videos() {
    $$("video[autoplay]").forEach(function (v) {
      v.muted = true;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    $$("video[data-loop-at]").forEach(function (v) {
      var at = parseFloat(v.dataset.loopAt);
      v.addEventListener("timeupdate", function () {
        if (v.currentTime >= at) { v.currentTime = 0; v.play(); }
      });
    });
  }

  function boot() {
    opener(); header(); menu(); reveal(); progress(); cover(); rails();
    filters(); videoCards(); typing(); forms(); anchors(); activeNav(); videos();
    parallax(); toggles();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
