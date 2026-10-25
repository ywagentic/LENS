// Explicit locale URLs remain shareable; preferences apply only to unprefixed entries.
(function () {
  const supported = ['en', 'zh', 'zh-hant', 'es', 'pt', 'fr', 'ar'];
  const path = window.location.pathname;
  if (/^\/(zh-hant|zh|es|pt|fr|ar)(?:\/|$)/.test(path)) return;
  let preferred;
  try { preferred = localStorage.getItem('lens-language'); } catch {}
  if (!supported.includes(preferred)) {
    preferred = 'en';
    for (const value of (navigator.languages?.length ? navigator.languages : [navigator.language])) {
      const language = String(value || '').toLowerCase();
      const base = language.split('-')[0];
      if (!supported.includes(base)) continue;
      preferred = base === 'zh' && /(?:hant|tw|hk|mo)(?:-|$)/.test(language) ? 'zh-hant' : base;
      break;
    }
  }
  if (preferred !== 'en') window.location.replace('/' + preferred + path + window.location.search + window.location.hash);
})();
