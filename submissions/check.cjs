const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync('submissions/Code.gs', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const rows = []; let mails = 0, emailFails = false;
const sheet = {
 getLastRow: () => rows.length,
 appendRow: row => rows.push(row.map(v => typeof v === 'string' && v.startsWith("'2026-") ? v.slice(1) : v)),
 getRange: (r,c,h=1,w=1) => ({ getValues: () => rows.slice(r-1,r-1+h).map(row=>row.slice(c-1,c-1+w)), setValue: value => { rows[r-1][c-1]=value; } })
};
const properties = {LENS_SUBMISSIONS_SHEET_ID:'test', LENS_SUBMISSIONS_EMAIL_TO:'test@example.com'};
const context = vm.createContext({
 Date, Utilities:{formatDate:()=> '2026-09-12'},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
 PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties[key]})},
 LockService:{getScriptLock:()=>({waitLock(){},hasLock:()=>true,releaseLock(){}})},
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet,getSpreadsheetTimeZone:()=>'America/Chicago'}),flush(){}},
 MailApp:{sendEmail(){if(emailFails)throw Error('quota');mails++;}}
});
vm.runInContext(code,context);
const sample = { submissionId:'12345678-1234-1234-1234-123456789012',name:'=bad()',email:'test@example.com',project:'Sample',driveLink:'https://example.com/video',notes:'',consent:'true',termsVersion:'2026-09-12' };
assert.equal(context.doPost({parameter:{...sample,consent:'false'}}).ok,false);
assert.equal(rows.length,0);
assert.equal(context.doPost({parameter:sample}).ok,true);
assert.equal(rows.length,2); assert.equal(rows[1][2],"'=bad()"); assert.equal(mails,1);
rows[1][7] = true;
rows[1][8] = new Date('2026-09-12T05:00:00Z');
assert.equal(context.doPost({parameter:sample}).ok,true); assert.equal(rows.length,2);assert.equal(mails,1);
assert.equal(context.doPost({parameter:{...sample,project:'Changed'}}).ok,false);
emailFails=true;
assert.equal(context.doPost({parameter:{...sample,submissionId:'22345678-1234-1234-1234-123456789012'}}).ok,true);
assert.equal(rows[2][9],'failed');
const start=html.indexOf('const SUBMISSION_TERMS_VERSION');
const end=html.indexOf('const COLLECTION_PROTOCOL',start);
let calls=0;
const client=vm.createContext({AbortController,setTimeout,clearTimeout,URLSearchParams,fetch:async()=>{calls++;return {ok:true,json:async()=>({ok:true,submissionId:sample.submissionId})}}});
vm.runInContext(html.slice(start,end),client);
(async()=>{
 await assert.rejects(client.sendSubmission('',sample,sample.submissionId));assert.equal(calls,0);
 await client.sendSubmission('https://example.com',sample,sample.submissionId);
 for(const result of [{ok:false,json:async()=>({})},{ok:true,json:async()=>({ok:false})},{ok:true,json:async()=>({ok:true,submissionId:'wrong'})},{ok:true,json:async()=>{throw Error('html')}}]){
 client.fetch=async()=>result;await assert.rejects(client.sendSubmission('https://example.com',sample,sample.submissionId));
 }
 client.fetch=async()=>{throw Error('network')};await assert.rejects(client.sendSubmission('https://example.com',sample,sample.submissionId));
 assert(!html.includes("mode: 'no-cors'"));
 assert(!html.includes('function DiagramEquipment'));
 console.log('PASS: consent validation, durable receipt, duplicate/conflict handling, formula escaping, email failure, unconfigured endpoint, HTTP/JSON/network failures, mismatched receipt. No network or emails used.');
})().catch(e=>{console.error(e);process.exitCode=1});
