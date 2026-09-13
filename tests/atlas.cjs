const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('atlas.jsx','utf8');
const c={};
vm.runInNewContext('const FH=560;'+source.slice(source.indexOf('function positionsForMap('),source.indexOf('function positionsForYear('))+source.slice(source.indexOf('const ATLAS_LEVELS'),source.indexOf('function AtlasMap(')),c);
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
