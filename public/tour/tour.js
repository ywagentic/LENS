/* LENS panorama viewer. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const languages = {en:'English',zh:'简体中文','zh-hant':'繁體中文',es:'Español',pt:'Português',fr:'Français',ar:'العربية'};
  const params = new URLSearchParams(location.search);
  const hasRoute=parkId=>data.route.length>1&&data.route.some(id=>data.views.some(v=>v.id===id&&v.park===parkId));
  let saved;
  try { saved = localStorage.getItem('lens-language'); } catch {}
  const browserLang = navigator.language.toLowerCase();
  const detected = browserLang.startsWith('zh') ? (/hant|tw|hk|mo/.test(browserLang)?'zh-hant':'zh') : browserLang.split('-')[0];
  let locale = [params.get('lang'),saved,detected,'en'].find(code=>languages[code]);
  let data, current, park='huqiu', tab='guided', filter='', token=0, busy=true, ready=false, inVR=false;
  let activeTexture=null, labelTextures=[], lastVrMessage='', errorRetry=null;
  let flatDrag;
  const destinationGate=window.createLensDestinationGate();
  let immersiveSupport;
  function checkImmersiveSupport(){
    if(navigator.xr)navigator.xr.isSessionSupported('immersive-vr').then(value=>{immersiveSupport=value;}).catch(()=>{immersiveSupport=false;});
  }
  checkImmersiveSupport();
  navigator.xr?.addEventListener('devicechange',checkImmersiveSupport);
  const cache = new Map();
  const scene=$('scene'), sky=$('panorama'), camera=$('camera'), rig=$('rig'), world=$('nav-world');
  const t = key => window.LENS_TOUR_MESSAGES?.[locale]?.[key] || key;
  const name = view => t(view.name);
  const degrees = u => (u-.5)*360;
  const parkViews = () => data.views.filter(view=>view.park===park);
  const setText = (id,value) => { $(id).textContent=value; };
  function updateURL() {
    const next=new URL(location.href); next.searchParams.set('lang',locale);
    if(current) next.searchParams.set('view',current.id);
    if(filter) next.searchParams.set('space',filter); else next.searchParams.delete('space');
    history.replaceState(null,'',next.pathname+next.search+next.hash);
  }
  async function notice(message,retry=null) {
    lastVrMessage=message; errorRetry=retry; setText('notice-text',t(message));
    $('retry').hidden=!retry;
    // Ordinary HTML dialogs are not visible inside immersive sessions.
    // End immersion before presenting a load/permission error and its retry control.
    if(inVR){try{await scene.exitVR();}catch{}}
    if(!$('notice').open) $('notice').showModal();
  }
  function translateUI() {
    document.documentElement.lang=locale==='zh'?'zh-Hans':locale==='zh-hant'?'zh-Hant':locale;
    document.documentElement.dir=locale==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
    document.querySelectorAll('[data-title]').forEach(el=>{el.title=t(el.dataset.title);el.setAttribute('aria-label',t(el.dataset.title));});
    $('viewer').setAttribute('aria-label',t('Panorama tour'));
    document.querySelector('.view-section').setAttribute('aria-label',t('Choose a view'));
    $('language').value=locale;
    if(lastVrMessage) setText('notice-text',t(lastVrMessage));
    if(data) {
      $('park').replaceChildren(...data.parks.map(p=>new Option(t(p.name),p.id)));
      $('park').value=park;
      setText('park-title',t(data.parks.find(p=>p.id===park).name));
      const tags=[...new Set(parkViews().filter(v=>tab!=='guided'||data.route.includes(v.id)).flatMap(v=>v.spaceTypes))];
      if(filter&&!tags.includes(filter))filter='';
      $('space-filter').replaceChildren(new Option(t('All views'),''),...tags.map(tag=>new Option(t(tag),tag)));
      $('space-filter').value=filter;
      $('guided').disabled=!hasRoute(park);
      $('guided').setAttribute('aria-selected',String(tab==='guided'));
      $('all').setAttribute('aria-selected',String(tab==='all'));
      if(current) { renderCurrent(); renderHotspots(); }
      renderCards();
    }
    updateURL();
  }
  function renderCurrent() {
    setText('scene-title',name(current)); setText('scene-code',current.code);
    setText('date',current.capturedAt); setText('tags',current.spaceTypes.map(t).join(' · '));
    $('off-route').hidden=!hasRoute(park)||data.route.includes(current.id);
    document.title=`${name(current)} · LENS`;
  }
  function renderCards() {
    const views=parkViews().filter(view=>(tab!=='guided'||data.route.includes(view.id))&&(!filter||view.spaceTypes.includes(filter)));
    setText('view-count',`${t('Views')} · ${views.length}`);
    const cards=views.map(view=>{
      const button=document.createElement('button'); button.className='view-card'; button.dataset.view=view.id;
      button.setAttribute('aria-current',String(current?.id===view.id));button.setAttribute('aria-label',`${view.code} · ${name(view)}`);
      const image=new Image();image.src=view.thumb;image.alt=name(view);image.loading='lazy';
      const code=document.createElement('span');code.className='card-code';code.textContent=view.code;code.dir='ltr';
      const label=document.createElement('span');label.className='card-name';label.textContent=name(view);
      const dot=document.createElement('span');dot.className='card-active';dot.setAttribute('aria-hidden','true');
      button.append(image,code,label,dot);button.onclick=()=>navigate(view.id);
      return button;
    });
    $('view-list').replaceChildren(...cards);
  }
  function imageFor(url) {
    if(cache.has(url)) { const value=cache.get(url);cache.delete(url);cache.set(url,value);return value; }
    const image=new Image();image.decoding='async';
    const promise=new Promise((resolve,reject)=>{
      image.onload=()=>{ image.decode().then(()=>resolve(image),()=>resolve(image)); };
      image.onerror=()=>{cache.delete(url);reject(new Error('Panorama failed: '+url));};
    });
    image.src=url;cache.set(url,promise);
    while(cache.size>3)cache.delete(cache.keys().next().value);
    return promise;
  }
  function applyImage(image) {
    const mesh=sky.getObject3D('mesh');
    if(!mesh)throw new Error('Panorama mesh unavailable');
    const limit=Math.min(6144,scene.renderer.capabilities.maxTextureSize);
    let bitmap=image;
    if(image.naturalWidth>limit){bitmap=document.createElement('canvas');bitmap.width=limit;bitmap.height=limit/2;bitmap.getContext('2d').drawImage(image,0,0,bitmap.width,bitmap.height);}
    const texture=new AFRAME.THREE.Texture(bitmap);texture.colorSpace=AFRAME.THREE.SRGBColorSpace;texture.needsUpdate=true;
    texture.minFilter=AFRAME.THREE.LinearFilter;texture.generateMipmaps=false;
    mesh.material.map=texture;mesh.material.color.set('#ffffff');mesh.material.needsUpdate=true;
    const previous=activeTexture;activeTexture=texture;previous?.dispose();
  }
  function heading(u) {
    flatDrag?.stop();
    const controls=camera.components['look-controls'];
    if(!inVR){
      if(controls?.yawObject)controls.yawObject.rotation.y=0;
      if(controls?.pitchObject)controls.pitchObject.rotation.x=0;
      camera.object3D.rotation.set(0,0,0);
      rig.object3D.rotation.y=AFRAME.THREE.MathUtils.degToRad(-degrees(u));
    }
    // In immersive mode retain the viewer's real orientation; never force a head turn.
  }
  async function navigate(id,u) {
    const view=data.views.find(v=>v.id===id); if(!view)return;
    flatDrag?.stop();
    const seq=++token;busy=true;$('loading').hidden=false;$('shade').classList.add('on');
    $('hotspots').replaceChildren();world.object3D.visible=false;
    try {
      const preview=await imageFor(view.preview);if(seq!==token)return;
      applyImage(preview);current=view;park=view.park;
      heading(u??view.initialU);renderCurrent();renderCards();renderHotspots();updateURL();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));if(seq!==token)return;
      busy=false;ready=true;world.object3D.visible=true;$('loading').hidden=true;$('shade').classList.remove('on');
      imageFor(view.panorama).then(image=>{if(seq===token)applyImage(image);}).catch(()=>{
        if(seq===token)notice('Panorama could not be loaded. Try again.',()=>{cache.delete(view.panorama);navigate(id,u);});
      });
      // Warm only adjacent route views, not the entire archive.
      for(const link of view.links){const next=data.views.find(v=>v.id===link.target);if(next)imageFor(next.preview).catch(()=>{});}
      if(window.parent!==window)window.parent.postMessage({type:'lens-view-state',view:view.id,mode:'panoramas'},location.origin);
    } catch(error) {
      if(seq!==token)return;busy=false;$('loading').hidden=true;$('shade').classList.remove('on');
      if(current){park=current.park;if(tab==='guided'&&!data.route.includes(current.id))tab='all';translateUI();world.object3D.visible=true;}
      notice('Panorama could not be loaded. Try again.',()=>navigate(id,u));
    }
  }
  function canvasLabel(text){
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
    const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(14,39,26,.94)';ctx.fillRect(0,0,768,160);
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=locale==='ar'?'rtl':'ltr';
    let fontSize=40;do{ctx.font=`500 ${fontSize}px "${locale==='ar'?'Noto Sans Arabic':'Inter'}", sans-serif`;fontSize-=2;}while(ctx.measureText(text).width>716&&fontSize>20);
    ctx.fillText(text,384,80,720);
    const texture=new AFRAME.THREE.CanvasTexture(canvas);texture.colorSpace=AFRAME.THREE.SRGBColorSpace;labelTextures.push(texture);return texture;
  }
  function renderHotspots() {
    if(!current)return;
    $('hotspots').replaceChildren();world.replaceChildren();
    labelTextures.forEach(texture=>texture.dispose());labelTextures=[];
    for(const link of current.links){
      const target=data.views.find(v=>v.id===link.target);
      if(link.presentation==='destination'){
        const select=event=>{if(busy)return;const isGaze=event?.detail?.cursorEl===$('gaze');if(!destinationGate.activate({inVR,isGaze}))return;if(inVR)syncInputMode();navigate(target.id,link.arrivalU);};
        const button=document.createElement('button');button.className='destination-link';button.dataset.target=target.id;button.setAttribute('aria-label',name(target));
        const caption=document.createElement('span');caption.textContent=name(target);caption.dir='auto';
        const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');button.append(caption,arrow);button.onclick=select;$('hotspots').append(button);
        // Floating destination UI, not a geographical ground bearing. World-fixed so gaze can leave it.
        const radians=AFRAME.THREE.MathUtils.degToRad(degrees(current.initialU));
        const node=document.createElement('a-entity');node._destination=true;node.setAttribute('position',Math.sin(radians)*3+' -.65 '+(-Math.cos(radians)*3));node.setAttribute('rotation','0 '+(-degrees(current.initialU))+' 0');node.setAttribute('visible',inVR);
        const panel=document.createElement('a-plane');panel.classList.add('nav-hit');panel.setAttribute('width','2');panel.setAttribute('height','.4167');panel.setAttribute('material','shader:flat; transparent:true; side:double');
        panel.addEventListener('loaded',()=>{const mesh=panel.getObject3D('mesh');if(panel.isConnected&&mesh){mesh.material.map=canvasLabel(name(target)+' →');mesh.material.needsUpdate=true;}});
        panel.addEventListener('click',select);node.append(panel);world.append(node);continue;
      }
      const radians=AFRAME.THREE.MathUtils.degToRad(degrees(link.u));
      const position=new AFRAME.THREE.Vector3(Math.sin(radians)*4.5,-1.4,-Math.cos(radians)*4.5);
      const node=document.createElement('a-entity');node.setAttribute('position',`${position.x} ${position.y} ${position.z}`);
      const disk=document.createElement('a-circle');disk.classList.add('nav-hit');disk.setAttribute('radius','.44');disk.setAttribute('rotation','-90 0 0');disk.setAttribute('material','shader:flat; color:#183c29; opacity:.78; side:double');
      const ring=document.createElement('a-ring');ring.setAttribute('radius-inner','.33');ring.setAttribute('radius-outer','.385');ring.setAttribute('rotation','-90 0 0');ring.setAttribute('position','0 .012 0');ring.setAttribute('material','shader:flat; color:#ffffff; side:double');
      // A chevron, with physical scene geometry shared by mouse and XR raycasters.
      const chevron=document.createElement('a-entity');chevron.setAttribute('rotation',`0 ${-degrees(link.u)} 0`);chevron.setAttribute('position','0 .02 0');
      for(const side of [-1,1]){const bar=document.createElement('a-plane');bar.setAttribute('width','.23');bar.setAttribute('height','.06');bar.setAttribute('rotation',`-90 0 ${-side*40}`);bar.setAttribute('position',`${side*.075} 0 -.03`);bar.setAttribute('material','shader:flat; color:#ffffff; side:double');chevron.append(bar);}
      const label=document.createElement('a-plane');label.setAttribute('width','1.5');label.setAttribute('height','.3125');label.setAttribute('position','0 .55 0');label.setAttribute('material','shader:flat; transparent:true; side:double');label.setAttribute('visible',false);
      label.addEventListener('loaded',()=>{const mesh=label.getObject3D('mesh');if(label.isConnected&&mesh){mesh.material.map=canvasLabel(name(target));mesh.material.needsUpdate=true;}});
      const select=()=>{if(!busy)navigate(target.id,link.arrivalU);};
      disk.addEventListener('click',select);
      disk.addEventListener('mouseenter',()=>{disk.setAttribute('material','color','#1f8a5b');if(inVR)label.setAttribute('visible',true);});
      disk.addEventListener('mouseleave',()=>{disk.setAttribute('material','color','#183c29');label.setAttribute('visible',false);});
      node.append(disk,ring,chevron,label);world.append(node);
      const button=document.createElement('button');button.className='hotspot';button.dataset.target=target.id;
      button.setAttribute('aria-label',name(target));button.title=name(target);button.onclick=select;
      const tip=document.createElement('span');tip.className='hotspot-label';tip.textContent=name(target);button.append(tip);$('hotspots').append(button);
      button._position=position;button._label=label;
    }
  }
  function projectHotspots(){
    if(ready&&scene.camera){
      if(inVR&&destinationGate.locked&&!busy){
        const panels=[...world.children].filter(node=>node._destination).map(node=>node.children[0]?.getObject3D('mesh')).filter(Boolean);
        if(panels.length){
          world.object3D.updateMatrixWorld(true);
          const origin=new AFRAME.THREE.Vector3(),direction=new AFRAME.THREE.Vector3();
          $('gaze').object3D.getWorldPosition(origin);$('gaze').object3D.getWorldDirection(direction);direction.negate();
          const ray=new AFRAME.THREE.Raycaster(origin,direction,0,20);
          if(destinationGate.observe({ready:true,intersects:ray.intersectObjects(panels,false).length>0}))syncInputMode();
        }
      }
      const bounds=$('viewer').getBoundingClientRect();
      const matrix=new AFRAME.THREE.Matrix4().multiplyMatrices(scene.camera.projectionMatrix,scene.camera.matrixWorldInverse);
      const frustum=new AFRAME.THREE.Frustum().setFromProjectionMatrix(matrix);
      for(const button of $('hotspots').children){
        if(button.classList.contains('destination-link')){button.hidden=inVR||busy;continue;}
        const p=button._position.clone().project(scene.camera);const visible=!inVR&&!busy&&frustum.containsPoint(button._position)&&Math.abs(p.x)<.96&&Math.abs(p.y)<.83;
        button.hidden=!visible;if(visible){button.style.left=(p.x+1)*.5*bounds.width+'px';button.style.top=(1-p.y)*.5*bounds.height+'px';}
      }
      for(const node of world.children){const label=node.children[3];if(label?.object3D){const eye=new AFRAME.THREE.Vector3();camera.object3D.getWorldPosition(eye);label.object3D.lookAt(eye);}}
    }
    requestAnimationFrame(projectHotspots);
  }
  async function enterVR(){
    flatDrag?.stop();
    if(inVR){await scene.exitVR();return;}
    if(!window.isSecureContext){notice('Headset access requires HTTPS or a secure localhost connection.');return;}
    if(!navigator.xr){notice('VR is not available on this device or in this browser. Try a WebXR-capable headset browser.');return;}
    try {
      if(immersiveSupport===false){notice('VR is not available on this device or in this browser. Try a WebXR-capable headset browser.');return;}
      // No asynchronous capability probe between the user's click and requestSession.
      await scene.enterVR();
    } catch(error){notice('VR could not start. Check your headset connection and browser permission.');}
  }
  $('language').replaceChildren(...Object.entries(languages).map(([code,label])=>new Option(label,code)));
  $('language').onchange=()=>{locale=$('language').value;try{localStorage.setItem('lens-language',locale);}catch{}translateUI();};
  $('park').onchange=()=>{park=$('park').value;tab=hasRoute(park)?'guided':'all';filter='';translateUI();navigate(data.route.find(id=>data.views.some(v=>v.id===id&&v.park===park))||parkViews()[0].id);};
  $('space-filter').onchange=()=>{filter=$('space-filter').value;renderCards();updateURL();};
  for(const [id,value]of[['guided','guided'],['all','all']])$(id).onclick=()=>{tab=value;filter='';translateUI();};
  $('back-route').onclick=()=>{tab='guided';filter='';translateUI();navigate(data.route[0]);};
  $('reset').onclick=()=>{if(current)heading(current.initialU);};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewer').requestFullscreen();}catch{}};
  document.addEventListener('fullscreenchange',()=>{const key=document.fullscreenElement?'Exit fullscreen':'Fullscreen';$('fullscreen').dataset.title=key;$('fullscreen').title=t(key);$('fullscreen').setAttribute('aria-label',t(key));});
  $('vr').onclick=enterVR;
  document.querySelector('.dialog-close').onclick=()=>$('notice').close();
  $('retry').onclick=()=>{$('notice').close();errorRetry?.();};
  let tracked=0;
  function syncInputMode(){for(const node of world.children)if(node._destination)node.setAttribute('visible',inVR);const enabled=inVR&&!tracked;$('gaze').setAttribute('visible',enabled);$('gaze').setAttribute('raycaster','enabled',enabled);$('gaze').setAttribute('cursor','fuse',enabled&&!destinationGate.locked);if(!enabled||destinationGate.locked)$('gaze').components.cursor?.clearCurrentIntersection(true);}
  scene.addEventListener('enter-vr',()=>{flatDrag?.stop();inVR=true;document.body.classList.add('in-vr');syncInputMode();});
  scene.addEventListener('exit-vr',()=>{inVR=false;destinationGate.reset();document.body.classList.remove('in-vr');syncInputMode();});
  scene.querySelectorAll('[laser-controls]').forEach(controller=>{controller.addEventListener('controllerconnected',()=>{tracked++;syncInputMode();});controller.addEventListener('controllerdisconnected',()=>{tracked=Math.max(0,tracked-1);syncInputMode();});});
  translateUI();
  Promise.all([fetch(params.get('collection')==='love'?'tour-love.json':'tour.json').then(response=>{if(!response.ok)throw new Error('Missing tour');return response.json();}),new Promise(resolve=>{if(scene.hasLoaded)resolve();else scene.addEventListener('loaded',resolve,{once:true});})]).then(([tour])=>{
    data=tour;
    flatDrag=window.installLensDrag({canvas:scene.canvas,controls:()=>camera.components['look-controls'],enabled:()=>!inVR&&!busy,sensitivity:0.002,direction:1});
    const chosen=data.views.find(v=>v.id===params.get('view'))||data.views.find(v=>v.id===data.route[0])||data.views[0];
    park=chosen.park;tab=data.route.includes(chosen.id)?'guided':'all';filter=params.get('space')||'';
    translateUI();navigate(chosen.id);projectHotspots();
  }).catch(()=>notice('Panorama could not be loaded. Try again.',()=>location.reload()));
})();
