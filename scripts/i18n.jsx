// Locale-aware rendering keeps catalogue identities and source text unchanged.
const LENS_MESSAGES = {};
const LENS_LANGUAGES = {
  en:{name:'English',code:'EN',tag:'en'},
  zh:{name:'中文',code:'中文',tag:'zh-Hans'},
  'zh-hant':{name:'繁體中文',code:'中文',tag:'zh-Hant'},
  es:{name:'Español',code:'ES',tag:'es'},
  pt:{name:'Português',code:'PT',tag:'pt-BR'},
  fr:{name:'Français',code:'FR',tag:'fr'},
  ar:{name:'العربية',code:'AR',tag:'ar'},
};
let lensLocale = 'en';
function lensLocaleFromPath(path) { const code=String(path||'/').match(/^\/(zh-hant|zh|es|pt|fr|ar)(?:\/|$)/)?.[1]; return code || 'en'; }
function lensStripLocale(path) { return String(path||'/').replace(/^\/(zh-hant|zh|es|pt|fr|ar)(?=\/|$)/,'') || '/'; }
function lensLocalePath(path, locale=lensLocale) {
  if(typeof path!=='string'||!path.startsWith('/')||path.startsWith('//')||/^\/(?:assets|submissions|api)(?:\/|$)/.test(path))return path;
  const stripped=lensStripLocale(path);
  return locale==='en'?stripped:`/${locale}${stripped.startsWith('/')?stripped:'/'+stripped}`;
}
function lensSetLocale(locale) { lensLocale=LENS_LANGUAGES[locale]?locale:'en'; }
function lensText(value, locale=lensLocale) {
  if(locale==='en'||typeof value!=='string')return value;
  const key=value.trim().replace(/\s+/g,' ');
  if(!key)return value;
  if(key==='s'&&(locale.startsWith('zh')||locale==='ar'))return '';
  if(locale==='ar') {
    if(key.includes(' · ')&&LENS_MESSAGES[locale]?.[key]===undefined)return value.split(' · ').map(part=>lensText(part,locale)).join(' · ');
    const count=key.match(/^(\d+)\s+(views?|projects?|notes?|upcoming)$/i);
    if(count) {
      const noun=count[2].toLowerCase();
      const label=/^view/.test(noun)?'Views':/^project/.test(noun)?'Projects':/^note/.test(noun)?'notes':'Upcoming';
      return lensText(label,locale)+': '+count[1];
    }
  }
  const translated=LENS_MESSAGES[locale]?.[key];
  if(translated===undefined) {
    if(key.startsWith('Show ')&&key.endsWith(' in list'))return lensText('Show {name} in list',locale).replace('{name}',lensText(key.slice(5,-8),locale));
    if(key.startsWith('Watch ')&&key.endsWith(' on YouTube'))return `${lensText('Watch on YouTube',locale)}: ${lensText(key.slice(6,-11),locale)}`;
    if(key.startsWith('View ')&&key.endsWith(' project details'))return `${lensText('View project',locale)}: ${lensText(key.slice(5,-16),locale)}`;
    if (/^\d+\s+(?:views?|Views?|projects?|Projects?|notes?|upvotes?|Upcoming|upcoming)\b/.test(key)) {
      return value.replace(/\b(views?|Views?|projects?|Projects?|notes?|upvotes?|Upcoming|upcoming)\b/g, word => lensText(word,locale));
    }
    if(key.startsWith('· '))return value.match(/^\s*/)[0]+'· '+lensText(key.slice(2),locale);
    if(key.includes(' · '))return value.split(' · ').map(part=>lensText(part,locale)).join(' · ');
    return value;
  }
  return value.match(/^\s*/)[0]+translated+value.match(/\s*$/)[0];
}
function lensFormat(key, values) { return lensText(key).replace(/\{(\w+)\}/g, (_,name)=>String(values[name] ?? '')); }
function lensSearchText(values) { return values.filter(Boolean).flatMap(v=>[String(v),lensText(String(v)),...(lensLocale.startsWith('zh')?[lensText(String(v),'zh'),lensText(String(v),'zh-hant')]:[])]).join(' ').toLocaleLowerCase(); }
function lensCreateElement(type, props, ...children) {
  if((typeof type==='string'&&!['style','script','code','pre'].includes(type))||type===React.Fragment) {
    props=props?{...props}:{};
    if(lensLocale==='ar') {
      if(props.translate==='no')props.dir=props.dir||'ltr';
      if(type==='input'||type==='textarea')props.dir=props.dir||'auto';
      if(props.style) {
        props.style={...props.style};
        if((type==='ul'||type==='ol')&&props.style.paddingLeft!==undefined){props.style.paddingInlineStart=props.style.paddingLeft;delete props.style.paddingLeft;}
        if(props.style.marginLeft==='auto'){props.style.marginInlineStart='auto';delete props.style.marginLeft;}
        if(props.style.textAlign==='left')props.style.textAlign='start';
        if(props.style.textAlign==='right')props.style.textAlign='end';
        if(type==='select'&&props.style.backgroundPosition==='right 10px center'){props.style.backgroundPosition='left 10px center';props.style.padding='8px 12px 8px 28px';}
        if(props.style.fontFamily)props.style.fontFamily='"Noto Sans Arabic", Tahoma, '+props.style.fontFamily;
        if(props.style.letterSpacing)props.style.letterSpacing=0;
      }
    }
    if(type==='option'&&props.value===undefined&&children.length===1&&typeof children[0]==='string')props.value=children[0];
    if(props.translate!=='no') {
      const translate=child=>typeof child==='string'?lensText(child):Array.isArray(child)?child.map(translate):child;
      children=children.map(translate);
      for(const name of ['aria-label','placeholder','title','alt'])if(typeof props[name]==='string')props[name]=lensText(props[name]);
    }
    if(type==='a'&&props.href&&!props['data-language-link'])props.href=lensLocalePath(props.href);
  }
  return React.createElement(type,props,...children);
}
function lensRememberLocale(locale) { try { localStorage.setItem('lens-language',locale); } catch {} }
function LanguageSelector({ pagePath = '/' }) {
  const dialog=React.useRef(null);
  const current=lensLocale;
  const [path,setPath]=React.useState(pagePath);
  return <>
    <button className="language-trigger" type="button" aria-label="Language" onClick={()=>{setPath(window.location.pathname+window.location.search+window.location.hash);dialog.current.showModal();}} style={{font:'inherit',fontSize:11,height:34,padding:'0 8px',border:'1px solid var(--border)',background:'transparent',color:'var(--fg2)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5,flexShrink:0}}>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="3.5" ry="8"/><path d="M2 10h16"/></svg>
      <span translate="no">{LENS_LANGUAGES[current].code}</span>
    </button>
    <dialog ref={dialog} aria-labelledby="language-heading" onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.current.close();}}} style={{margin:'auto',inset:0,width:'min(400px, calc(100vw - 40px))',boxSizing:'border-box',padding:24,border:'1px solid var(--border)',borderRadius:12,background:'var(--bg)',color:'var(--fg)',maxHeight:'calc(100dvh - 40px)',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h2 id="language-heading" style={{fontSize:16,fontWeight:500}}>Language</h2><button type="button" aria-label="Close language selection" onClick={()=>dialog.current.close()} style={{font:'inherit',fontSize:22,border:0,background:'none',color:'var(--fg3)',cursor:'pointer'}}>×</button></div>
      <div style={{display:'grid',gap:4}}>{Object.entries(LENS_LANGUAGES).filter(([code])=>code!=='zh-hant').map(([code,language])=><a key={code} href={lensLocalePath(path,code==='zh'&&current==='zh-hant'?'zh-hant':code)} onClick={()=>lensRememberLocale(code==='zh'&&current==='zh-hant'?'zh-hant':code)} data-language-link="true" dir="auto" lang={language.tag} hrefLang={language.tag} aria-current={(current===code||(code==='zh'&&current==='zh-hant'))?'true':undefined} translate="no" style={{fontSize:14,padding:'11px 12px',border:'1px solid '+((current===code||(code==='zh'&&current==='zh-hant'))?'var(--accent)':'var(--border)'),color:(current===code||(code==='zh'&&current==='zh-hant'))?'var(--accent)':'var(--fg2)',textDecoration:'none',background:(current===code||(code==='zh'&&current==='zh-hant'))?'var(--accent-dim)':'transparent'}}>{language.name}{code==='en'?<span style={{fontSize:11,color:'var(--fg3)',marginLeft:10}}>{lensText('English original')}</span>:null}</a>)}</div>
      <p style={{fontSize:12,lineHeight:1.6,color:'var(--fg3)',margin:'16px 0 0'}}>Translations are generated by Codex. Accuracy is not guaranteed.</p>
    </dialog>
  </>;
}

function ChineseScriptToggle({ pagePath = '/' }) {
  if(!lensLocale.startsWith('zh'))return null;
  const traditional = lensLocale === 'zh-hant';
  const target = traditional ? 'zh' : 'zh-hant';
  const label = traditional ? '切換為簡體中文' : '切换为繁体中文';
  return <a className="chinese-script-toggle" href={lensLocalePath(pagePath,target)} data-language-link="true" translate="no" aria-label={label} title={label} onClick={e=>{e.preventDefault();lensRememberLocale(target);window.location.assign(lensLocalePath(window.location.pathname+window.location.search+window.location.hash,target));}} style={{font:'inherit',fontSize:12,width:28,height:34,border:'1px solid var(--border)',color:'var(--fg2)',display:'inline-flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>{traditional?'简':'繁'}</a>;
}
