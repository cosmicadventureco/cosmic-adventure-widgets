/*!
 * Cosmic Events widget, shared by yogainzion.com and Zion Canyon Light.
 * One file draws: the timed popup, the inline card (anywhere you put
 * <div data-cosmic-embed></div>) and the floating "Book here!" button.
 *
 * Which site's look is used comes from the script tag:
 *   <script src=".../cosmic.js" data-site="yoga" defer></script>
 *   <script src=".../cosmic.js" data-site="zcl" defer></script>
 *
 * To update both sites: edit EVENTS / SHARED below and deploy.
 */
(function () {
  'use strict';

  /* ============ EDIT CONTENT HERE (shown on BOTH sites) ============ */

  // Each event disappears by itself after its hideAfter date (YYYY-MM-DD, local time).
  // Leave hideAfter out to keep an event up until you remove it.
  var EVENTS = [
    {
      dates: 'Sept – Feb',
      name: 'See The Rings of Saturn!',
      desc: "Don't miss the chance to view Saturn's stunning rings! The best view we have until next year.",
      hideAfter: '2027-02-28'
    },
    {
      dates: 'November 6 – 30',
      name: 'Leonid Meteor Shower',
      desc: 'About 15 swift, bright meteors per hour. Peak viewing Nov 17 – 18.',
      hideAfter: '2026-11-30'
    },
    {
      dates: 'Dec 4 – 17',
      name: 'Geminid Meteor Shower',
      desc: 'Can produce up to 120 multicolored meteors per hour at its peak. Peak viewing Dec 13 – 14.',
      hideAfter: '2026-12-17'
    }
  ];

  var SHARED = {
    eyebrow: 'Zion Canyon · 2026',
    title: 'Upcoming Stargazing<br>Events in Zion!',
    callout: "Worried about Stargazing in chilly weather? We'll keep you cozy with Heated Vests &amp; Blankets!",
    subtitle: 'As a certified International Dark Sky Park, Zion has some of the darkest skies in North America. These cosmic events should not be missed!'
  };

  /* ================= PER-SITE SETTINGS ================= */
  // Anything in a site's `content` replaces the SHARED value on that site only.
  var SITES = {
    yoga: {
      content: { footer: 'Cosmic Adventure Co · Zion, Utah' },
      theme: {
        card: '#9e8e80', maxWidth: '440px', skyHeight: '120px', skyHeightSmall: '104px',
        pad: '38px', titleSize: '22px', dateSize: '18px', shadow: 'none',
        overlay: 'rgba(10,11,13,.72)',
        book: '#9C8B7E', bookHover: '#87796d', bookShadow: 'rgba(0,0,0,.2)'
      },
      popup: {
        enabled: true,
        delayMs: 10000,
        cooldownHours: 24,
        cooldownStartsWhen: 'shown',   // 'shown' or 'closed'
        closeButton: 'circle',         // 'circle' (round ×) or 'text' ("✕ close")
        fit: 'scroll',                 // 'scroll' inside the card, or 'scale' the card down to fit
        ctaText: 'Find out more here!',
        ctaUrl: 'https://www.yogainzion.com/stargazing-in-zion'
      },
      inline: {
        ctaText: 'Book your stargazing tour!',
        ctaUrl: 'https://yogainzion.com/book',
        matchText: 'stargazing calendar',
        matchSelector: '#zmc-wrap'   // the Stargazing Calendar's outer box
      },
      bookButton: { enabled: true, text: 'Book here!', url: 'https://yogainzion.com/book', hideOnPathsContaining: ['/book'] }
    },

    zcl: {
      content: { footer: 'Zion Canyon Light · Zion, Utah' },
      theme: {
        card: '#34363c', maxWidth: '420px', skyHeight: '104px', skyHeightSmall: '96px',
        pad: '32px', titleSize: '21px', dateSize: '17px', shadow: '0 20px 70px rgba(0,0,0,.4)',
        overlay: 'rgba(0,0,0,.55)',
        book: '#2B2B2B', bookHover: '#1a1a1a', bookShadow: 'rgba(0,0,0,.3)'
      },
      popup: {
        enabled: true,
        delayMs: 10000,
        cooldownHours: 24 * 7,
        cooldownStartsWhen: 'closed',
        closeButton: 'text',
        fit: 'scale',
        ctaText: 'Find out more here!',
        ctaUrl: 'https://www.yogainzion.com/stargazing-in-zion'
      },
      inline: {
        ctaText: 'Book your stargazing tour!',
        ctaUrl: 'https://yogainzion.com/book',
        // Match the width/height of another card when side by side. Finds the card containing
        // matchText, or use matchSelector (a CSS selector) to point at it directly.
        matchText: 'stargazing calendar',
        matchSelector: '#zmc-wrap'   // the Stargazing Calendar's outer box
      },
      bookButton: { enabled: true, text: 'Book here!', url: 'https://yogainzion.com/book', hideOnPathsContaining: ['/book'] }
    }
  };
  /* ================== END OF EDITABLE CONTENT ================== */


  var scriptTag = document.currentScript;
  var siteKey = (scriptTag && scriptTag.getAttribute('data-site')) || 'yoga';
  var SITE = SITES[siteKey] || SITES.yoga;

  var flag = '__cosmicWidgetLoaded';
  if (window[flag]) return;
  window[flag] = true;

  var CONTENT = {};
  [SHARED, SITE.content || {}].forEach(function (o) { for (var k in o) CONTENT[k] = o[k]; });

  var STORAGE_KEY = 'cosmicPopupLastShown';

  var CSS = [
    /* Card (shared by popup and inline). Theme values come from --cw-* variables. */
    '.cw-card{background:var(--cw-card);width:100%;max-width:var(--cw-max);margin:0 auto;position:relative;overflow:hidden;font-family:"Montserrat",sans-serif;box-sizing:border-box;text-align:center}',
    '.cw-card *,.cw-card *::before,.cw-card *::after{box-sizing:border-box}',
    '.cw-sky{position:relative;height:var(--cw-sky);overflow:hidden;background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.10),transparent 45%),radial-gradient(circle at 78% 65%,rgba(255,255,255,.08),transparent 40%),linear-gradient(160deg,#0a0b0d 0%,#1d1e22 100%)}',
    '.cw-dot{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;opacity:.7;animation:cw-twinkle 3s infinite ease-in-out}',
    '.cw-dot.sm{width:1.5px;height:1.5px}',
    '@keyframes cw-twinkle{0%,100%{opacity:.25}50%{opacity:.9}}',
    '.cw-shoot{position:absolute;left:-10%;width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.8));opacity:0}',
    '.cw-shoot.one{top:22%;transform:rotate(12deg);animation:cw-shoot 7s infinite ease-in}',
    '.cw-shoot.two{top:55%;width:48px;transform:rotate(18deg);animation:cw-shoot 9s infinite ease-in 3.5s}',
    '.cw-shoot.three{top:38%;width:54px;transform:rotate(8deg);animation:cw-shoot 11s infinite ease-in 6.5s}',
    '@keyframes cw-shoot{0%{left:-10%;opacity:0}6%{opacity:1}16%{left:80%;opacity:0}100%{left:80%;opacity:0}}',
    '.cw-sky-title{position:absolute;bottom:calc(var(--cw-pad) / 2.2);left:var(--cw-pad);right:var(--cw-pad);text-align:center}',
    '.cw-card .cw-eyebrow{font-size:9px;font-weight:600;letter-spacing:.35em;text-transform:uppercase;color:rgba(255,255,255,.7);margin:0 0 8px!important;line-height:1.4}',
    '.cw-card .cw-title{font-family:"Montserrat",sans-serif!important;font-size:var(--cw-title)!important;font-weight:700!important;color:#fff!important;line-height:1.25!important;letter-spacing:.03em!important;text-transform:none!important;margin:0!important;padding:0!important}',
    '.cw-body{padding:20px var(--cw-pad) 22px}',
    '.cw-inline{display:flex;flex-direction:column}.cw-inline .cw-sky{flex:none}.cw-inline .cw-body{flex:1;display:flex;flex-direction:column;justify-content:center}',
    '.cw-card .cw-callout{background:#fff;color:var(--cw-card);padding:12px 16px;margin:0 0 14px!important;font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;line-height:1.5}',
    '.cw-card .cw-subtitle{font-size:11.5px;font-weight:300;color:rgba(255,255,255,.82);line-height:1.7;letter-spacing:.02em;margin:0 0 18px!important}',
    '.cw-card .cw-events{list-style:none!important;display:flex;flex-direction:column;margin:0 0 20px!important;padding:0!important}',
    '.cw-card .cw-event{list-style:none!important;margin:0!important;padding:11px 0!important;border-bottom:1px solid rgba(255,255,255,.14)}',
    '.cw-card .cw-event::before,.cw-card .cw-event::marker{content:none!important;display:none!important}',
    '.cw-card .cw-event:first-child{border-top:1px solid rgba(255,255,255,.14)}',
    '.cw-star{font-size:15px;color:rgba(255,255,255,.65);margin:0 8px}',
    '.cw-card .cw-date{font-size:var(--cw-date);font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#fff;margin:0 0 4px!important;line-height:1.2}',
    '.cw-card .cw-name{font-size:12.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.92);margin:0 0 5px!important;line-height:1.35}',
    '.cw-card .cw-desc{font-size:11px;font-weight:300;color:rgba(255,255,255,.78);line-height:1.6;letter-spacing:.02em;margin:0 auto!important;padding:0;max-width:300px}',
    '.cw-card .cw-cta{display:block;width:100%;background:rgba(255,255,255,.16);color:#fff!important;border:1px solid rgba(255,255,255,.5);padding:15px 20px;font-family:"Montserrat",sans-serif;font-size:clamp(11px,3.4vw,14px);font-weight:600;letter-spacing:.22em;text-transform:uppercase;text-align:center;text-decoration:none!important;white-space:nowrap;transition:background .25s,border-color .25s,letter-spacing .25s;margin-bottom:5px}',
    '.cw-card .cw-cta:hover{background:rgba(255,255,255,.28);border-color:#fff;letter-spacing:.26em}',
    '.cw-card .cw-footer{font-size:9px;font-weight:400;letter-spacing:.2em;padding-left:.2em;text-transform:uppercase;color:rgba(255,255,255,.4);margin:16px 0 0!important}',
    '@media (max-width:400px){.cw-card{--cw-pad:26px;--cw-title:19px;--cw-date:16px;--cw-sky:var(--cw-sky-sm)}.cw-card .cw-eyebrow{font-size:8px;letter-spacing:.28em}.cw-body{padding:16px var(--cw-pad) 20px}.cw-card .cw-callout{font-size:11px;padding:10px 12px;line-height:1.4}.cw-card .cw-subtitle{font-size:11px}.cw-card .cw-name{font-size:11px;line-height:1.4}.cw-card .cw-desc{font-size:10.5px}.cw-card .cw-cta{letter-spacing:.18em;padding:13px 16px}}',
    '@media (max-width:330px){.cw-card{--cw-pad:20px;--cw-title:17px;--cw-date:15px}}',

    /* Popup overlay */
    '.cw-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:var(--cw-overlay);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease}',
    '.cw-overlay.cw-open{opacity:1;visibility:visible}',
    '.cw-scale{width:100%;max-width:var(--cw-max);transform-origin:center center;transition:transform .2s ease}',
    '.cw-modal{position:relative;width:100%;transform:translateY(14px) scale(.98);transition:transform .45s cubic-bezier(.16,1,.3,1)}',
    '.cw-overlay.cw-open .cw-modal{transform:none}',
    '.cw-modal .cw-card{box-shadow:var(--cw-shadow)}',
    '.cw-fit-scroll .cw-card{max-height:calc(100vh - 40px);overflow-y:auto}',
    '.cw-close{position:absolute;top:-14px;right:-14px;z-index:5;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.5);background:#1d1e22;color:#fff;font:20px/1 "Montserrat",sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background .2s,border-color .2s,transform .15s}',
    '.cw-close:hover{background:#2a2b31;border-color:#fff}',
    '.cw-close:active{transform:scale(.92)}',
    '@media (max-width:480px){.cw-close{top:6px;right:6px;background:rgba(29,30,34,.85)}}',
    '.cw-modal .cw-close-text,.cw-modal .cw-close-text:hover{top:9px;right:10px;width:auto;height:auto;border:none;border-radius:0;background:none;padding:4px;font-size:10px;font-weight:400;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.6)}',
    '.cw-modal .cw-close-text:hover{color:#fff}',

    /* Floating book button */
    '.cw-book{position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--cw-book);color:#fff!important;font-family:"Montserrat",sans-serif;font-size:15px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;text-decoration:none!important;padding:14px 24px;border-radius:50px;box-shadow:0 4px 14px var(--cw-book-shadow);transition:transform .2s ease,box-shadow .2s ease,background-color .2s ease}',
    '.cw-book:hover{background:var(--cw-book-hover);transform:translateY(-2px);box-shadow:0 6px 18px var(--cw-book-shadow)}',
    '@media (max-width:600px){.cw-book{bottom:16px;right:16px;padding:12px 20px;font-size:13px}}',

    '@media (prefers-reduced-motion:reduce){.cw-dot,.cw-shoot{animation:none!important;opacity:.5!important}.cw-overlay,.cw-modal{transition:opacity .2s ease,visibility .2s ease}}'
  ].join('\n');

  // [top%, left%, small?, delay s]
  var DOTS = [
    [24,14,0,0],[58,30,1,.6],[38,52,0,1.2],[70,68,1,.3],[30,82,0,.9],[64,88,1,1.6],[18,64,1,2.1],
    [12,38,0,1.4],[46,8,1,.5],[80,22,0,2.4],[50,44,1,1.8],[26,72,1,.2],[74,48,0,2.7],[16,92,1,1.1],
    [54,60,0,.8],[84,78,1,2],[34,24,1,1.5],[62,14,0,.4],[8,50,1,1],[42,36,0,2.3],[88,40,1,.7],
    [20,6,0,1.9],[68,56,1,1.3],[44,76,0,2.6],[10,78,1,.1],[78,62,0,1.7],[56,96,1,.95],[36,42,0,2.85]
  ];

  function themeVars() {
    var t = SITE.theme;
    return ':root{' +
      '--cw-card:' + t.card + ';--cw-max:' + t.maxWidth + ';--cw-sky:' + t.skyHeight + ';--cw-sky-sm:' + t.skyHeightSmall +
      ';--cw-pad:' + t.pad + ';--cw-title:' + t.titleSize + ';--cw-date:' + t.dateSize + ';--cw-shadow:' + t.shadow +
      ';--cw-overlay:' + t.overlay + ';--cw-book:' + t.book + ';--cw-book-hover:' + t.bookHover + ';--cw-book-shadow:' + t.bookShadow + '}';
  }

  function injectStyles() {
    if (!document.getElementById('cw-font')) {
      var font = document.createElement('link');
      font.id = 'cw-font';
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700&display=swap';
      document.head.appendChild(font);
    }
    var style = document.createElement('style');
    style.id = 'cw-styles';
    style.textContent = themeVars() + '\n' + CSS;
    document.head.appendChild(style);
  }

  function currentEvents() {
    var now = new Date();
    return EVENTS.filter(function (e) {
      if (!e.hideAfter) return true;
      var p = e.hideAfter.split('-');
      var end = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
      return now <= end;
    });
  }

  function cardHTML(ctaText, ctaUrl) {
    var dots = DOTS.map(function (d) {
      return '<span class="cw-dot' + (d[2] ? ' sm' : '') + '" style="top:' + d[0] + '%;left:' + d[1] +
        '%;animation-delay:' + d[3] + 's"></span>';
    }).join('');

    var events = currentEvents().map(function (e) {
      return '<li class="cw-event">' +
        '<p class="cw-date"><span class="cw-star">✦</span>' + e.dates + '<span class="cw-star">✦</span></p>' +
        '<p class="cw-name">' + e.name + '</p>' +
        '<p class="cw-desc">' + e.desc + '</p>' +
        '</li>';
    }).join('');

    return '<div class="cw-sky">' + dots +
        '<span class="cw-shoot one"></span><span class="cw-shoot two"></span><span class="cw-shoot three"></span>' +
        '<div class="cw-sky-title"><p class="cw-eyebrow">' + CONTENT.eyebrow + '</p>' +
        '<h2 class="cw-title">' + CONTENT.title + '</h2></div>' +
      '</div>' +
      '<div class="cw-body">' +
        (CONTENT.callout ? '<p class="cw-callout">' + CONTENT.callout + '</p>' : '') +
        (CONTENT.subtitle ? '<p class="cw-subtitle">' + CONTENT.subtitle + '</p>' : '') +
        (events ? '<ul class="cw-events">' + events + '</ul>' : '') +
        '<a class="cw-cta" href="' + ctaUrl + '" target="_blank" rel="noopener">' + ctaText + '</a>' +
        (CONTENT.footer ? '<p class="cw-footer">' + CONTENT.footer + '</p>' : '') +
      '</div>';
  }

  function renderInline(targets) {
    targets.forEach(function (el) {
      el.innerHTML = '<div class="cw-card cw-inline">' + cardHTML(SITE.inline.ctaText, SITE.inline.ctaUrl) + '</div>';
      matchSize(el.firstChild);
    });
  }

  // Find the card to match: the outermost box with a background around matchText, inside its own block
  function findMatchTarget(card) {
    var cfg = SITE.inline;
    var bySelector = cfg.matchSelector && document.querySelector(cfg.matchSelector);
    if (bySelector) return bySelector;
    if (!cfg.matchText) return null;
    var re = new RegExp(cfg.matchText, 'i');
    var leaf = Array.prototype.filter.call(document.querySelectorAll('h1,h2,h3,h4,p,div,span,a'), function (e) {
      return !e.children.length && re.test(e.textContent) && !card.contains(e);
    })[0];
    var found = null;
    for (var el = leaf && leaf.parentElement; el && el !== document.body; el = el.parentElement) {
      if (el.contains(card)) break;
      var cs = getComputedStyle(el), bg = cs.backgroundColor;
      if ((bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') || cs.backgroundImage !== 'none') found = el;
      if (el.matches('.sqs-block, .fe-block')) break;
    }
    return found;
  }

  function matchSize(card) {
    var target = findMatchTarget(card);
    if (!target) return;
    function match() {
      card.style.maxWidth = '';
      card.style.minHeight = '';
      var t = target.getBoundingClientRect(), c = card.getBoundingClientRect();
      if (Math.abs(t.top - c.top) > 80) return;   // only when side by side, not stacked on phones
      card.style.maxWidth = t.width + 'px';
      card.style.minHeight = t.height + 'px';
    }
    match();
    window.addEventListener('resize', match);
    if (window.ResizeObserver) new ResizeObserver(match).observe(target);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(match);
  }

  function storageGet() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function storageSet() { try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {} }

  function setupPopup() {
    var cfg = SITE.popup;
    if (!cfg.enabled || !currentEvents().length) return;
    if (location.search.indexOf('cosmic-popup') === -1) {   // add ?cosmic-popup to a URL to force it (for testing)
      var last = parseInt(storageGet(), 10);
      if (last && Date.now() - last < cfg.cooldownHours * 3600000) return;
    }

    var overlay = document.createElement('div');
    overlay.className = 'cw-overlay cw-fit-' + cfg.fit;
    var closeBtn = cfg.closeButton === 'text'
      ? '<button class="cw-close cw-close-text" type="button">✕ close</button>'
      : '<button class="cw-close" type="button" aria-label="Close">&times;</button>';
    overlay.innerHTML = '<div class="cw-scale"><div class="cw-modal" role="dialog" aria-modal="true" aria-label="Upcoming stargazing events">' +
      closeBtn + '<div class="cw-card">' + cardHTML(cfg.ctaText, cfg.ctaUrl) + '</div></div></div>';
    document.body.appendChild(overlay);

    var scaler = overlay.querySelector('.cw-scale');
    var card = overlay.querySelector('.cw-card');

    // 'scale' mode: shrink the whole card so it always fits the screen, never a scrollbar
    function fit() {
      if (cfg.fit !== 'scale' || !overlay.classList.contains('cw-open')) return;
      scaler.style.transform = 'none';
      var m = 24;
      var s = Math.min(1, (window.innerHeight - m * 2) / card.offsetHeight, (window.innerWidth - m * 2) / card.offsetWidth);
      scaler.style.transform = 'scale(' + s + ')';
    }
    window.addEventListener('resize', fit);

    function onEsc(e) { if (e.key === 'Escape') close(); }
    function close() {
      overlay.classList.remove('cw-open');
      document.removeEventListener('keydown', onEsc);
      if (cfg.cooldownStartsWhen === 'closed') storageSet();
    }
    overlay.querySelector('.cw-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    setTimeout(function () {
      overlay.classList.add('cw-open');
      document.addEventListener('keydown', onEsc);
      if (cfg.cooldownStartsWhen !== 'closed') storageSet();
      fit();
      setTimeout(fit, 200);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }, cfg.delayMs);
  }

  function setupBookButton() {
    var cfg = SITE.bookButton;
    if (!cfg.enabled) return;
    var path = location.pathname;
    for (var i = 0; i < cfg.hideOnPathsContaining.length; i++) {
      if (path.indexOf(cfg.hideOnPathsContaining[i]) !== -1) return;
    }
    var a = document.createElement('a');
    a.className = 'cw-book';
    a.href = cfg.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = cfg.text;
    document.body.appendChild(a);
  }

  function init() {
    injectStyles();
    var inline = Array.prototype.slice.call(document.querySelectorAll('[data-cosmic-embed]'));
    renderInline(inline);
    if (!inline.length) setupPopup();
    setupBookButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
