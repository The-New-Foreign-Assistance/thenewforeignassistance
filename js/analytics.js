/*
 * Google Analytics, asking first where the law requires it.
 *
 * Since 20 November 2026 the consent banner is shown only where the law requires asking. In a browser on a European time
 * zone, or one whose zone cannot be read, nothing is loaded from Google and no cookie is set until the reader presses Accept
 * on the banner, and "Analytics settings" in the footer asks again. Everywhere else the site measures by default: the footer
 * says so, and its "Turn it off" button stops it in one click ("Turn it back on" undoes that). An Accept is kept in this
 * browser for a year and then asked again; an "off" (Decline, or "Turn it off") never lapses. A browser that sends Global Privacy Control or Do Not Track is neither asked nor measured, anywhere.
 * Only the published site is measured (thenewforeignassistance.org and www), so the staging copy and local previews send
 * nothing. Add ?consent=preview to any address to see the banner without storing an answer.
 */
(function () {
  var IDS = ['G-DY00G9KT05', 'G-GPQHNR6C2C'];
  var HOSTS = ['thenewforeignassistance.org', 'www.thenewforeignassistance.org'];
  var KEY = 'tnfa-analytics-consent';
  var DAYS = 365;
  /*
   * Where a reader is asked before anything is measured (20 November 2026; the same list as the Growth Test's). The site has
   * no server to look at an address, so the browser's time zone stands in for the place. An entry ending in "/" is a prefix:
   * everything under Europe/, which takes in the United Kingdom, Switzerland and the EEA's neighbors and so errs toward
   * asking. The rest are zones of EEA states filed under another ocean or continent: Iceland, the Canaries, Madeira, the
   * Azores, the Faroes and Svalbard; Cyprus; Spain's cities in North Africa; and France's overseas departments.
   */
  var ZONES = ['Europe/', 'Atlantic/Reykjavik', 'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores', 'Atlantic/Faroe',
    'Arctic/Longyearbyen', 'Asia/Nicosia', 'Asia/Famagusta', 'Africa/Ceuta', 'America/Guadeloupe', 'America/Martinique',
    'America/Marigot', 'America/Cayenne', 'Indian/Reunion', 'Indian/Mayotte'];
  var started = false;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function stored() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!o || (o.v !== 'granted' && o.v !== 'denied')) return null;
      if (o.v === 'denied') return 'denied'; // an "off" never lapses: it ends only when the reader turns it back on or accepts
      var at = Date.parse(o.at);
      return isFinite(at) && Date.now() - at <= DAYS * 864e5 && Date.now() >= at ? o.v : null;
    } catch (e) { return null; }
  }
  /* Keep the answer ('granted' or 'denied'), or forget it (null) */
  function remember(v) {
    try {
      if (v) localStorage.setItem(KEY, JSON.stringify({ v: v, at: new Date().toISOString() }));
      else localStorage.removeItem(KEY);
    } catch (e) { /* storage is unavailable: the answer holds for this page only */ }
  }
  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }
  /*
   * Whether this browser is asked first: its time zone is on the list, or says nothing about where the reader is (missing,
   * empty, UTC, GMT or under Etc/), which fails safe by asking. So does a browser that blocks storage, where a "Turn it off"
   * could not be kept.
   */
  function asksFirst() {
    var zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* unreadable: ask */ }
    try { localStorage.getItem(KEY); } catch (e) { return true; }
    if (typeof zone !== 'string' || !zone || /^(UTC|GMT|Etc\/)/i.test(zone)) return true;
    zone = zone.toLowerCase();
    for (var i = 0; i < ZONES.length; i++) {
      var z = ZONES[i].toLowerCase();
      if (z.charAt(z.length - 1) === '/' ? zone.indexOf(z) === 0 : zone === z) return true;
    }
    return false;
  }
  var measured = HOSTS.indexOf(location.hostname) >= 0 && navigator.webdriver !== true && !privacySignal();
  var asks = asksFirst();
  /* Whether to measure with this answer: where the reader is asked first, only after Accept; elsewhere unless turned off */
  function allowed(v) {
    return measured && (asks ? v === 'granted' : v !== 'denied');
  }

  function start() {
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    for (var i = 0; i < IDS.length; i++) gtag('config', IDS[i]);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + IDS[0];
    document.head.appendChild(script);
  }
  /* The reader's answer, from the banner or the footer: kept, and acted on at once */
  function choose(v) {
    remember(v);
    var on = allowed(v);
    for (var i = 0; i < IDS.length; i++) window['ga-disable-' + IDS[i]] = !on; // Google's own switch: stops sending at once
    if (on) start();
    footerLine(v);
  }

  function banner(preview) {
    var old = document.getElementById('consentBanner');
    if (old) old.remove();
    var bar = document.createElement('section');
    bar.id = 'consentBanner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Analytics consent');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:70;background:#ffffff;border-top:2px solid #1c2e4a;' +
      'box-shadow:0 -4px 16px rgba(28,46,74,0.12)';
    var inner = document.createElement('div');
    inner.style.cssText = 'max-width:1728px;margin:0 auto;padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:14px 32px';
    var text = document.createElement('p');
    text.className = 'font-newsreader text-ink';
    text.style.cssText = 'margin:0;flex:1 1 28rem;font-size:17px;line-height:1.45;max-width:80ch';
    var strong = document.createElement('strong');
    strong.textContent = 'May we count your visit? ';
    var link = document.createElement('a');
    link.href = 'https://policies.google.com/technologies/partner-sites';
    link.target = '_blank';
    link.rel = 'noopener';
    link.style.textDecoration = 'underline';
    link.textContent = 'How Google uses that information';
    text.appendChild(strong);
    text.appendChild(document.createTextNode('With your consent this site uses Google Analytics to see which pages people read. ' +
      'It sets cookies in your browser. '));
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap';
    function button(label, cls, v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.style.cssText = 'min-width:140px';
      b.textContent = label;
      b.addEventListener('click', function () {
        bar.remove();
        if (!preview) choose(v);
      });
      return b;
    }
    actions.appendChild(button('Decline', 'btn-outline', 'denied'));
    actions.appendChild(button('Accept', 'btn-filled', 'granted'));
    inner.appendChild(text);
    inner.appendChild(actions);
    bar.appendChild(inner);
    document.body.appendChild(bar);
  }

  /* The footer's legal line: the paragraph in the footer that carries the copyright sign, whatever its class */
  function legalLine() {
    var ps = document.querySelectorAll('footer p');
    for (var i = 0; i < ps.length; i++) if (ps[i].textContent.indexOf('©') >= 0) return ps[i];
    return document.querySelector('footer .footer-legal');
  }
  function linkButton(id, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.id = id;
    b.textContent = label;
    b.style.cssText = 'background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer';
    return b;
  }
  /*
   * What the footer's legal line says about analytics, on the measured site only. Where the reader is asked first:
   * "Analytics settings", which asks again. Elsewhere: that the site measures, with one click to turn it off, or that it
   * is off, with one click back (the keyboard stays on the new button after a press).
   */
  function footerLine(v) {
    var legal = legalLine();
    if (!legal) return;
    var old = document.getElementById('analyticsSettings') || document.getElementById('analyticsNote');
    if (old) old.remove();
    var b;
    if (asks) {
      b = linkButton('analyticsSettings', 'Analytics settings');
      b.style.marginLeft = '16px';
      b.addEventListener('click', function () {
        if (stored() !== 'denied') remember(null); // an earlier Accept is forgotten at once; an "off" stands until Accept
        banner(false);
      });
      legal.appendChild(b);
      return;
    }
    var on = allowed(v);
    var note = document.createElement('span');
    note.id = 'analyticsNote';
    note.style.cssText = 'display:block;margin-top:8px;font-size:15px';
    note.appendChild(document.createTextNode(on ? 'This site uses Google Analytics to count visits and the pages read. '
      : 'Analytics is off in this browser. '));
    b = linkButton('analyticsSwitch', on ? 'Turn it off' : 'Turn it back on');
    b.addEventListener('click', function () {
      choose(on ? 'denied' : null);
      var next = document.getElementById('analyticsSwitch');
      if (next) next.focus();
    });
    note.appendChild(b);
    legal.appendChild(note);
  }

  function run() {
    if (param('consent') === 'preview') { banner(true); return; }
    if (!measured) return;
    var v = stored();
    footerLine(v);
    if (allowed(v)) start();
    else if (asks && v === null) banner(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
