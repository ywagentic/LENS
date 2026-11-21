import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
export async function experienceSource(){
 const spaces=JSON.parse(await readFile('config/experience-spaces.json','utf8'));
 const previews=JSON.parse(await readFile('config/experience-previews.json','utf8'));
 for(const rows of Object.values(previews))for(const row of rows){
  if(!/^\/assets\/projects\/previews\/[A-Za-z0-9_-]+\.(jpg|jpeg|png)$/.test(row.src))throw Error('Invalid experience preview URL');
  if(row.crop){const[x,y,w,h]=row.crop,[width,height]=row.size;if(x<0||y<0||w<=0||h<=0||x+w>width||y+h>height)throw Error('Invalid experience crop');row.cropStyle={position:'absolute',width:width/w*100+'%',height:height/h*100+'%',left:-x/w*100+'%',top:-y/h*100+'%',objectFit:'fill'};}
 }
 return (await readFile('scripts/experiences.jsx','utf8')).replace('const FULLSITE_RECORDED_SPACES={};','const FULLSITE_RECORDED_SPACES='+JSON.stringify(spaces)+';').replace('const FULLSITE_SCENE_PREVIEWS={};','const FULLSITE_SCENE_PREVIEWS='+JSON.stringify(previews)+';');
}
export function validateTourCollection(data){
 const byId=new Map();for(const v of data.views){if(byId.has(v.id))throw Error('Duplicate panorama ID');byId.set(v.id,v);}
 for(const v of data.views)for(const link of v.links||[]){const target=byId.get(link.target);if(!target)throw Error('Panorama route points outside collection');if(target.park!==v.park)throw Error('Panorama route crosses project boundary');}
}
export async function writeTourOutput(projects,translations){
 await mkdir('dist/tour',{recursive:true});
 await cp('assets/tours','dist/assets/tours',{recursive:true,filter:p=>p==='assets/tours'||/\.(jpg|jpeg|webp)$/i.test(p)});
 const collections=new Map();
 for(const project of projects){
  if(!['1','true','on','published'].includes(String(project.visible).toLowerCase())||!project.panoramas?.length)continue;
  const name=project.panoramaCollection||'default';if(!collections.has(name))collections.set(name,{parks:[],route:[],views:[]});
  const group=collections.get(name);group.parks.push({id:project.panoramas[0].park,name:project.title});
  for(const v of project.panoramas){
   if(!v.id||!v.code)throw Error('Missing panorama identity');
   for(const date of [v.publishedAt,v.mediaPublishedAt])if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Invalid panorama publication date');
   const pair=project.captures.find(c=>c.code===v.code);if(pair&&pair.publishedAt!==v.publishedAt)throw Error('Paired View publication dates differ');
   if(!/^\/assets\/tours\/[A-Za-z0-9_-]+\.(jpg|jpeg|webp)$/.test(v.panorama))throw Error('Invalid panorama asset');
   if(v.links?.length)group.route.push(v.id);group.views.push(v);
  }
  validateTourCollection(group);
 }
 for(const[name,data]of collections)await writeFile('dist/tour/'+(name==='default'?'tour.json':'tour-'+name+'.json'),JSON.stringify(data).replaceAll('<','\\u003c'));
 await writeFile('dist/tour/locales.js','window.LENS_TOUR_MESSAGES = '+JSON.stringify(translations).replaceAll('<','\\u003c')+';\n');
}
