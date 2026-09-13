// Build the normal site first. This produces a local-only preview of a hidden draft.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import { renderToString } from 'react-dom/server';
const require = createRequire(import.meta.url);
const { App, normalizeProjects, projectPath } = require('../.build/server.cjs');
const draftFile = process.argv[2];
if (!draftFile) throw new Error('Usage: node scripts/preview-project.mjs drafts/project.json');
const draft = JSON.parse(await readFile(draftFile, 'utf8'));
if (String(draft.visible) !== '0') throw new Error('Preview requires a hidden draft');
const template = await readFile('dist/index.html', 'utf8');
const live = JSON.parse(template.match(/id="catalogue-data" type="application\/json">(.*?)<\/script>/s)[1]);
const projects = [...live.filter(p => p.id !== draft.id), ...normalizeProjects([{...draft, visible:'1'}])];
const path = projectPath(draft);
await rm('.preview', {recursive:true, force:true});
await cp('dist', '.preview', {recursive:true});
await writeFile('.build/preview.jsx', `import React from 'react';import {createRoot} from 'react-dom/client';import {App} from './app.jsx';createRoot(document.getElementById('root')).render(<App initialProjects={JSON.parse(document.getElementById('catalogue-data').textContent)} initialPath={window.location.pathname} freezeCatalogue={true}/>);`);
await build({entryPoints:['.build/preview.jsx'],outfile:'.preview/assets/preview.js',bundle:true,minify:true,define:{'process.env.NODE_ENV':'"production"'}});
const escape = s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const head = template.split('<head>')[1].split('</head>')[0]
 .replace(/<title>[\s\S]*?<\/title>/,`<title>Preview — ${escape(draft.title)} | LENS</title>`)
 .replace(/<meta name="robots"[^>]*>/,'<meta name="robots" content="noindex, nofollow">')
 .replace(/<link rel="canonical"[^>]*>/,'')
 .replace(/<meta (?:property="og:|name="twitter:)[^>]*>/g,'')
 .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'');
const markup = renderToString(React.createElement(App,{initialProjects:projects,initialPath:path,freezeCatalogue:true}));
await mkdir(`.preview${path}`,{recursive:true});
await writeFile(`.preview${path}index.html`,`<!DOCTYPE html><html lang="en"><head>${head}</head><body><div id="root">${markup}</div><script id="catalogue-data" type="application/json">${JSON.stringify(projects).replaceAll('<','\\u003c')}</script><script defer src="/assets/preview.js"></script></body></html>`);
await writeFile('.preview/robots.txt','User-agent: *\nDisallow: /\n');
console.log(`Local preview: ${path} — serve .preview; never deploy this directory.`);
