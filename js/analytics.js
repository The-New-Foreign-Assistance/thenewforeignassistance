/*
 * Google Analytics, with the reader's consent.
 *
 * Nothing is loaded from Google and no cookie is set until the reader presses Accept on the banner. The answer is kept in
 * this browser for a year; "Analytics settings" in the footer asks again. A browser that sends Global Privacy Control or
 * Do Not Track is neither asked nor measured. Only the published site is measured (thenewforeignassistance.org and www),
 * so the staging copy and local previews send nothing. Add ?consent=preview to any address to see the banner without
 * storing an answer.
 */
(function () {
  var IDS = ['G-DY00G9KT05', 'G-GPQHNR6C2C'];
  var HOSTS = ['thenewforeignassistance.org', 'www.thenewforeignassistance.org'];
  var KEY = 'tnfa-analytics-consent';
  var DAYS = 365;
  var started = false;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function stored() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!o || (o.v !== 'granted' && o.v !== 'denied')) return null;
      var at = Date.parse(o.at);
      return isFinite(at) && Date.now() - at <= DAYS * 864e5 && Date.now() >= at ? o.v : null;
    } catch (e) { return null; }
  }
  function remember(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, at: new Date().toISOString() })); } catch (e) { /* asked again next page */ }
  }
  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }
  var measured = HOSTS.indexOf(location.hostname) >= 0 && navigator.webdriver !== true && !privacySignal();

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
  function stop() {
    for (var i = 0; i < IDS.length; i++) window['ga-disable-' + IDS[i]] = true; // Google's own switch: stops sending at once
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
        if (preview) return;
        remember(v);
        if (v === 'granted') { window['ga-disable-' + IDS[0]] = false; window['ga-disable-' + IDS[1]] = false; start(); } else stop();
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

  /* "Analytics settings" in the footer's legal line, on the measured site only */
  function settingsLink() {
    var legal = document.querySelector('.footer-legal');
    if (!legal || document.getElementById('analyticsSettings')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'analyticsSettings';
    b.textContent = 'Analytics settings';
    b.style.cssText = 'background:none;border:0;padding:0;margin-left:16px;font:inherit;color:inherit;text-decoration:underline;cursor:pointer';
    b.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored */ }
      banner(false);
    });
    legal.appendChild(b);
  }

  function run() {
    if (param('consent') === 'preview') { banner(true); return; }
    if (!measured) return;
    settingsLink();
    var v = stored();
    if (v === 'granted') start();
    else if (v === null) banner(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
