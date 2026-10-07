const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('atlas.jsx','utf8');
const c={isUpcoming:p=>p.visible==='upcoming'};
vm.runInNewContext('const FW=1000,FH=560;'+source.slice(source.indexOf('function positionsForMap('),source.indexOf('function positionsForYear('))+source.slice(source.indexOf('const ATLAS_LEVELS'),source.indexOf('function AtlasMap(')),c);
const projects=[{id:1,coordinates:'23.1226,113.2395'},{id:2,coordinates:'23.116258,113.324729'},{id:3,coordinates:'40,116'},{id:4,coordinates:'invalid'}];
for(const width of [320,1000]){
 const world=c.atlasRegionPositions(projects,'world',width,560);
 assert.equal(Object.keys(world.positions).length,3);
 const china=c.atlasRegionPositions(projects,'china',width,560);
 assert.equal(Object.keys(china.positions).length,3);
 const province=c.atlasRegionPositions(projects,'guangdong',width,560);
 assert.equal(Object.keys(province.positions).length,2);
 assert.equal(c.atlasClusters(projects,province.positions,width,560).length,1);
 for(const p of Object.values(province.positions))assert.ok(p.x>0&&p.x<1&&p.y>0&&p.y<1);
}
assert.ok(!source.includes('tile.openstreetmap.org'));
assert.ok(!source.includes('onPointerMove'));
assert.ok(!source.includes('Zoom in'));
console.log('PASS: fixed World/China/Guangdong views, mobile positions, clustering, no free zoom or raster tiles.');

assert.ok(!source.includes('ATLAS_REGION_PATHS'));
assert.ok(source.includes('ATLAS_PROVINCE_LINES')); 
assert.ok(source.includes('Schematic view'));

// Equal map-unit distances retain the same screen length at every aspect ratio.
for(const [width,height] of [[320,560],[1000,560],[1600,400]]) {
 const p=c.atlasRegionPositions([{id:1,coordinates:'0,0'},{id:2,coordinates:'0,36'},{id:3,coordinates:'36,0'}],'world',width,height).positions;
 assert.ok(Math.abs((p[2].x-p[1].x)*width-(p[1].y-p[3].y)*height)<1e-8);
}

assert.equal(c.atlasMarkerBackground([{visible:'upcoming'}]), '#9b9f9c');
assert.equal(c.atlasMarkerBackground([{visible:'1'}]), 'var(--accent)');
assert(c.atlasMarkerBackground([{visible:'1'},{visible:'upcoming'}]).includes('50%'));
