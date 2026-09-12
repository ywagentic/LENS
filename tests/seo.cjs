const fs=require('node:fs'),assert=require('node:assert/strict');
const site='https://lens-vr.com';
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert(urls.length>=7);
for(const url of urls){
 const path=new URL(url).pathname;
 const html=fs.readFileSync(`dist${path}index.html`,'utf8');
 assert(html.includes(`<link rel="canonical" href="${url}">`));
 assert(/<h1\b/.test(html),`No static heading at ${path}`);
 assert(!html.includes('text/babel'));
 assert(!html.includes('react.development'));
 const data=JSON.parse(html.match(/id="catalogue-data" type="application\/json">(.*?)<\/script>/s)[1]);
 assert(data.every(p=>['1','true'].includes(String(p.visible).toLowerCase())));
 assert.doesNotThrow(()=>JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]));
 for(const p of data){
  const slug=({9:'yongqing-fang',20:'huacheng-square'})[p.id]||`project-${p.id}`;
  assert(sitemap.includes(`${site}/projects/${slug}/`));
  if(path==='/browse/') assert(html.includes(`href="/projects/${slug}/"`));
 }
 if(path.startsWith('/projects/')){
  assert(html.includes('Year completed'));
  assert(html.includes('https://www.youtube.com/watch?v='));
  assert(!html.includes('youtube.com/embed/'));
 }
}
assert(fs.readFileSync('dist/404.html','utf8').includes('noindex, follow'));
assert(!sitemap.includes('/404/'));
assert(fs.readFileSync('dist/robots.txt','utf8').includes(`${site}/sitemap.xml`));
console.log(`PASS: ${urls.length} static pages, canonical URLs, crawlable project links, published-only data, structured data and 404 indexing.`);
