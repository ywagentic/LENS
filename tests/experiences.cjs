const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {App,normalizeProjects,isPublished,projectPath,projectViews,fullsiteModeCount,lensSetLocale}=require('../.build/server.cjs');
const html=fs.readFileSync('dist/about/index.html','utf8');
const projects=JSON.parse(html.match(/id="catalogue-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const published=projects.filter(isPublished);
assert.equal(published.length,18);
assert.equal(published.reduce((n,p)=>n+projectViews(p).length,0),48);
assert.equal(published.reduce((n,p)=>n+p.captures.length,0),33);
assert.equal(published.reduce((n,p)=>n+(p.panoramas||[]).length,0),17);
const retiredIds=new Set(['ReEQnDtwA0U','YZU4gVDYe24']),retiredCodes=new Set(['0801-02','0801-03']);
for(const p of published)for(const v of [...p.captures,...(p.panoramas||[])]){assert(!retiredIds.has(v.vrId),'Retired still-derived videos must not be available');assert(!retiredCodes.has(v.code),'Retired points must not become active panorama substitutes');}
const freeway=published.find(p=>Number(p.id)===16);
assert.equal(freeway.captures.length,1);
assert.equal(freeway.captures[0].code,'0801-01');
assert.equal((freeway.panoramas||[]).length,0,'No unrequested conversion to tours');

const sample={id:999,title:'Panorama-only fixture',visible:'1',publishedAt:'2027-01-01',captures:[],panoramas:[{id:'fixture-one',code:'9901-01',name:'Garden path',publishedAt:'2027-01-01',panorama:'/assets/panoramas/fixture.jpg',preview:'/assets/panoramas/fixture-preview.jpg',thumb:'/assets/panoramas/fixture-thumb.jpg',spaceTypes:['Planting'],links:[]}]};
const normalized=normalizeProjects([sample])[0];
assert(normalized&&isPublished(normalized));
assert.equal(normalized.captures.length,0,'A panorama must not be forced into the YouTube capture array');
assert.equal(normalized.panoramas.length,1);
assert.equal(normalized.panoramas[0].code,'9901-01');
assert.equal(normalized.panoramas[0].publishedAt,'2027-01-01');
assert.deepEqual(normalized.panoramas[0].spaceTypes,['Planting']);
assert.equal(fullsiteModeCount(normalized,'panoramas'),1);
assert.equal(fullsiteModeCount(normalized,'recordings'),0);

const love=published.find(p=>p.id===28);
assert.equal(projectViews(love).length,2);
assert.equal(love.captures.length,2);
assert.equal(love.panoramas.length,2);
for(const point of love.panoramas){
 const recording=love.captures.find(c=>c.code===point.code);
 assert(recording,'A shared Love panorama must have an explicitly identical capture code');
 assert.equal(point.publishedAt,recording.publishedAt||love.publishedAt);
}
const panoramaOnly=published.filter(p=>!p.captures.length&&p.panoramas?.length);
assert.equal(panoramaOnly.length,2);
assert.deepEqual(panoramaOnly.map(p=>p.panoramas.length).sort((a,b)=>a-b),[6,9]);
const mixed=panoramaOnly.find(p=>p.panoramas.some(v=>v.links?.length));
assert.equal(fullsiteModeCount(mixed,'panoramas'),9,'Total panorama availability includes points outside the linked route');
assert.equal(mixed.panoramas.filter(v=>v.links?.length).length,3);

lensSetLocale('en');
function render(project){return renderToStaticMarkup(React.createElement(App,{initialProjects:[project],initialPath:projectPath(project),freezeCatalogue:true}));}
function cards(markup){return [...markup.matchAll(/<article\b[^>]*\bdata-mode="(recordings|panoramas)"[^>]*>([\s\S]*?)<\/article>/g)].map(match=>({mode:match[1],html:match[2]}));}
for(const project of published){
 const markup=render(project),entry=cards(markup);
 assert.equal(entry.length,2,`${project.title}: always retain both experience cards`);
 for(const card of entry){
  const count=fullsiteModeCount(project,card.mode);
  const previews=card.html.match(/class="fullsite-mode-preview"/g)||[];
  const empty=card.html.match(/class="fullsite-mode-empty"/g)||[];
  assert.equal(previews.length+empty.length,4,`${project.title}: fixed four-slot preview layout`);
  assert(previews.length<=Math.min(4,count),`${project.title}: cap representative images, not total points`);
  if(count)assert(previews.length>0,`${project.title}: available experiences need a real preview`);
  assert.equal((card.html.match(/<button\b/g)||[]).length,1,`${project.title}: images are passive, only the footer action is a button`);
  assert(!/<a\b/.test(card.html),`${project.title}: previews must not acquire a second entry path`);
  assert.equal(/<button\b[^>]*\bdisabled/.test(card.html),count===0,`${project.title}: unavailable experience is disabled`);
  assert(card.html.includes(`Available viewpoints: ${count}.`),`${project.title}: show the actual mode count`);
 }
 assert(!/Local test version|Local panorama examples|Local preview does not transmit/.test(markup));
 assert(!/\/drafts\/|\.local-notes|\/tour-demo\/|\/fullsite-assets\/|\/scene-previews\//.test(markup),'No local-only runtime URLs in production pages');
 assert(!markup.includes('localExample'));
}
// Explicitly asymmetric fixture: unrelated inventories, not a fabricated catalogue release.
const asymmetric={...love,captures:love.captures.slice(0,2),panoramas:Array.from({length:14},(_,i)=>({...love.panoramas[i%2],id:`test-point-${i}`,code:`9902-${String(i+1).padStart(2,'0')}`,links:[]}))};
const asymmetricCards=cards(render(asymmetric));
assert(asymmetricCards.find(c=>c.mode==='recordings').html.includes('Available viewpoints: 2.'));
assert(asymmetricCards.find(c=>c.mode==='panoramas').html.includes('Available viewpoints: 14.'));
assert.equal((asymmetricCards.find(c=>c.mode==='recordings').html.match(/class="fullsite-mode-empty"/g)||[]).length,2);
assert.equal((asymmetricCards.find(c=>c.mode==='panoramas').html.match(/class="fullsite-mode-preview"/g)||[]).length,4);

// The built archive must not depend on ignored local prototype input or network CDNs for the VR engine.
const assets=fs.readdirSync('dist/assets').filter(name=>name.endsWith('.js')).map(name=>fs.readFileSync(path.join('dist/assets',name),'utf8')).join('\n');
assert(!/Local preview does not transmit submissions|Local test version|Local panorama examples/.test(assets));
assert(!/drafts\/experience-model|drafts\/aframe-tour-demo|127\.0\.0\.1:87(?:86|87|88|89|90|91)/.test(assets));
assert(!fs.existsSync('dist/fullsite-assets/asymmetric-entry.html'),'Synthetic composite layout example must stay private');
console.log('PASS: independent video/panorama inventories, 18/48/33/17 active totals, panorama-only normalization, mixed-route counts and four passive preview slots with one footer entry per mode.');

// Public experience previews must survive the actual build asset allowlist.
const previewConfig=JSON.parse(fs.readFileSync('config/experience-previews.json','utf8'));
for(const rows of Object.values(previewConfig))for(const preview of rows){
 assert(preview.src.startsWith('/assets/projects/previews/'));
 assert(fs.existsSync('dist'+preview.src),'Missing built recording preview: '+preview.src);
 assert(fs.statSync('dist'+preview.src).size>0,'Empty built recording preview: '+preview.src);
}
