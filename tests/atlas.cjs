const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('atlas.jsx','utf8');
const context = {};
vm.runInNewContext(source.slice(source.indexOf('function atlasMercatorPositions('),source.indexOf('function AtlasMap(')),context);
const cluster = context.atlasClusters;
const projects = [{id:1},{id:2},{id:3},{id:4}];
const positions = {1:{x:.8,y:.4},2:{x:.8001,y:.4001},3:{x:.2,y:.5}};
const world = {x:.5,y:.5,zoom:1};
assert.equal(cluster(projects,positions,world,1000,500).length,2);
assert.equal(cluster(projects,positions,world,360,420).length,2);
const zoomed = cluster(projects,positions,{x:.80005,y:.40005,zoom:1024},1000,500);
assert.equal(zoomed.length,2, 'nearby sites separate after zoom');
assert.equal(zoomed.flatMap(g=>g.members).length,2,'offscreen and missing coordinates excluded');
const same = cluster(projects,{1:positions[1],2:positions[1]}, {x:.8,y:.4,zoom:4096},360,420);
assert.equal(same.length,1);
assert.equal(same[0].members.length,2,'coincident sites remain individually available in group');
assert.equal(cluster([],{},world,1000,500).length,0);
console.log('Atlas clustering checks passed');

const projected = context.atlasMercatorPositions([{id:1,coordinates:'0,0'},{id:2,coordinates:'23.12,113.24'},{id:3,coordinates:'91,0'},{id:4,coordinates:',10'}]);
assert.equal(projected[1].x,.5); assert.equal(projected[1].y,.5);
assert.ok(projected[2].x>.81 && projected[2].x<.82);
assert.ok(projected[2].y>.43 && projected[2].y<.44);
assert.equal(Object.keys(projected).length,2);
for (const zoom of [1,64,4096]) {
  const tiles = context.atlasTiles({x:.81,y:.43,zoom},1000,500);
  assert.ok(tiles.length>0 && tiles.length<40,'only viewport tiles requested');
  for (const t of tiles) {
    assert.ok(t.left<1000 && t.left+t.size>=0);
    assert.ok(t.top<500 && t.top+t.size>=0);
  }
}
