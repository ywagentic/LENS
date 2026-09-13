const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const csv=process.argv[2] ? fs.readFileSync(process.argv[2],'utf8') : 'id,title,visible,vrId\n9,Yongqing,1,\n12,Placeholder,0,YOUTUBE_ID_HERE\n20,Huacheng,1,';
const source=html.slice(html.indexOf('function parseCSV'),html.indexOf('// Convert "lat,lng"'));
let fetchOptions;
const ctx=vm.createContext({AbortController,setTimeout,clearTimeout,fetch:async(_,options)=>{fetchOptions=options;return {ok:true,text:async()=>csv}}});
vm.runInContext('const SHEET_CSV_URL="https://example.com";'+source,ctx);
const data=ctx.normalizeProjects(ctx.parseCSV(csv));
assert.deepEqual(Array.from(data,p=>p.id),[9,20]);
if(!process.argv[2]) assert.equal(data.every(p=>p.captures.length===0),true);
const multiline=ctx.parseCSV('id,title,visible,description\r\n9,Test,1,"Line one, \"\"quoted\"\"\nLine two"');
assert.equal(multiline[0].description,'Line one, "quoted"\nLine two');
for(const visible of [0,'0',false,'false','',undefined,'yes']) assert.equal(ctx.isProjectVisible({visible}),false);
for(const visible of [1,'1',true,'TRUE']) assert.equal(ctx.isProjectVisible({visible}),true);
assert.equal(ctx.normalizeProjects([{id:1,title:'hidden',visible:0,featured:true,vrId:'abcdefghijk'}]).length,0);
assert.equal(ctx.normalizeProjects([{visible:1,vrId:'YOUTUBE_ID_HERE'}])[0].captures.length,0);
(async()=>{
 assert.equal((await ctx.fetchProjects()).length,2);assert.equal(fetchOptions.cache,'no-store');
 ctx.fetch=async()=>({ok:true,text:async()=> 'id,title,visible\n9,Hidden,0'}); assert.equal((await ctx.fetchProjects()).length,0);
 ctx.fetch=async()=>({ok:true,text:async()=> 'id,title\n9,Legacy'}); await assert.rejects(ctx.fetchProjects());
 ctx.fetch=async()=>{throw Error('offline')};await assert.rejects(ctx.fetchProjects());
 console.log('PASS: CSV has only IDs 9 and 20 visible; default hidden, invalid media, all hidden, missing switch, fresh fetch and network failure checked.');
})().catch(e=>{console.error(e);process.exitCode=1});

// Publication lifecycle: preview visibility never enables recordings or auto-publishes.
for(const visible of ['upcoming','UPCOMING',2,'2']) {
 assert.equal(ctx.publicationStatus({visible}),'upcoming');
 assert.equal(ctx.isProjectVisible({visible}),true);
 assert.equal(ctx.isPublished({visible}),false);
 const preview=ctx.normalizeProjects([{id:21,title:'Preview',visible,vrId:'abcdefghijk',captures:[{vrId:'abcdefghijk'}]}])[0];
 assert.equal(preview.captures.length,0);assert.equal(preview.vrId,'');
}
assert.equal(ctx.upcomingTiming({expectedRelease:'2026-09-19'},new Date('2026-09-12T12:00:00Z')),'Expected within 1 week · by Sep 19, 2026');
assert.equal(ctx.upcomingTiming({expectedRelease:'2026-09-26'},new Date('2026-09-12T12:00:00Z')),'Expected within 2 weeks · by Sep 26, 2026');
assert.equal(ctx.upcomingTiming({expectedRelease:'2026-09-11'},new Date('2026-09-12T12:00:00Z')),'Recording in preparation · date to be updated');
assert.equal(ctx.upcomingTiming({expectedRelease:'2026-02-30'}),'Recording coming soon');
assert.equal(ctx.upcomingTiming({}),'Recording coming soon');

// Stable viewpoint identifiers survive gaps; older four-field rows still parse.
const numbered=ctx.parseCSV('id,title,visible,captures\n17,Smale,1,Water Features::zkgIGKo52ME::Water view::::0501-04')[0];
assert.equal(numbered.captures[0].code,'0501-04');
assert.equal(numbered.captures[0].height,'');
assert.equal(ctx.parseCSV('id,title,visible,captures\n20,Huacheng,1,Main::0_J7l3HbcX0::Test::1.6m')[0].captures[0].code,'');
