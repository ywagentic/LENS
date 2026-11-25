const FULLSITE_LAYOUT='compact';
const FULLSITE_RECORDED_SPACES={};
const FULLSITE_SCENE_PREVIEWS={};
const FULLSITE_MODES={recordings:['Immersive Video','Watch recordings','Observe a place over time, with movement and sound.'],panoramas:['360° Views','Explore panoramas','Look around freely and choose viewpoints; follow arrows where a route is available.']};
function fullsiteModeTitle(project,mode){return mode==='panoramas'&&project.panoramas?.some(v=>v.links?.length)?'360° Tour':FULLSITE_MODES[mode][0];}
function fullsiteModeCount(project,mode){if(mode==='recordings')return project.captures.length;const views=project.panoramas||[],routed=views.filter(v=>v.links?.length);return FULLSITE_LAYOUT==='compact'?views.length:routed.length||views.length;}
function fullsiteModes(p){return Object.keys(FULLSITE_MODES).filter(m=>(m==='recordings'?p.captures:p.panoramas||[]).length);}
function FullsiteAvailability({project}){return <div className="fullsite-availability">{fullsiteModes(project).map(mode=><span key={mode}>{fullsiteModeTitle(project,mode)} · {fullsiteModeCount(project,mode)}</span>)}</div>;}
function fullsiteCompactPreviews(project,mode){
 const views=mode==='recordings'?project.captures:(project.panoramas||[]);
 const available=mode==='panoramas'?views:views.filter(v=>(FULLSITE_SCENE_PREVIEWS[project.id]||[]).some(p=>p.code===v.code)||project.panoramaCollection==='love'&&project.panoramas?.some(p=>p.code===v.code));
 return available.slice(0,4).map(v=>{
  const scene=(FULLSITE_SCENE_PREVIEWS[project.id]||[]).find(p=>p.code===v.code);
  const panorama=project.panoramas?.find(p=>p.code===v.code);
  let src=mode==='panoramas'?v.preview:project.panoramaCollection==='love'?panorama?.preview:null;
  if(src&&!src.startsWith('/'))src='/tour/'+src;
  return {id:mode==='recordings'?v.vrId:v.id,name:v.label||v.name,src:src||scene?.src||v.thumb,cropStyle:!src?scene?.cropStyle:undefined};
 });
}
function FullsiteCompactChoices({project,onChoose}){
 const pano=project.panoramas||[],linked=pano.filter(v=>v.links?.length).length;
 return <section className="fullsite-compact-choices"><h2>Available experiences</h2><div className="fullsite-mode-cards">{['recordings','panoramas'].map(mode=>{
  const video=mode==='recordings',views=video?project.captures:pano,enabled=views.length>0,previews=fullsiteCompactPreviews(project,mode);
  const title=video?'Immersive Video':linked||!enabled?'360° Tour':'360° Views';
  const description=video?'Immersive 360° video lets you experience activities in a space, people’s interactions with it, and its ambient sounds.':linked||!enabled?'A connected, navigable sequence of static viewpoints helps you understand spatial sequences across a wider area.':'Static 360° panoramas from several viewpoints.';
  return <article key={mode} className={'fullsite-mode-card'+(!enabled?' unavailable':'')} data-mode={mode}>
   <h3>{title}</h3><div className="fullsite-mode-description"><p>{description}</p>{!video&&linked>0&&linked<pano.length&&<p>Some viewpoints are linked as a tour.</p>}{!video&&!linked&&enabled&&<p>Choose a viewpoint from the list. These viewpoints are not linked as a tour.</p>}{video&&views.some(v=>v.mediaType==='Static 360° Panorama')&&<p>This project also includes videos made from still panoramas.</p>}</div>
   <p className="fullsite-mode-total">{lensText('Available viewpoints: {count}.').replace('{count}',views.length)}</p>
   <div className="fullsite-mode-previews">{Array.from({length:4},(_,i)=>previews[i]?<div key={previews[i].id} className="fullsite-mode-preview"><img src={previews[i].src} alt={previews[i].name} style={previews[i].cropStyle} decoding="async"/></div>:<div key={'empty-'+i} className="fullsite-mode-empty" aria-hidden="true"/>)}</div>
   <div className="fullsite-mode-action"><button disabled={!enabled} onClick={()=>onChoose(mode)}>{video?'Watch recordings':'Explore panoramas'}<span aria-hidden="true"> {enabled?'↗':''}</span></button>{!enabled&&<p>Unavailable for this project</p>}</div>
  </article>;
 })}</div></section>;
}
function FullsiteCompactEntry({project,onChoose}){
 return <><header className="fullsite-compact-intro"><div className="fullsite-compact-identity"><p className="fullsite-compact-location">{project.location}</p><h1>{project.title}</h1><section aria-label={lensText('Recorded spaces')}><p className="fullsite-recorded-label">Recorded spaces</p><ul className="fullsite-recorded-spaces">{(FULLSITE_RECORDED_SPACES[project.id]||projectViews(project).slice(0,5).map(v=>v.label||v.name)).map(space=><li key={space}>{space}</li>)}</ul></section></div></header><FullsiteCompactChoices project={project} onChoose={onChoose}/></>;
}
function FullsiteExperienceNav({project,experience,onChoose}){return <div className="fullsite-experience-nav"><div>{fullsiteModes(project).map(mode=><button key={mode} aria-pressed={mode===experience} onClick={()=>onChoose(mode)}>{fullsiteModeTitle(project,mode)}</button>)}</div></div>;}
function FullsitePanorama({project,initialView,onView}){
 const views=project.panoramas||[],iframe=useRef(null),[selected,setSelected]=useState(()=>views.find(v=>v.id===initialView)||views[0]);
 const [request,setRequest]=useState(()=>views.find(v=>v.id===initialView)||views[0]);
 useEffect(()=>{const receive=event=>{if(event.origin!==location.origin||event.source!==iframe.current?.contentWindow||event.data?.type!=='lens-view-state')return;const view=views.find(v=>v.id===event.data.view);if(view){setSelected(view);onView(view.id);}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[project]);
 const src='/tour/?embed=1&lang='+lensLocale+'&view='+request.id+(project.panoramaCollection==='love'?'&collection=love':'');
 return <section className="fullsite-panorama"><p>{FULLSITE_MODES.panoramas[2]}</p><div className="fullsite-panorama-frame"><iframe ref={iframe} key={request.id+':'+lensLocale} src={src} title={selected.name} allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope" allowFullScreen/></div><div className="fullsite-active-point"><bdi dir="ltr">{selected.code}</bdi><h2>{selected.name}</h2></div><details className="fullsite-point-picker" open><summary><span>Viewpoints</span><bdi dir="ltr">{views.length}</bdi></summary><div className="fullsite-points">{views.map(v=><button key={v.id} aria-current={selected.id===v.id?'true':undefined} onClick={()=>{setSelected(v);setRequest(v);onView(v.id);}}><img src={v.thumb} alt={v.name}/><bdi dir="ltr">{v.code}</bdi><span>{v.name}</span></button>)}</div></details></section>;
}
function fullsiteProjectHref(project,values={}){const url=new URL(projectPath(project),typeof location==='undefined'?'http://localhost':location.origin);url.searchParams.set('from',typeof location==='undefined'?'/':location.pathname+location.search+location.hash);for(const[k,v]of Object.entries(values))if(v)url.searchParams.set(k,v);return url.pathname+url.search+url.hash;}
function fullsiteScrollKey(href){const u=new URL(href,location.origin);return lensStripLocale(u.pathname)+u.search;}
function fullsiteReturnContext(){
 const fallback={target:lensLocalePath('/browse/'),label:'Browse'};
 if(typeof location==='undefined')return fallback;
 try{
  const from=new URL(new URLSearchParams(location.search).get('from')||'/browse/',location.origin);
  if(from.origin!==location.origin)return fallback;
  const pathname=lensStripLocale(from.pathname),labels={'/browse/':'Browse','/atlas/':'Atlas','/equipment/':'Equipment','/contribute/':'Contribute','/for-educators/':'For Educators','/journal/':'Journal','/about/':'About','/releases/':'Release history'};
  const label=pathname==='/'?'Home':Object.entries(labels).find(([prefix])=>pathname===prefix||pathname.startsWith(prefix))?.[1];
  return label?{target:lensLocalePath(from.pathname+from.search+from.hash),label}:fallback;
 }catch{return fallback;}
}
function fullsiteBack(){const {target}=fullsiteReturnContext();try{sessionStorage.setItem('lens-fullsite-restore',fullsiteScrollKey(target));}catch{}location.assign(target);}
function fullsiteRestoreScroll(){try{if(sessionStorage.getItem('lens-fullsite-restore')===fullsiteScrollKey(location.href)){const y=Number(sessionStorage.getItem('lens-fullsite-scroll:'+fullsiteScrollKey(location.href)))||0;sessionStorage.removeItem('lens-fullsite-restore');requestAnimationFrame(()=>requestAnimationFrame(()=>scrollTo(0,y)));}}catch{}}
function fullsiteBrowseHref(values){const u=new URL(typeof location==='undefined'?'/browse/':location.href,typeof location==='undefined'?'http://localhost':location.origin);for(const[k,v]of Object.entries(values)){if(v&&v!=='all'&&v!=='All')u.searchParams.set(k,v);else u.searchParams.delete(k);}return u.pathname+u.search+u.hash;}

function fullsiteViews(p,mode='all'){return [...(mode==='panoramas'?[]:p.captures||[]),...(mode==='recordings'?[]:(p.panoramas||[]).map(v=>({...v,label:v.name,panoramaPoint:true})))];}
