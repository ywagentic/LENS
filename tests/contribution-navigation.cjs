const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const create=vm.runInNewContext(fs.readFileSync('scripts/contribution-navigation.js','utf8')+'\ncreateContributionNavigation',{URL,URLSearchParams});
function browser(start) {
 const entries=[{url:new URL(start),state:null}],listeners=new Set();let at=0;
 const win={get location(){return entries[at].url;},addEventListener(type,fn){listeners.add(fn);},removeEventListener(type,fn){listeners.delete(fn);}};
 win.history={get state(){return entries[at].state;},pushState(state,_,path){entries.splice(at+1);entries.push({state,url:new URL(path,win.location)});at++;},replaceState(state,_,path){entries[at]={state,url:new URL(path,win.location)};},back(){if(at){at--;listeners.forEach(fn=>fn());}},forward(){if(at+1<entries.length){at++;listeners.forEach(fn=>fn());}}};return win;
}
const win=browser('https://lens-vr.com/ar/contribute/?v=test#top');let displayed;
const nav=create(win,value=>displayed=value);
assert.equal(displayed,'index');
nav.open('protocol');assert.equal(displayed,'protocol');assert.equal(win.location.search,'?v=test&section=protocol');assert.equal(win.location.hash,'#top');
win.history.back();assert.equal(displayed,'index');
win.history.forward();assert.equal(displayed,'protocol');
nav.back();assert.equal(displayed,'index');
nav.open('wishlist');assert.equal(displayed,'wishlist');nav.back();assert.equal(displayed,'index');
nav.open('submit');assert.equal(displayed,'submit');nav.back();assert.equal(displayed,'index');nav.destroy();
const direct=browser('https://lens-vr.com/zh/contribute/?section=protocol&v=test');
const directNav=create(direct,value=>displayed=value);assert.equal(displayed,'protocol');directNav.back();assert.equal(displayed,'index');assert.equal(direct.location.pathname,'/zh/contribute/');assert.equal(direct.location.search,'?v=test');directNav.destroy();
console.log('PASS: contribution section browser back/forward, in-page return, direct-link fallback, language path and other query/hash preserved.');
