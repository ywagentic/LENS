// The Web Analytics beacon token is a public site identifier, not an API key.
export function analyticsMarkup(token, origin) {
  if (!token) return '';
  if (!/^[a-f0-9]{32}$/i.test(token)) throw new Error('Invalid Cloudflare Web Analytics beacon token');
  const host = new URL(origin).hostname;
  return `<script>(function(){if(location.hostname!==${JSON.stringify(host)}||document.querySelector('meta[name="robots"][content*="noindex"]'))return;var s=document.createElement('script');s.type='module';s.src='https://static.cloudflareinsights.com/beacon.min.js';s.setAttribute('data-cf-beacon',JSON.stringify({token:${JSON.stringify(token)}}));document.head.appendChild(s);})();</script>`;
}
