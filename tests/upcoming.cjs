const assert = require('node:assert/strict');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {App, normalizeProjects, projectPath} = require('../.build/server.cjs');
const row = {id:21,title:'Upcoming test park',location:'Shenzhen, China',designer:'Test studio',year:2024,visible:'upcoming',tags:['Urban'],type:'Urban Park',vrId:'abcdefghijk',expectedRelease:'2026-09-26'};
const render = (visible,path='/') => renderToStaticMarkup(React.createElement(App,{initialProjects:normalizeProjects([{...row,visible}]),initialPath:path}));
for(const path of ['/','/browse/']) {
 const preview=render('upcoming',path);
 assert(preview.includes('data-publication="upcoming"'));
 assert(preview.includes(row.title));
 assert(preview.includes('opacity:0.5;filter:grayscale(1)'));
 assert(!preview.includes(`href="${projectPath(row)}"`));
 assert(!preview.includes('watch?v=abcdefghijk'));
 assert(!render('0',path).includes(row.title));
 const published=render('1',path);
 assert(!published.includes('data-publication="upcoming"'));
 assert(published.includes(`href="${projectPath(row)}"`));
}
assert(render('upcoming',projectPath(row)).includes('Page not found'));
assert(render('1',projectPath(row)).includes('watch?v=abcdefghijk'));
assert(!render('upcoming','/atlas/').includes(row.title));
console.log('PASS: upcoming → published → hidden rendering, no preview playback/detail links, and Atlas exclusion.');
