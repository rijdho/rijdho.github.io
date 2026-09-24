let CV;
const UI = {
  en:{back:"← Interactive hub", print:"⤓ Print / PDF",
    experience:"Experience", education:"Education", publications:"Publications",
    presentations:"Talks & presentations", skills:"Skills",
    training:"Training", portfolio:"Writing", experiments:"Tools & experiments"},
  de:{back:"← Interaktiver Hub", print:"⤓ Drucken / PDF",
    experience:"Berufserfahrung", education:"Ausbildung", publications:"Publikationen",
    presentations:"Vorträge & Präsentationen", skills:"Kompetenzen",
    training:"Weiterbildung", portfolio:"Publizistik", experiments:"Werkzeuge & Experimente"},
  es:{back:"← Hub interactivo", print:"⤓ Imprimir / PDF",
    experience:"Experiencia", education:"Formación", publications:"Publicaciones",
    presentations:"Charlas y presentaciones", skills:"Competencias",
    training:"Formación continua", portfolio:"Escritos", experiments:"Herramientas y experimentos"},
};
const PUBGRP={peerReviewed:{en:"Peer-reviewed",de:"Begutachtet",es:"Revisadas por pares"},
  policyPapers:{en:"Policy papers",de:"Policy Papers",es:"Documentos de política"},
  guides:{en:"Guides",de:"Leitfäden",es:"Guías"},datasets:{en:"Datasets",de:"Datensätze",es:"Conjuntos de datos"},
  preprints:{en:"Preprints",de:"Preprints",es:"Preprints"},
  other:{en:"Other outputs",de:"Weitere Veröffentlichungen",es:"Otras publicaciones"}};

let lang="en";
const esc=s=>(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const t=o=>typeof o==="string"?o:((o&&(o[lang]||o.en))||"");
const yr=s=>{const m=(s||"").match(/\d{4}/);return m?m[0]:(s||"");};

function render(){
  const U=UI[lang]; const p=CV.personal;
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-t]").forEach(el=>{const k=el.dataset.t;if(U[k])el.textContent=U[k];});
  document.getElementById("degrees").textContent=(p.degrees||[]).join(" · ");
  document.getElementById("tagline").textContent=t(p.tagline);
  /* the summary is authored as paragraphs separated by a blank line, the same shape
     build_cv.py emits; rendering it as one text node ran them all together. */
  document.getElementById("summary").innerHTML=
    t(p.summary).split("\n\n").map(x=>`<p>${esc(x)}</p>`).join("");
  const c=[];
  if(p.email)c.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>${p.emailIsAlias?' <span class="alias">(alias)</span>':""}`);
  if(p.orcid)c.push(`<a href="https://orcid.org/${esc(p.orcid)}">ORCID ${esc(p.orcid)}</a>`);
  if(p.substack)c.push(`<a href="${esc(p.substack)}">Substack</a>`);
  document.getElementById("contact").innerHTML=c.join('<span style="color:var(--faint)">·</span>');

  const H=[];
  /* Safari ignores break-after:avoid in every spelling, so on paper a heading can only be
     kept off the foot of a page by sharing an unbreakable box with the first item under
     it. keep() builds that box; a list is split after its first item, and an <ol> resumes
     its numbering at 2. "cont" restores the rule under an item that is no longer last. */
  const keep=(head,items,tag)=>{
    const rest=items.slice(1), cont=rest.length?" cont":"";
    if(!tag)return `<div class="keep${cont}">${head}${items[0]||""}</div>${rest.join("")}`;
    const n=tag.split(" ")[0];
    return `<div class="keep${cont}">${head}<${tag}>${items[0]||""}</${n}></div>`+
      (rest.length?`<${tag}${n==="ol"?' start="2"':""}>${rest.join("")}</${n}>`:"");
  };
  const h2=(key,count)=>`<h2>${esc(UI[lang][key])}${count?`<span class="c">${count}</span>`:""}</h2>`;
  const sec=(key,items,tag,count)=>H.push(`<section>${keep(h2(key,count),items,tag)}</section>`);

  // Experience
  sec("experience", CV.experience.map(e=>`<div class="entry">
    <div class="top"><span class="ti">${esc(e.title)} · <span class="org">${esc(e.org)}</span></span>
      <span class="when">${esc(e.period)}</span></div>
    ${e.loc?`<div class="loc">${esc(e.loc)}</div>`:""}
    ${t(e.desc)?`<p>${esc(t(e.desc))}</p>`:""}</div>`));

  // Education
  sec("education", CV.education.map(e=>`<div class="edu">
    <span><span class="d">${esc(t(e.degree))}</span> · <span class="i">${esc(e.inst)}</span></span>
    <span class="when">${esc(e.year)}</span></div>`));

  // Publications: each group's subheading is kept with its first entry too
  const groups=["peerReviewed","policyPapers","guides","datasets","preprints","other"].filter(g=>(CV.publications[g]||[]).length);
  const pubN=groups.reduce((n,g)=>n+CV.publications[g].length,0);
  H.push(`<section>`+groups.map((g,i)=>keep((i?"":h2("publications",pubN))+`<div class="subh">${esc(PUBGRP[g][lang])}</div>`,
    CV.publications[g].map(it=>{const ti=it.url?`<a href="${esc(it.url)}">${esc(it.title)}</a>`:esc(it.title);
      return `<li>${esc(it.authors)} (${esc(it.year)}). ${ti}.${it.venue?` <b>${esc(it.venue)}</b>.`:""}</li>`;}),
    'ol class="pubs"')).join("")+`</section>`);

  // Presentations
  sec("presentations", CV.presentations.map(t2=>`
    <li><b>${esc(t2.title)}</b> · ${esc(t2.event)}${t2.date?` <span class="tag">(${esc(t2.date)})</span>`:""}</li>`), 'ul class="plain"', CV.presentations.length);

  // Skills
  sec("skills", CV.skills.map(s=>`<div class="skill"><span class="k">${esc(t(s.title))}</span>
    <span class="v">${esc((s.items||[]).map(t).join(", "))}</span></div>`));

  // Writing (portfolio)
  sec("portfolio", CV.portfolio.map(e=>{const ti=e.url?`<a href="${esc(e.url)}">${esc(e.title)}</a>`:esc(e.title);
    return `<li><b>${ti}</b> <span class="tag">${esc(e.year)}${e.type?" · "+esc(e.type):""}</span><br>${esc(t(e.desc))}</li>`;}), 'ul class="plain"', CV.portfolio.length);

  // Tools (experiments)
  // First line of the section: where every tool and dashboard is listed with its sources and licences.
  const toolsIndex=p.toolsIndexUrl?[`<p class="entry">${esc(t(p.toolsIndexLabel))} <a href="${esc(p.toolsIndexUrl)}">${esc(p.toolsIndexUrl.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a></p>`]:[];
  sec("experiments", toolsIndex.concat(CV.experiments.map(e=>{const ti=e.url?`<a href="${esc(e.url)}">${esc(e.title)}</a>`:esc(e.title);
    return `<div class="entry"><div class="top"><span class="ti">${ti}</span>
      <span class="when">${esc(e.status)} · ${esc(e.year)}</span></div>
      ${t(e.desc)?`<p>${esc(t(e.desc))}</p>`:""}
      ${e.twin&&e.twin.url?`<div class="twin">↔ <a href="${esc(e.twin.url)}">${esc(e.twin.title||e.twin.url)}</a></div>`:""}
      ${(e.tags||[]).length?`<div class="tag">${esc((e.tags||[]).slice(0,6).join(" · "))}</div>`:""}</div>`;})), "", CV.experiments.length);

  // Training
  sec("training", CV.training.map(e=>`
    <li><b>${esc(e.title)}</b> <span class="tag">${esc(e.year)}</span>${e.org?` · ${esc(e.org)}`:""}<br>${esc(t(e.desc))}</li>`), 'ul class="plain"');

  document.getElementById("body").innerHTML=H.join("");
}
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;
  document.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));render();});
document.getElementById("print").onclick=()=>window.print();
(async()=>{ CV=await (await fetch("./data/cv.json")).json(); render(); })();
