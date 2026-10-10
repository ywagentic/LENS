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
 assert(data.every(p=>['1','true','on','published','2','upcoming'].includes(String(p.visible).toLowerCase())));
 assert.doesNotThrow(()=>JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]));
 for(const p of data){
  const slug=({16:'freeway-park',31:'amazon-reinvent-plaza',21:'shenzhen-talent-park-phase-ii',24:'oct-harbour',23:'the-broad',22:'tongva-park',9:'yongqing-fang',17:'smale-riverfront-park',20:'huacheng-square'})[p.id]||`project-${p.id}`;
  if (['2','upcoming'].includes(String(p.visible).toLowerCase())) {
   assert(!sitemap.includes(`${site}/projects/${slug}/`));
   assert.equal(p.captures.length, 0);
   if(path==='/' || path==='/browse/') {
    assert(html.includes('data-publication="upcoming"'));
    assert(html.includes(p.title));
    assert(!html.includes(`href="/projects/${slug}/"`));
   }
   continue;
  }
  assert(sitemap.includes(`${site}/projects/${slug}/`));
  if(path==='/browse/') assert(html.includes(`href="/projects/${slug}/"`));
 }
 if(path==='/') {
  assert(html.includes('View project'));
  assert(!html.includes('Watch on YouTube'));
  assert(!/href="https:\/\/(?:www\.)?youtube\.com/.test(html));
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

assert(!fs.existsSync('dist/quest-test'), 'Internal headset tests must not be deployed');
const brandFiles=fs.readdirSync('dist/assets/brand');
assert(brandFiles.every(name=>['apple-touch-icon.png','favicon.svg','lens-mark.svg','lens-youtube-avatar.png'].includes(name)), 'Only approved identity assets belong in production');
const bundles=fs.readdirSync('dist/assets').filter(name=>name.endsWith('.js')).map(name=>fs.readFileSync('dist/assets/'+name,'utf8')).join('\n');
assert(!/__activate_edit_mode|__edit_mode_available|twk-panel/.test(bundles), 'Development editor must not ship');
