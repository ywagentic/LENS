const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('scripts/language-preference.js','utf8');
function destination({path='/browse/',languages=['en-US'],saved,unavailable=false}={}) {
 let target=null;
 vm.runInNewContext(source,{window:{location:{pathname:path,search:'?view=abc',hash:'#view',replace:value=>target=value}},navigator:{languages},localStorage:{getItem(){if(unavailable)throw Error('disabled');return saved;}}});
 return target;
}
assert.equal(destination({languages:['ar-SA']}),'/ar/browse/?view=abc#view');
assert.equal(destination({languages:['de-DE','fr-CA']}),'/fr/browse/?view=abc#view');
assert.equal(destination({languages:['zh-TW']}),'/zh-hant/browse/?view=abc#view');
assert.equal(destination({languages:['zh-Hant-HK']}),'/zh-hant/browse/?view=abc#view');
assert.equal(destination({languages:['zh-CN']}),'/zh/browse/?view=abc#view');
assert.equal(destination({languages:['pt-PT']}),'/pt/browse/?view=abc#view');
assert.equal(destination({languages:['ar'],saved:'en'}),null);
assert.equal(destination({languages:['ar'],saved:'fr'}),'/fr/browse/?view=abc#view');
assert.equal(destination({path:'/ar/browse/',saved:'fr'}),null);
assert.equal(destination({languages:['de']}),null);
assert.equal(destination({languages:['es'],unavailable:true}),'/es/browse/?view=abc#view');
assert(fs.readFileSync('dist/index.html','utf8').includes(source));
console.log('PASS: device language negotiation, explicit URL precedence, remembered English/manual choice, Chinese scripts, regional variants, query/hash and unavailable storage.');
