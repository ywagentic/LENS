function createContributionNavigation(win, onChange) {
  const section = () => {
    const value = new URLSearchParams(win.location.search).get('section');
    return ['protocol', 'wishlist', 'submit'].includes(value) ? value : 'index';
  };
  const sync = () => onChange(section());
  const urlFor = value => {
    const url = new URL(win.location.href);
    if (value === 'index') url.searchParams.delete('section');
    else url.searchParams.set('section', value);
    return url.pathname + url.search + url.hash;
  };
  win.addEventListener('popstate', sync);
  sync();
  return {
    open(value) {
      if (value === section()) return;
      win.history.pushState({lensContributionEntry:true}, '', urlFor(value));
      sync();
    },
    back() {
      if (win.history.state?.lensContributionEntry) win.history.back();
      else {
        // A directly opened guide has no contribution landing entry to return to.
        win.history.replaceState(null, '', urlFor('index'));
        sync();
      }
    },
    destroy() { win.removeEventListener('popstate', sync); }
  };
}
