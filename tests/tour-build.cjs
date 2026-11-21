const assert=require('node:assert/strict');
(async()=>{
 const {validateTourCollection}=await import('../scripts/experience-build.mjs');
 const point=(id,park,links=[])=>({id,park,links:links.map(target=>({target}))});
 assert.doesNotThrow(()=>validateTourCollection({views:[point('a','one',['b']),point('b','one',['a']),point('c','two')]}));
 assert.throws(()=>validateTourCollection({views:[point('a','one',['c']),point('c','two')]}),/crosses project/);
 assert.throws(()=>validateTourCollection({views:[point('a','one',['missing'])]}),/outside collection/);
 assert.throws(()=>validateTourCollection({views:[point('a','one'),point('a','one')]}),/Duplicate panorama/);
 console.log('PASS: panorama links stay within a project and reject missing or duplicate targets.');
})().catch(e=>{console.error(e);process.exitCode=1;});
