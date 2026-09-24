let DATA, EXTRA, PERSONAL;
const TABMETA={
  writing:{en:"Writing",de:"Publizistik",es:"Escritos"},
  publications:{en:"Publications",de:"Publikationen",es:"Publicaciones"},
  talks:{en:"Talks",de:"Vorträge",es:"Charlas"},
  experience:{en:"Experience",de:"Erfahrung",es:"Experiencia"},
  education:{en:"Education",de:"Ausbildung",es:"Formación"},
  training:{en:"Training",de:"Weiterbildung",es:"Formación continua"},
};
/* The hub splits publications in two: peer-reviewed, and everything else in one list by
   year, each row naming its own category (cv.json keeps the finer categories, and the
   CV page shows them). */
const PUBGRP={
  peerReviewed:{en:"Peer-reviewed",de:"Begutachtet",es:"Revisadas por pares"},
  notPeerReviewed:{en:"Not peer-reviewed",de:"Nicht begutachtet",es:"Sin revisión por pares"},
};
const PUBTYPE={
  policyPapers:{en:"Policy paper",de:"Policy Paper",es:"Documento de política"},
  guides:{en:"Guide",de:"Leitfaden",es:"Guía"},
  datasets:{en:"Dataset",de:"Datensatz",es:"Conjunto de datos"},
  preprints:{en:"Preprint",de:"Preprint",es:"Preprint"},
  other:{en:"Other",de:"Sonstiges",es:"Otro"},
};
/* Peer-reviewed rows carry a label too, so both lists read alike. It names the review,
   not a genre: the group holds journal articles, a seminar series and a reviewed preprint. */
const PEERTYPE={en:"Peer-reviewed",de:"Begutachtet",es:"Revisado por pares"};
/* Two tabbed blocks: the path, then what he has put out. The first tab of each
   is the one that opens, so it is the only one a visitor sees without clicking. */
const TAB_GROUPS={
  path:["education","experience","training"],
  out:["publications","writing","talks"],
};
const TOPICS = {
  metadata:{v:"--t-metadata", en:"Metadata quality", de:"Metadatenqualität", es:"Calidad de metadatos"},
  assessment:{v:"--t-assessment", en:"Assessment & policy", de:"Bewertung & Politik", es:"Evaluación y política"},
  infra:{v:"--t-infra", en:"Infrastructure & AI", de:"Infrastruktur & KI", es:"Infraestructura e IA"},
  story:{v:"--t-story", en:"Data storytelling", de:"Daten-Storytelling", es:"Narrativa de datos"},
};
const UI = {
  en:{nav_menu:"Menu",nav_close:"Close menu",nav_sections:"Sections",cv:"Full CV →", apps_h:"Tools & experiments", apps_lead:"A cloud of live tools, grouped by topic. Drag them around; click one to open it.",
    grp_out_h:"Publications & talks", grp_path_h:"Background",
    hint:"drag · click a bubble", openmark:"dashed = open source", writ_h:"Writing", writ_lead:"Columns, essays and posts on open knowledge.",
    by:"Built by", lic:"MIT-licensed, open source", src:"Source on GitHub",
    built:"A curated view of the same data behind the CV", open:"Open", nolink:"No public URL", list:"List", cloud:"Cloud"},
  de:{nav_menu:"Menü",nav_close:"Menü schließen",nav_sections:"Abschnitte",cv:"Vollständiger Lebenslauf →", apps_h:"Werkzeuge & Experimente", apps_lead:"Eine Wolke aktiver Werkzeuge, nach Thema gruppiert. Ziehen; zum Öffnen klicken.",
    grp_out_h:"Publikationen & Vorträge", grp_path_h:"Werdegang",
    hint:"ziehen · Blase anklicken", openmark:"gestrichelt = quelloffen", writ_h:"Publizistik", writ_lead:"Kolumnen, Essays und Beiträge zu offenem Wissen.",
    by:"Erstellt von", lic:"MIT-Lizenz, quelloffen", src:"Quellcode auf GitHub",
    built:"Eine kuratierte Ansicht derselben CV-Daten", open:"Öffnen", nolink:"Keine öffentliche URL", list:"Liste", cloud:"Wolke"},
  es:{nav_menu:"Menú",nav_close:"Cerrar menú",nav_sections:"Secciones",cv:"CV completo →", apps_h:"Herramientas y experimentos", apps_lead:"Una nube de herramientas vivas, agrupadas por tópico. Arrástralas; haz clic para abrir.",
    grp_out_h:"Publicaciones y charlas", grp_path_h:"Trayectoria",
    hint:"arrastra · haz clic en una burbuja", openmark:"discontinuo = código abierto", writ_h:"Escritos", writ_lead:"Columnas, ensayos y publicaciones sobre conocimiento abierto.",
    by:"Hecho por", lic:"Licencia MIT, código abierto", src:"Código en GitHub",
    built:"Una vista curada de los mismos datos del CV", open:"Abrir", nolink:"Sin URL pública", list:"Lista", cloud:"Nube"},
};

let lang="en", activeTopic=null, selected=null, isList=false;
const esc=s=>(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const blurb=e=>e["blurb_"+lang]||e.blurb_en;
const cvar=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function srcLabel(u){if(!u)return"";try{const h=new URL(u).hostname.replace(/^www\./,"");
  if(h.includes("docker.com"))return"Docker Hub";if(h.includes("observablehq"))return"Observable";
  return h;}catch(e){return""}}
/* curated short labels shown inside the ovals (order matters: OpenAIRE variant before the plain MCP) */
const SHORT=[
  /* Curated because a full title does not fit a 46px oval and the fallback, the part
     before the colon, is not always distinct enough. "BiblioHelp Open" is anchored and
     comes first because the plain /BiblioHelp/ below would swallow it and leave the twin
     and its hosted sibling wearing the same label, which is two ovals a reader cannot
     tell apart. The full name stays a hover away in the tooltip and a click away in the
     panel. */
  [/^BiblioHelp Open/,"BiblioHelp (open)"],[/^FAIR Readout Server/,"FAIR Readout Server"],
  [/^FAIR Readout/,"FAIR Readout"],
  [/^Reform Action Planner/,"Reform Planner"],[/^Affiliation Finder/,"Affiliation Finder"],
  [/^Sound Inequality/,"Sound Inequality"],
  [/BiblioHelp/,"BiblioHelp"],[/^Metaudits/,"Metaudits"],[/^Pollen/,"Pollen"],
  [/MCP CRIS Live: OpenAIRE/,"MCP OpenAIRE"],
  [/MCP CRIS Live/,"MCP CRIS"],[/OpenAIRE Research/,"OpenAIRE AI"],
  [/PID Traceability/,"PID Workflows"],[/Value of Open Research Information/,"ORI Benefits"],
  [/DART Documentation Generators/,"DART Docs"],[/Renku 2\.0 Deployment/,"Renku 2.0 (IT:U)"],
  [/Open Science Strategy/,"OS Strategy (IT:U)"],[/maDMP Template/,"maDMP Template"]];
/* Fallback for a title with no curated label: keep the name, drop the subtitle. The
   separator is ": " with the space, so "CRIS for IT:U" is never cut at "IT". */
function shortOf(t){for(const[re,s]of SHORT)if(re.test(t))return s;return t.split(": ")[0].trim();}

/* ---------- cloud physics ---------- */
const cv=document.getElementById("cloud"), ctx=cv.getContext("2d");
const tip=document.getElementById("tip"), panel=document.getElementById("panel");
let W=0,H=0,dpr=1, bubbles=[], anchors={}, dragging=null, hover=null, raf=0;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

function layout(){
  const rect=cv.getBoundingClientRect(); W=rect.width; H=rect.height; dpr=Math.min(2,devicePixelRatio||1);
  cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  anchors={ metadata:[W*0.30,H*0.36], infra:[W*0.70,H*0.34], assessment:[W*0.33,H*0.70], story:[W*0.70,H*0.70] };
  if(W<560){ anchors={ metadata:[W*0.30,H*0.24], infra:[W*0.70,H*0.42], assessment:[W*0.32,H*0.60], story:[W*0.70,H*0.78] }; }
}
const LBLFONT=b=>"600 11px "+cvar("--mono").split(",")[0].replace(/["']/g,"").trim();
function initBubbles(){
  bubbles=DATA.apps.map((a)=>{const an=anchors[a.topic]||[W/2,H/2];
    const short=shortOf(a.title); const doi=a.doi||"";
    ctx.font="600 11px ui-monospace,monospace"; const wName=ctx.measureText(short).width;
    ctx.font="600 9px ui-monospace,monospace"; const wDoi=doi?ctx.measureText(doi).width:0;
    const rx=Math.max(46,Math.max(wName,wDoi)/2+16); const ry=doi?31:25;
    return {a,short,doi,rx,ry,x:an[0]+(Math.random()-.5)*70,y:an[1]+(Math.random()-.5)*50,vx:0,vy:0};});
}
/* ellipse radius in a given direction, for proper oval separation */
function edir(b,dx,dy){const d=Math.hypot(dx,dy)||1,c=dx/d,s=dy/d;
  return (b.rx*b.ry)/Math.sqrt((b.ry*c)**2+(b.rx*s)**2);}
/* two bubbles are related if either lists the other's id; related pairs touch instead of repelling */
function related(a,b){return !!(a.a.related&&a.a.related.includes(b.a.id))||!!(b.a.related&&b.a.related.includes(a.a.id));}
function partnersOf(bb){return (bb.a.related||[]).map(id=>bubbles.find(x=>x.a.id===id)).filter(Boolean)
  .concat(bubbles.filter(x=>x.a.related&&x.a.related.includes(bb.a.id)));}
function step(){
  for(const b of bubbles){
    if(b===dragging)continue;
    const an=anchors[b.a.topic]||[W/2,H/2];
    b.vx+=(an[0]-b.x)*0.012; b.vy+=(an[1]-b.y)*0.012;
    if(!reduce){b.vx+=(Math.random()-.5)*0.06; b.vy+=(Math.random()-.5)*0.06;}
  }
  for(let i=0;i<bubbles.length;i++)for(let j=i+1;j<bubbles.length;j++){
    const a=bubbles[i],b=bubbles[j],dx=b.x-a.x,dy=b.y-a.y;let d=Math.hypot(dx,dy)||.01;
    const ra=edir(a,dx,dy),rb=edir(b,dx,dy);
    if(related(a,b)){
      // stiff spring toward just-touching (small overlap) so a related pair reads as one unit
      // without one bubble hiding behind the other; must beat the shared-topic anchor pull
      const target=ra+rb-8, f=(d-target)/d*0.30, ox=dx*f, oy=dy*f;
      if(a!==dragging){a.x+=ox;a.y+=oy;} if(b!==dragging){b.x-=ox;b.y-=oy;}
    } else {
      const min=ra+rb+8;
      if(d<min){const p=(min-d)/d*0.5,ox=dx*p,oy=dy*p;
        if(a!==dragging){a.x-=ox;a.y-=oy;} if(b!==dragging){b.x+=ox;b.y+=oy;}}
    }
  }
  for(const b of bubbles){
    if(b===dragging)continue;
    b.vx*=0.86; b.vy*=0.86; b.x+=b.vx; b.y+=b.vy;
    b.x=Math.max(b.rx+4,Math.min(W-b.rx-4,b.x)); b.y=Math.max(b.ry+80,Math.min(H-b.ry-4,b.y));
  }
}
function draw(){
  ctx.clearRect(0,0,W,H);
  // connector(s) from the focused bubble to its related partner(s)
  const focus=selected||hover;
  if(focus){ctx.save();ctx.strokeStyle=cvar("--brand")+"99";ctx.lineWidth=2;ctx.setLineDash([]);
    partnersOf(focus).forEach(pt=>{ctx.beginPath();ctx.moveTo(focus.x,focus.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();});
    ctx.restore();}
  for(const b of bubbles){
    const dim=activeTopic&&b.a.topic!==activeTopic;
    const col=cvar(TOPICS[b.a.topic].v);
    const isSel=selected===b, isHov=hover===b;
    ctx.globalAlpha=dim?0.12:1;
    ctx.beginPath();ctx.ellipse(b.x,b.y,b.rx,b.ry,0,0,7);
    ctx.fillStyle=col+(isSel?"3a":isHov?"30":"22"); ctx.fill();
    ctx.lineWidth=isSel?2.4:1.6; ctx.strokeStyle=col;
    ctx.setLineDash(b.a.platform==="github"?[5,4]:[]); ctx.stroke(); ctx.setLineDash([]);
    if(isSel||isHov){ctx.beginPath();ctx.ellipse(b.x,b.y,b.rx+4,b.ry+4,0,0,7);
      ctx.strokeStyle=cvar("--brand")+"77";ctx.lineWidth=1.5;ctx.stroke();}
    if(!dim){
      // The whole stack, not its first name: canvas does not know ui-monospace and fell back to a
      // serif, while the widths were measured in monospace (layout()), so labels were drawn in one
      // face and fitted to another.
      const fam=cvar("--mono");
      ctx.textAlign="center";ctx.textBaseline="middle";
      if(b.doi){
        ctx.fillStyle=cvar("--ink");ctx.font="600 11px "+fam;ctx.fillText(b.short,b.x,b.y-8);
        ctx.fillStyle=cvar("--brand");ctx.font="600 9px "+fam;ctx.fillText(b.doi,b.x,b.y+8);
      } else {
        ctx.fillStyle=cvar("--ink");ctx.font="600 11px "+fam;ctx.fillText(b.short,b.x,b.y);
      }
    }
    ctx.globalAlpha=1;
  }
}
function frame(){step();draw();raf=requestAnimationFrame(frame);}
function start(){cancelAnimationFrame(raf); if(reduce){for(let k=0;k<240;k++)step();draw();} else frame();}

function at(x,y){for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];
  if(activeTopic&&b.a.topic!==activeTopic)continue;
  const nx=(x-b.x)/b.rx,ny=(y-b.y)/b.ry; if(nx*nx+ny*ny<=1)return b;} return null;}
function evt(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}

cv.addEventListener("pointerdown",e=>{const[x,y]=evt(e);const b=at(x,y);
  if(b){dragging=b;b.dragged=false;cv.setPointerCapture(e.pointerId);cv.classList.add("grabbing");}});
cv.addEventListener("pointermove",e=>{const[x,y]=evt(e);
  if(dragging){dragging.x=x;dragging.y=y;dragging.vx=dragging.vy=0;dragging.dragged=true;tip.style.opacity=0;return;}
  const b=at(x,y);hover=b;cv.style.cursor=b?"grab":"default";
  if(b){tip.textContent=b.a.title;tip.style.left=b.x+"px";tip.style.top=(b.y-b.ry)+"px";tip.style.opacity=1;}
  else tip.style.opacity=0;
  if(reduce)draw();});
function endDrag(e){if(dragging){if(!dragging.dragged)select(dragging);dragging=null;cv.classList.remove("grabbing");}}
cv.addEventListener("pointerup",e=>{const[x,y]=evt(e);
  if(dragging&&!dragging.dragged){/*click*/} endDrag(e);});
cv.addEventListener("pointercancel",endDrag);
cv.addEventListener("pointerleave",()=>{hover=null;tip.style.opacity=0;});

function select(b){selected=b;const t=UI[lang],tp=TOPICS[b.a.topic],col=cvar(tp.v),e=b.a;
  panel.innerHTML=`<button class="x" aria-label="Close">✕</button>
    <span class="pk" style="color:${col}"><span class="sw" style="background:${col}"></span>${esc(tp[lang])}</span>
    <h3>${esc(e.title)}</h3>
    ${e.doi?`<a class="pdoi" href="https://doi.org/${esc(e.doi)}" target="_blank" rel="noopener">DOI ${esc(e.doi)}</a>`:""}
    ${e.twin&&e.twin.url?`<a class="ptwin" href="${esc(e.twin.url)}" target="_blank" rel="noopener">↔ ${esc(e.twin.title||e.twin.url)}</a>`:""}
    <div class="pscroll"><p>${esc(blurb(e))}</p>
    <div class="tags">${(e.tags||[]).slice(0,6).map(x=>`<span class="t">${esc(x)}</span>`).join("")}</div></div>
    <div class="pf"><span class="src">${e.url?esc(srcLabel(e.url)):""} · ${esc(e.year||"")}</span>
    ${e.url?`<a class="open" href="${esc(e.url)}" target="_blank" rel="noopener">${t.open} →</a>`
           :`<span class="open" data-nolink>${t.nolink}</span>`}</div>`;
  panel.querySelector(".x").onclick=()=>{selected=null;panel.classList.remove("on");if(reduce)draw();};
  panel.classList.add("on");if(reduce)draw();}

/* ---------- legend / filter ---------- */
function renderLegend(){const counts={};DATA.apps.forEach(a=>counts[a.topic]=(counts[a.topic]||0)+1);
  document.getElementById("legend").innerHTML=Object.keys(TOPICS).map(k=>`
    <button class="lg" data-topic="${k}" aria-pressed="${activeTopic===k}">
      <span class="sw" style="background:${cvar(TOPICS[k].v)}"></span>${esc(TOPICS[k][lang])}
      <span class="n">${counts[k]||0}</span></button>`).join("");
  document.querySelectorAll(".lg").forEach(b=>b.onclick=()=>{
    activeTopic=activeTopic===b.dataset.topic?null:b.dataset.topic;
    if(selected&&activeTopic&&selected.a.topic!==activeTopic){selected=null;panel.classList.remove("on");}
    renderLegend();renderList();if(reduce)draw();});}

/* ---------- list fallback ---------- */
function renderList(){const lw=document.getElementById("listwrap");
  const items=DATA.apps.filter(a=>!activeTopic||a.topic===activeTopic);
  lw.innerHTML=items.map(e=>{const col=cvar(TOPICS[e.topic].v);
    return `<a class="lrow" href="${esc(e.url||'#')}" ${e.url?'target="_blank" rel="noopener"':''}>
      <span class="lsw" style="background:${col}"></span>
      <span style="flex:1;min-width:0"><h3>${esc(e.title)}</h3><p>${esc(blurb(e))}</p></span>
      <span class="ly">${esc(e.year||"")}</span></a>`;}).join("");}

/* ---------- tabbed second section ---------- */
/* accepts either a {en,de,es} object or a bare string, so a field that has not been
   translated yet renders its text instead of silently disappearing */
const deLbl=o=>typeof o==="string"?o:((o&&(o[lang]||o.en))||"");
function pcount(k){if(k==="writing")return DATA.writing.length;
  if(k==="publications")return Object.values(EXTRA.publications).reduce((s,a)=>s+a.length,0);
  return (EXTRA[k]||[]).length;}
/* The title carries the link, never the whole row, or the year and the blurb get
   underlined too. The right-hand chip names what it actually resolves to: "DOI" only
   for a real doi.org URL, otherwise the host, so a publisher homepage cannot pose as
   a persistent identifier. */
const titleLink=(title,u)=>u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(title)}</a>`:esc(title);
const isDOI=u=>/^https?:\/\/(dx\.)?doi\.org\//i.test(u||"");
function linkChip(u){if(!u)return"";
  return `<a class="plink" href="${esc(u)}" target="_blank" rel="noopener">${esc(isDOI(u)?"DOI":srcLabel(u))} →</a>`;}
function rowsWriting(){return DATA.writing.map(e=>`
  <div class="prow">
    <span class="pyear">${esc(e.year||"")}</span>
    <span class="pmain"><span class="ptype">${esc(e.type||"Writing")}</span>
      <div class="ptitle">${titleLink(e.title,e.url)}</div><div class="pmeta">${esc(blurb(e))}</div></span>
    ${linkChip(e.url)}</div>`).join("");}
function rowsPubs(){const P=EXTRA.publications;
  const rest=Object.keys(PUBTYPE).flatMap(k=>(P[k]||[]).map(p=>({...p,kind:k})))
    .sort((a,b)=>(+b.year||0)-(+a.year||0));
  return [["peerReviewed",(P.peerReviewed||[]).map(p=>({...p,kind:"peerReviewed"}))],["notPeerReviewed",rest]].map(([g,items])=>{if(!items.length)return"";
  return `<div class="pgrp">${esc(PUBGRP[g][lang])} · ${items.length}</div>`+items.map(p=>`
    <div class="prow"><span class="pyear">${esc(p.year||"")}</span>
      <span class="pmain"><span class="ptype">${esc((PUBTYPE[p.kind]||PEERTYPE)[lang])}</span>
      <div class="ptitle">${titleLink(p.title,p.url)}</div>
      <div class="pmeta">${esc(p.authors||"")}${p.venue?' · <b>'+esc(p.venue)+'</b>':''}</div></span>
      ${linkChip(p.url)}</div>`).join("");
  }).join("");}
function rowsTalks(){return EXTRA.talks.map(t=>`
  <div class="prow"><span class="pyear">${esc((t.date||"").split(",").pop().trim())}</span>
    <span class="pmain"><span class="ptype">${esc(t.type||"Talk")}</span>
    <div class="ptitle">${esc(t.title)}</div>
    <div class="pmeta">${esc(t.event||"")}${t.date?' · '+esc(t.date):''}</div></span></div>`).join("");}
function rowsExp(){return EXTRA.experience.map(e=>`
  <div class="prow"><span class="pyear">${esc((e.period||"").match(/\d{4}/)?(e.period.match(/\d{4}/)[0]):"")}</span>
    <span class="pmain"><div class="ptitle">${esc(e.title)} · <span style="font-weight:400;color:var(--muted)">${esc(e.org)}</span></div>
    <div class="pmeta"><b>${esc(e.period||"")}</b>${e.loc?' · '+esc(e.loc):''}<br>${esc(deLbl(e.desc))}</div></span></div>`).join("");}
function rowsEdu(){return EXTRA.education.map(e=>`
  <div class="prow"><span class="pyear">${esc(e.year||"")}</span>
    <span class="pmain"><div class="ptitle">${esc(deLbl(e.degree))}</div>
    <div class="pmeta">${esc(e.inst)}</div></span></div>`).join("");}
function rowsTrain(){return EXTRA.training.map(e=>`
  <div class="prow"><span class="pyear">${esc(e.year||"")}</span>
    <span class="pmain"><div class="ptitle">${esc(e.title)}</div>
    <div class="pmeta">${e.org?'<b>'+esc(e.org)+'</b> · ':''}${esc(deLbl(e.desc))}</div></span></div>`).join("");}
const PANEL={writing:rowsWriting,publications:rowsPubs,talks:rowsTalks,experience:rowsExp,education:rowsEdu,training:rowsTrain};
/* The rail: one entry per section, grouped as TAB_GROUPS groups them, then a link to Metaudits. The main
   column shows either the hero (no section in the hash: the landing) or the one section the rail
   points at (#education, #talks, ...), never both, so a section does not repeat the name and headline.
   The landing is the hero with the tool cloud under it (2026-09-24); the cloud has no rail entry of
   its own, and an old #tools link opens the landing scrolled to it. */
const STEP={education:"ED",experience:"EX",training:"TR",publications:"PU",writing:"WR",talks:"TA"};
const SECTIONS=[...TAB_GROUPS.path,...TAB_GROUPS.out];
let current=SECTIONS.includes(location.hash.slice(1))?location.hash.slice(1):null;
function renderNav(){const t=UI[lang];
  const item=k=>`<a class="nav-item${k===current?' active':''}" href="#${k}" data-sec="${k}"${k===current?' aria-current="page"':''}>
    <span class="nav-step" aria-hidden="true">${STEP[k]}</span>${esc(TABMETA[k][lang])}</a>`;
  document.getElementById("railnav").innerHTML=
    `<div class="nav-label">${esc(t.grp_path_h)}</div>${TAB_GROUPS.path.map(item).join("")}`+
    `<div class="nav-label">${esc(t.grp_out_h)}</div>${TAB_GROUPS.out.map(item).join("")}`+
    `<div class="nav-label">${esc(t.apps_h)}</div>`+
    `<a class="nav-item" href="${esc((PERSONAL&&PERSONAL.toolsIndexUrl)||"https://rijdho.github.io/metaudits-home/")}">
      <span class="nav-step" aria-hidden="true">MA</span>Metaudits ↗</a>`;}
function show(k,{scroll=false,toTools=false}={}){current=k;const tools=!k;
  document.getElementById("hero").hidden=!!k;
  document.getElementById("view_list").hidden=tools;
  document.getElementById("view_tools").hidden=!tools;
  if(!tools){document.getElementById("view_h").textContent=TABMETA[k][lang];
    document.getElementById("view_c").textContent=pcount(k);
    document.getElementById("tabpanel_main").innerHTML=PANEL[k]();}
  document.querySelectorAll("#railnav [data-sec]").forEach(a=>{const on=a.dataset.sec===k;
    a.classList.toggle("active",on); if(on)a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");});
  document.getElementById("app").classList.remove("rail-open");
  // The cloud measures its canvas, which has no size while hidden.
  if(tools&&!isList){layout();initBubbles();start();}
  if(toTools)document.getElementById("view_tools").scrollIntoView({block:"start"});
  else if(scroll)scrollTo({top:0});}
addEventListener("hashchange",()=>{const k=location.hash.slice(1);
  if(SECTIONS.includes(k))show(k,{scroll:true}); else if(!k||k==="tools")show(null,{toTools:k==="tools"});});
document.getElementById("menu").onclick=()=>document.getElementById("app").classList.add("rail-open");
document.getElementById("rail_backdrop").onclick=()=>document.getElementById("app").classList.remove("rail-open");

/* ---------- render all ---------- */
function render(){const t=UI[lang];
  /* data-t is interface language and lives in UI; data-p is CV content and lives in cv.json. */
  document.querySelectorAll("[data-t]").forEach(el=>{const k=el.getAttribute("data-t");if(t[k]!=null)el.textContent=t[k];});
  document.querySelectorAll("[data-p]").forEach(el=>{const v=PERSONAL&&PERSONAL[el.getAttribute("data-p")];
    if(v!=null)el.textContent=deLbl(v);});
  if(PERSONAL){const oc=document.getElementById("orcid_chip"), sc=document.getElementById("substack_chip");
    if(PERSONAL.orcid){oc.href="https://orcid.org/"+PERSONAL.orcid; oc.textContent="ORCID "+PERSONAL.orcid;}
    if(PERSONAL.substack)sc.href=PERSONAL.substack;
    const ti=document.getElementById("tools_index");
    if(PERSONAL.toolsIndexUrl&&ti){ti.href=PERSONAL.toolsIndexUrl; ti.textContent=PERSONAL.toolsIndexUrl.replace(/^https?:\/\//,"").replace(/\/$/,"");}}
  document.documentElement.lang=lang;
  document.getElementById("apps_c").textContent=DATA.apps.length;
  renderLegend();renderList();
  if(selected)select(selected);
  document.getElementById("menu").setAttribute("aria-label",t.nav_menu);
  document.getElementById("rail_backdrop").setAttribute("aria-label",t.nav_close);
  document.getElementById("railnav").setAttribute("aria-label",t.nav_sections);
  renderNav();show(current);}

/* ---------- controls ---------- */
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;
  document.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));render();});
document.getElementById("theme").onclick=()=>{const cur=document.documentElement.getAttribute("data-theme")
  ||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
  document.documentElement.setAttribute("data-theme",cur==="dark"?"light":"dark");render();draw();};
document.querySelectorAll(".viewseg button").forEach(b=>b.onclick=()=>{
  isList=b.dataset.view==="list";
  document.querySelectorAll(".viewseg button").forEach(x=>x.setAttribute("aria-pressed",x===b));
  document.getElementById("stage").classList.toggle("off",isList);
  document.getElementById("listwrap").classList.toggle("on",isList);
  render(); if(!isList){layout();initBubbles();start();}});
addEventListener("resize",()=>{if(!isList){layout();initBubbles();start();}});

(async()=>{
  const CV=await (await fetch("./data/cv.json")).json();
  PERSONAL=CV.personal;
  const wb=e=>({...e,blurb_en:e.desc.en,blurb_es:e.desc.es,blurb_de:e.desc.de||""});
  DATA={apps:CV.experiments.map(wb),writing:CV.portfolio.map(wb)};
  EXTRA={publications:CV.publications,talks:CV.presentations,experience:CV.experience,
    education:CV.education,training:CV.training};
  layout();initBubbles();render();start();
  if(location.hash==="#tools")document.getElementById("view_tools").scrollIntoView({block:"start"});
})();
