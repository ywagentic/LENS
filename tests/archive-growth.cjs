const assert = require('node:assert/strict');
const fs = require('node:fs');
const {isPublished, parseCSV, normalizeProjects, projectViews, archiveGrowthHistory:history} = require('../.build/server.cjs');
const rows = projects => JSON.parse(JSON.stringify(history(projects)));
const capture = (code, publishedAt, vrId='abcdefghijk') => ({code,publishedAt,vrId});
const panorama = (code, publishedAt, id=code) => ({id,code,publishedAt,name:code,panorama:'/assets/panoramas/test.jpg',preview:'/assets/panoramas/test-preview.jpg',thumb:'/assets/panoramas/test-thumb.jpg',links:[],spaceTypes:[]});
const project = (id,publishedAt,captures,visible='1',panoramas=[]) => ({id,title:`Project ${id}`,publishedAt,captures,panoramas,visible});
const first = project(100,'2027-01-02',[capture('1101-01','2027-01-02')]);
const second = project(101,'2027-02-01',[capture('1102-01','2027-02-01')]);
assert.deepEqual(rows([first, second]),[['2027-01-02',1,1],['2027-02-01',2,2]]);
const expanded = {...first,captures:[...first.captures,capture('1101-02','2027-03-04')]};
assert.deepEqual(rows([expanded,second]),[['2027-01-02',1,1],['2027-02-01',2,2],['2027-03-04',2,3]]);
assert.deepEqual(rows([{...first,captures:[capture('1101-01','2027-01-02','replacement')]}]),rows([first]));
assert.deepEqual(rows([first,project(102,'',[],'upcoming')]),rows([first]));
assert.deepEqual(rows([]),[]);
assert.throws(()=>history([project(100,'',[])]),/publication date/);
assert.throws(()=>history([project(100,'2027-02-30',[])]),/publication date/);
assert.throws(()=>history([project(100,'2027-01-02',[capture('1101-01',undefined)])]),/publication date/);
assert.throws(()=>history([project(100,'2027-01-02',[capture('1101-01','2027-01-01')])]),/predates/);
assert.throws(()=>history([project(100,'2027-01-02',[first.captures[0],first.captures[0]])]),/Duplicate recording identity/);

// Two media representations of a proven identical physical viewpoint do not add a View.
const paired={...first,panoramas:[{...panorama('1101-01','2027-01-02','same-source-point'),mediaPublishedAt:'2027-04-01'}]};
assert.equal(projectViews(paired).length,1);
assert.deepEqual(rows([paired]),rows([first]));
assert.deepEqual(rows([{...paired,panoramas:[{...paired.panoramas[0],mediaPublishedAt:'2027-05-20'}]}]),rows([first]));
// A new physical panorama point, including one added later, has its own first-publication date.
const panoramaOnly=project(103,'2027-02-12',[],'1',[panorama('1201-01','2027-02-12','pano-one')]);
assert.deepEqual(rows([first,panoramaOnly]),[['2027-01-02',1,1],['2027-02-12',2,2]]);
const laterPanorama={...paired,panoramas:[...paired.panoramas,panorama('1101-03','2027-06-15','later-point')]};
assert.deepEqual(rows([laterPanorama]),[['2027-01-02',1,1],['2027-06-15',1,2]]);
assert.equal(projectViews(laterPanorama).length,2);
assert.deepEqual(rows([first,project(104,'',[],'upcoming',[panorama('1202-01','','unreleased')])]),rows([first]));
assert.throws(()=>history([project(103,'2027-02-12',[],'1',[panorama('1201-01',undefined)])]),/publication date/);
assert.throws(()=>history([project(103,'2027-02-12',[],'1',[panorama('1201-01','2027-02-11')])]),/predates/);

const csv='id,title,visible,publishedAt,captures\n100,Test,1,2027-01-02,Test::abcdefghijk::Description::Standing::1101-01::Plaza::/assets/test.jpg::2027-01-03';
assert.equal(parseCSV(csv)[0].captures[0].publishedAt,'2027-01-03');
const legacy = normalizeProjects([{id:20,title:'Huacheng',visible:'1',captures:[{vrId:'0_J7l3HbcX0'},{vrId:'sFw9p5A91HY'}]}])[0];
assert.equal(legacy.captures[0].code,'0302-01');
assert.equal(legacy.captures[0].publishedAt,'2026-09-12');
const replacedLegacy = {...legacy,captures:legacy.captures.map(c=>({...c,vrId:'newVideo123'}))};
assert.deepEqual(rows([replacedLegacy]),rows([legacy]));

const html = fs.readFileSync('dist/about/index.html','utf8');
const projects = JSON.parse(html.match(/id="catalogue-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const published = projects.filter(isPublished);
const last = rows(projects).at(-1);
assert.equal(last[1],published.length);
assert.equal(last[2],published.reduce((n,p)=>n+projectViews(p).length,0));
assert.equal(published.reduce((n,p)=>n+p.captures.length,0),33,'The active video inventory excludes the two withdrawn still-derived Freeway videos');
assert.equal(last[1],18,'2.00 includes two panorama-only projects');
const retiredIds=new Set(['ReEQnDtwA0U','YZU4gVDYe24']);
const retiredCodes=new Set(['0801-02','0801-03']);
for(const project of published)for(const view of [...project.captures,...(project.panoramas||[])]){assert(!retiredIds.has(view.vrId),'Withdrawn videos must not remain active');assert(!retiredCodes.has(view.code),'Withdrawn points are not converted to active panoramas in this release');}
assert.equal(published.find(p=>Number(p.id)===16).captures.length,1,'Freeway Park retains its one real video');
assert.equal(last[2],48,'Active View totals exclude the two withdrawn still-derived videos and deduplicate Love’s shared source points');
assert(html.includes(`→ ${last[1]} (`),'Projects growth chart must end at the displayed catalogue total');
assert(html.includes(`→ ${last[2]} (`),'Views growth chart must end at the unique physical View total');
assert(/>48<\/div>\s*<div[^>]*>Views<\/div>/.test(html),'About must show 48 active Views, not the video-only count');
console.log('PASS: unique physical View history covers paired media, new/later panorama points, replacements, original dates, upcoming exclusions, validation and the 18-project/48-active-View endpoint.');
