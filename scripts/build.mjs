import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import * as OpenCC from 'opencc-js';
import { analyticsMarkup } from './analytics.mjs';
import { renderToString } from 'react-dom/server';
const require = createRequire(import.meta.url);
const origin = 'https://lens-vr.com';
const analyticsConfig = JSON.parse(await readFile('config/analytics.json', 'utf8'));
const analytics = analyticsMarkup(analyticsConfig.cloudflareToken, origin);
const source = await readFile('index.html', 'utf8');
const journal = JSON.parse(await readFile(process.env.LENS_JOURNAL_FILE || 'config/journal.json','utf8')).filter(post => post.published === true).sort((a,b)=>b.date.localeCompare(a.date));
if (new Set(journal.map(p=>p.slug)).size !== journal.length) throw new Error('Duplicate journal slugs');
for (const post of journal) {
 if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || !/^\d{4}-\d{2}-\d{2}$/.test(post.date) || (!post.image && !post.title && !post.paragraphs?.length) || (post.paragraphs != null && (!Array.isArray(post.paragraphs) || !post.paragraphs.every(p=>typeof p==='string')))) throw new Error('Invalid journal post');
 if (post.image && !/^\/assets\/(journal|projects)\//.test(post.image)) throw new Error('Journal images must be local');
}
const upcomingProjects = JSON.parse(await readFile('config/upcoming-projects.json', 'utf8'));
const translations = Object.fromEntries(await Promise.all(['zh','es','pt','fr','ar'].map(async code => [code, JSON.parse(await readFile(`config/locales/${code}.json`, 'utf8'))])));
const toTraditional = OpenCC.Converter({from:'cn',to:'t'});
translations['zh-hant'] = Object.fromEntries(Object.entries(translations.zh).map(([key,value])=>[key,toTraditional(value)]));
const i18n = (await readFile('scripts/i18n.jsx','utf8')).replace('const LENS_MESSAGES = {};', 'const LENS_MESSAGES = '+JSON.stringify(translations).replaceAll('<','\\u003c')+';');
const app = source.split('<script type="text/babel">')[1].split('const root = ReactDOM.createRoot')[0].replace('const UPCOMING_PROJECTS = [];', 'const UPCOMING_PROJECTS = ' + JSON.stringify(upcomingProjects).replaceAll('<','\\u003c') + ';').replace('const JOURNAL_POSTS = [];', 'const JOURNAL_POSTS = ' + JSON.stringify(journal).replaceAll('<','\\u003c') + ';');
await rm('.build', {recursive:true, force:true});
await rm('dist', {recursive:true, force:true});
await mkdir('.build', {recursive:true});
await mkdir('dist', {recursive:true});
const common = `import React from 'react';\n${await readFile('scripts/tweaks-production.jsx','utf8')}\n${i18n}\n${await readFile('atlas.jsx','utf8')}\n${app}\nexport {App, parseCSV, normalizeProjects, projectPath, PAGE_PATHS, SHEET_CSV_URL, isPublished, lensText, lensSetLocale, lensLocalePath, lensStripLocale, lensSearchText, lensCreateElement, LENS_LANGUAGES};`;
await writeFile('.build/app.jsx', common);
await build({entryPoints:['.build/app.jsx'], outfile:'.build/server.cjs',bundle:true,jsxFactory:'lensCreateElement',platform:'node',format:'cjs',packages:'external',define:{'process.env.NODE_ENV':'"production"'}});
const {App,parseCSV,normalizeProjects,projectPath,PAGE_PATHS,SHEET_CSV_URL,isPublished,lensText,lensSetLocale,lensLocalePath,LENS_LANGUAGES} = require('../.build/server.cjs');
const response = process.env.LENS_CSV_FILE ? null : await fetch(SHEET_CSV_URL,{signal:AbortSignal.timeout(30000)});
if (response && !response.ok) throw new Error(`Catalogue fetch failed: ${response.status}`);
const csv = response ? await response.text() : await readFile(process.env.LENS_CSV_FILE,'utf8');
if (!csv.split(/\r?\n/)[0].split(',').includes('visible')) throw new Error('Catalogue missing publication switch');
const projects = normalizeProjects([...parseCSV(csv).filter(p => !upcomingProjects.some(a => a.id === p.id)), ...upcomingProjects]);
if (new Set(projects.map(p=>p.id)).size !== projects.length) throw new Error('Duplicate project IDs');
await writeFile('.build/client.jsx',`import React from 'react';import {createRoot} from 'react-dom/client';import {App, lensCreateElement} from './app.jsx';createRoot(document.getElementById('root')).render(<App initialProjects={JSON.parse(document.getElementById('catalogue-data').textContent)} initialPath={window.location.pathname}/>);`);
const built = await build({entryPoints:['.build/client.jsx'],outdir:'dist/assets',entryNames:'app-[hash]',bundle:true,jsxFactory:'lensCreateElement',minify:true,metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
const js = '/'+Object.keys(built.metafile.outputs).find(p=>p.endsWith('.js')).replace(/^dist\//,'');
await cp('assets/projects','dist/assets/projects',{recursive:true, filter: source => source === 'assets/projects' || source === 'assets/projects/views' || /\.(?:jpg|jpeg|png|webp|avif|svg|gif|ico)$/i.test(source)});
const publicBrandAssets = new Set(['apple-touch-icon.png', 'favicon.svg', 'lens-mark.svg', 'lens-youtube-avatar.png']);
await cp('assets/brand','dist/assets/brand',{recursive:true, filter: source => source === 'assets/brand' || publicBrandAssets.has(source.split('/').pop())});
await cp('CNAME','dist/CNAME');
try { await cp('public','dist',{recursive:true, filter: source => {
 const parts = source.split('/').slice(1);
 return !parts.some(part => part.startsWith('.') || /^Icon(?:\r|\?)?$/.test(part) || ['quest-test', 'internal', 'drafts', 'previews'].includes(part));
}}); } catch(error) { if(error.code !== 'ENOENT') throw error; }
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const json = value=>JSON.stringify(value).replaceAll('<','\\u003c');
const pages = {
 releases:['Release History | LENS','Website updates and release history for LENS.'],
 journal:['Journal | LENS','Field notes, new recordings and news from the LENS archive of contemporary urban public spaces.'],
 home:['LENS — Landscape Architecture VR Archive','LENS is a VR digital archive of contemporary urban public spaces for landscape architecture education and research. Explore parks, plazas and waterfronts in 360°.'],
 browse:['Explore Public Spaces in 360° VR | LENS','Browse contemporary urban public spaces in the LENS archive. Explore landscape architecture projects through 360° recordings, design information and sources.'],
 atlas:['Map of Urban Public Spaces in VR | LENS','Locate projects in the LENS VR archive of contemporary urban public spaces. Explore the collection by location, completion year and spatial characteristics.'],
 equipment:['How to View 360° Public Spaces in VR | LENS','Learn how to explore the LENS public space archive using YouTube and VR headsets, including Meta Quest, with practical guidance for classroom viewing.'],
 'for educators':['VR Resources for Landscape Architecture Education | LENS','Use 360° recordings of contemporary urban public spaces to study landscape architecture: spatial scale, drawing from observation and design decisions.'],
 contribute:['Contribute to the Public Space VR Archive | LENS','Document contemporary urban public spaces for landscape architecture education. Read the 360° capture protocol and contribute recordings to LENS.'],
 about:['About LENS — A VR Archive of Urban Public Spaces','LENS is a VR digital archive of contemporary urban public spaces for landscape architecture education and research. Learn about its authorship and licensing.']
};
const routes = Object.entries(PAGE_PATHS).map(([view,path])=>({view,path,title:pages[view][0],description:pages[view][1]}));
for(const p of projects.filter(isPublished)) routes.push({path:projectPath(p),project:p,title:`${p.title}, ${p.location} — 360° VR | LENS`,description:`Explore ${p.title} in ${p.location} through ${(p.captures || []).length} 360° VR recording${(p.captures || []).length === 1 ? '' : 's'}. View project information and sources in the LENS public space archive.`});
try { await cp('assets/journal','dist/assets/journal',{recursive:true,filter:source=>source==='assets/journal'||/\.(jpg|jpeg|png|webp|avif)$/i.test(source)}); } catch(error) { if(error.code !== 'ENOENT') throw error; }
const localizedRoutes = routes.flatMap(route => Object.keys(LENS_LANGUAGES).map(locale => ({...route, basePath:route.path, path:lensLocalePath(route.path,locale),locale})));
let head = source.split('<head>')[1].split('</head>')[0].replace(/<title>[\s\S]*?<\/title>/,'').replace(/<script[\s\S]*?<\/script>/g,'');
for(const route of [...localizedRoutes,{locale:'en',path:'/404/',title:'Page not found | LENS',description:'This page is unavailable.',missing:true}]) {
 lensSetLocale(route.locale);
 const heading = {home:'Contemporary Urban Public Spaces in VR',browse:'Browse',atlas:'Atlas',equipment:'Equipment','for educators':'For Educators',contribute:'Contribute',about:'About LENS',journal:'Journal',releases:'Release history'}[route.view];
 const pageTitle = route.locale==='en'?route.title:(route.project?`${lensText(route.project.title)} — 360° VR | LENS`:`${lensText(heading || 'Page not found')} | LENS`);
 const archiveDescription = 'LENS is a VR digital archive of contemporary urban public spaces for landscape architecture education and research. Explore parks, plazas, waterfronts and other built public spaces through immersive 360° recordings.';
 const pageDescription = route.locale==='en'?route.description:(route.project?lensText(route.project.description || `${route.project.title} · ${route.project.location} · ${route.project.captures.length} Views · 360° VR`):lensText(archiveDescription));
 const alternates = route.missing?'':Object.entries(LENS_LANGUAGES).map(([locale,language])=>`<link rel="alternate" hreflang="${language.tag}" href="${origin+lensLocalePath(route.basePath,locale)}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${origin+route.basePath}">`;
 const url = origin+route.path;
 const picture = origin+(route.project?.thumb || '/assets/brand/lens-youtube-avatar.png');
 const schema = {'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'LENS',description:'A VR digital archive of contemporary urban public spaces for landscape architecture education and research',inLanguage:LENS_LANGUAGES[route.locale].tag},
  {'@type':route.project?'WebPage':(['home','browse','atlas'].includes(route.view)?'CollectionPage':'WebPage'),'@id':url+'#webpage',url,name:pageTitle,description:pageDescription,inLanguage:LENS_LANGUAGES[route.locale].tag,isPartOf:{'@id':origin+'/#website'},...(route.project?{about:{'@type':'Place',name:route.project.title,address:route.project.location,url,...(route.project.coordinates?{geo:{'@type':'GeoCoordinates',latitude:Number(route.project.coordinates.split(',')[0]),longitude:Number(route.project.coordinates.split(',')[1])}}:{})}}:{})}
 ]};
 const metadata = `<title>${escape(pageTitle)}</title><meta name="description" content="${escape(pageDescription)}"><link rel="canonical" href="${url}"><meta name="robots" content="${(route.missing || process.env.LENS_JOURNAL_FILE)?'noindex, follow':'index, follow'}"><meta property="og:type" content="website"><meta property="og:site_name" content="LENS"><meta property="og:title" content="${escape(pageTitle)}"><meta property="og:description" content="${escape(pageDescription)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${escape(picture)}"><meta name="twitter:card" content="${route.project?'summary_large_image':'summary'}"><script type="application/ld+json">${json(schema)}</script>`;
 const html = `<!DOCTYPE html><html lang="${LENS_LANGUAGES[route.locale].tag}" dir="${route.locale==='ar'?'rtl':'ltr'}"><head>${head}${metadata}${alternates}</head><body><div id="root">${renderToString(React.createElement(App,{initialProjects:projects,initialPath:route.path}))}</div><script id="catalogue-data" type="application/json">${json(projects)}</script><script defer src="${js}"></script>${(route.missing || process.env.LENS_JOURNAL_FILE) ? '' : analytics}</body></html>`;
 const file = route.missing?'dist/404.html':`dist${route.path}index.html`;
 await mkdir(file.slice(0,file.lastIndexOf('/')),{recursive:true});await writeFile(file,html);
}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${localizedRoutes.map(r=>`<url><loc>${origin+r.path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/.nojekyll','');
console.log(`Built ${localizedRoutes.length} pages for ${projects.filter(isPublished).length} published and ${projects.filter(p=>!isPublished(p)).length} upcoming projects.`);
