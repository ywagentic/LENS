import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import { analyticsMarkup } from './analytics.mjs';
import { renderToString } from 'react-dom/server';
const require = createRequire(import.meta.url);
const origin = 'https://lens-vr.com';
const analyticsConfig = JSON.parse(await readFile('config/analytics.json', 'utf8'));
const analytics = analyticsMarkup(analyticsConfig.cloudflareToken, origin);
const source = await readFile('index.html', 'utf8');
const app = source.split('<script type="text/babel">')[1].split('const root = ReactDOM.createRoot')[0];
await rm('.build', {recursive:true, force:true});
await rm('dist', {recursive:true, force:true});
await mkdir('.build', {recursive:true});
await mkdir('dist', {recursive:true});
const common = `import React from 'react';\n${await readFile('tweaks-panel.jsx','utf8')}\n${await readFile('atlas.jsx','utf8')}\n${app}\nexport {App, parseCSV, normalizeProjects, projectPath, PAGE_PATHS, SHEET_CSV_URL, isPublished};`;
await writeFile('.build/app.jsx', common);
await build({entryPoints:['.build/app.jsx'], outfile:'.build/server.cjs',bundle:true,platform:'node',format:'cjs',packages:'external',define:{'process.env.NODE_ENV':'"production"'}});
const {App,parseCSV,normalizeProjects,projectPath,PAGE_PATHS,SHEET_CSV_URL,isPublished} = require('../.build/server.cjs');
const response = process.env.LENS_CSV_FILE ? null : await fetch(SHEET_CSV_URL,{signal:AbortSignal.timeout(30000)});
if (response && !response.ok) throw new Error(`Catalogue fetch failed: ${response.status}`);
const csv = response ? await response.text() : await readFile(process.env.LENS_CSV_FILE,'utf8');
if (!csv.split(/\r?\n/)[0].split(',').includes('visible')) throw new Error('Catalogue missing publication switch');
const projects = normalizeProjects(parseCSV(csv));
if (new Set(projects.map(p=>p.id)).size !== projects.length) throw new Error('Duplicate project IDs');
await writeFile('.build/client.jsx',`import React from 'react';import {createRoot} from 'react-dom/client';import {App} from './app.jsx';createRoot(document.getElementById('root')).render(<App initialProjects={JSON.parse(document.getElementById('catalogue-data').textContent)} initialPath={window.location.pathname}/>);`);
const built = await build({entryPoints:['.build/client.jsx'],outdir:'dist/assets',entryNames:'app-[hash]',bundle:true,minify:true,metafile:true,define:{'process.env.NODE_ENV':'"production"'}});
const js = '/'+Object.keys(built.metafile.outputs).find(p=>p.endsWith('.js')).replace(/^dist\//,'');
await cp('assets/projects','dist/assets/projects',{recursive:true, filter: source => source === 'assets/projects' || /\.(?:jpg|jpeg|png|webp|avif|svg|gif|ico)$/i.test(source)});
await cp('assets/brand','dist/assets/brand',{recursive:true, filter: source => source === 'assets/brand' || /\.(?:jpg|jpeg|png|webp|avif|svg|gif|ico)$/i.test(source)});
await cp('CNAME','dist/CNAME');
try { await cp('public','dist',{recursive:true}); } catch(error) { if(error.code !== 'ENOENT') throw error; }
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const json = value=>JSON.stringify(value).replaceAll('<','\\u003c');
const pages = {
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
let head = source.split('<head>')[1].split('</head>')[0].replace(/<title>[\s\S]*?<\/title>/,'').replace(/<script[\s\S]*?<\/script>/g,'');
for(const route of [...routes,{path:'/404/',title:'Page not found | LENS',description:'This page is unavailable.',missing:true}]) {
 const url = origin+route.path;
 const picture = origin+(route.project?.thumb || '/assets/brand/lens-youtube-avatar.png');
 const schema = {'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'LENS',description:'A VR digital archive of contemporary urban public spaces for landscape architecture education and research',inLanguage:'en'},
  {'@type':route.project?'WebPage':(['home','browse','atlas'].includes(route.view)?'CollectionPage':'WebPage'),'@id':url+'#webpage',url,name:route.title,description:route.description,isPartOf:{'@id':origin+'/#website'},...(route.project?{about:{'@type':'Place',name:route.project.title,address:route.project.location,url,...(route.project.coordinates?{geo:{'@type':'GeoCoordinates',latitude:Number(route.project.coordinates.split(',')[0]),longitude:Number(route.project.coordinates.split(',')[1])}}:{})}}:{})}
 ]};
 const metadata = `<title>${escape(route.title)}</title><meta name="description" content="${escape(route.description)}"><link rel="canonical" href="${url}"><meta name="robots" content="${route.missing?'noindex, follow':'index, follow'}"><meta property="og:type" content="website"><meta property="og:site_name" content="LENS"><meta property="og:title" content="${escape(route.title)}"><meta property="og:description" content="${escape(route.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${escape(picture)}"><meta name="twitter:card" content="${route.project?'summary_large_image':'summary'}"><script type="application/ld+json">${json(schema)}</script>`;
 const html = `<!DOCTYPE html><html lang="en"><head>${head}${metadata}</head><body><div id="root">${renderToString(React.createElement(App,{initialProjects:projects,initialPath:route.path}))}</div><script id="catalogue-data" type="application/json">${json(projects)}</script><script defer src="${js}"></script>${route.missing ? '' : analytics}</body></html>`;
 const file = route.missing?'dist/404.html':`dist${route.path}index.html`;
 await mkdir(file.slice(0,file.lastIndexOf('/')),{recursive:true});await writeFile(file,html);
}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${origin+r.path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/.nojekyll','');
console.log(`Built ${routes.length} pages for ${projects.filter(isPublished).length} published and ${projects.filter(p=>!isPublished(p)).length} upcoming projects.`);
