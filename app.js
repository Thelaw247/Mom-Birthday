(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const cp1252 = {8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
  function repairString(value) {
    if (typeof value !== 'string' || !/[\u00c2\u00c3\u00e2]/.test(value)) return value;
    try {
      const bytes = [];
      for (const ch of value) {
        const code = ch.codePointAt(0);
        if (cp1252[code] !== undefined) bytes.push(cp1252[code]);
        else if (code <= 255) bytes.push(code);
        else return value;
      }
      return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    } catch { return value; }
  }
  function repairObject(obj) {
    if (Array.isArray(obj)) return obj.map(repairObject);
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => { obj[k] = repairObject(obj[k]); });
      return obj;
    }
    return repairString(obj);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { n.nodeValue = repairString(n.nodeValue); });
  $$('[aria-label],[title]').forEach(el => {
    if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', repairString(el.getAttribute('aria-label')));
    if (el.hasAttribute('title')) el.setAttribute('title', repairString(el.getAttribute('title')));
  });
  document.title = repairString(document.title);

  let data = {};
  try { data = repairObject(JSON.parse($('#site-content')?.textContent || '{}')); } catch (e) { console.error(e); }

  const questions = [
    'Hardwerkend \u00e9n nogal ongelooflik?',
    'Iemand wat altyd vir my kinders opdaag \u2014 selfs wanneer ek moeg is?',
    'Die een wat hierdie hele familie op een of ander manier aan die gang hou?',
    'Dapper genoeg om my hele lewe oor \u2019n oseaan te skuif en van voor af te begin?',
    'Iemand wat omtrent enigiets vir my kinders sal doen?',
    'Empaties, saggeaard en iemand wat regtig omgee oor mense?',
    'Iemand wat meer vir hierdie familie opgeoffer het as wat ek self besef?',
    'Sterker as wat ek myself krediet voor gee?',
    'Iemand wat kinders grootgemaak het wat gereed is om hul eie pad te begin stap?',
    'Belaglik, oorweldigend baie liefgeh\u00ea?'
  ];
  questions.forEach((q, i) => { if (data.questions?.[i]) data.questions[i].question = q; });

  const stars = $('#stars');
  for (let i = 0; stars && i < (data.site?.age || 38); i++) {
    const s = document.createElement('span');
    s.className = 'star'; s.style.left = `${Math.random()*100}%`; s.style.top = `${Math.random()*100}%`;
    s.style.animationDelay = `${Math.random()*3}s`; stars.appendChild(s);
  }

  const intro=$('#intro'), quiz=$('#quiz'), complete=$('#quizComplete'), memory=$('#memoryLane');
  const start=$('#startQuiz'), yes=$('#yesBtn'), no=$('#noBtn'), qText=$('#questionText'), qCount=$('#questionCounter');
  const bar=$('#progressBar'), evidence=$('#evidenceCard'), eTitle=$('#evidenceTitle'), eText=$('#evidenceText');
  const next=$('#nextQuestion'), noMsg=$('#noMessage'), enter=$('#enterMemoryLane');
  if (quiz) Object.assign(quiz.style,{justifyContent:'center',justifyItems:'stretch',width:'100%',textAlign:'center'});

  let qi=0, attempts=0, answered=false, lastDodge=0;
  const jokes = [
    'Nee wat, Mamma. Daardie antwoord is vandag buite werking.',
    'Moenie jok nie, onthou?',
    'Ha! Mooi probeer. Hy het jou gesien kom.',
    'Hierdie antwoord oortree Mamma se eie reels.',
    'Ons het ongelukkig te veel bewyse.',
    'Mamma... ek het hierdie ding gebou. Ek het hiervoor beplan.',
    'Respek asseblief. Veral vir jouself.',
    'Hy hardloop vinniger as ons wanneer jy se ons moet skoonmaak.',
    'Hierdie webblad aanvaar nie laster teen Dorothy nie.',
    'Jy kan hom jaag, maar jy gaan hom nie vang nie.'
  ];
  function screen(el){[intro,quiz,complete].forEach(x=>x?.classList.remove('active'));el?.classList.add('active');}
  function resetNo(){ if(!no)return; no.classList.remove('dodging'); ['position','left','top','right','transform','opacity','scale','zIndex','boxShadow','transition'].forEach(k=>no.style[k]=''); }
  function load(){ const q=data.questions?.[qi]; if(!q)return; answered=false; attempts=0; qText.textContent=q.question; qCount.textContent=`Vraag ${qi+1} van ${data.questions.length}`; bar.style.width=`${(qi+1)/data.questions.length*100}%`; evidence.classList.remove('show'); evidence.setAttribute('aria-hidden','true'); noMsg.textContent=''; resetNo(); }
  function farPos(rect){ const vv=window.visualViewport, w=vv?.width||innerWidth, h=vv?.height||innerHeight, ox=vv?.offsetLeft||0, oy=vv?.offsetTop||0, edge=innerWidth<=600?16:28; const minX=ox+edge,maxX=Math.max(minX,ox+w-rect.width-edge),minY=oy+(innerWidth<=600?82:28),maxY=Math.max(minY,oy+h-rect.height-30); let x=minX,y=minY; const yr=yes.getBoundingClientRect(), target=Math.min(w,h)*(innerWidth<=600?.42:.34); for(let t=0;t<30;t++){x=minX+Math.random()*(maxX-minX||1);y=minY+Math.random()*(maxY-minY||1);const overlap=!(x+rect.width<yr.left-20||x>yr.right+20||y+rect.height<yr.top-20||y>yr.bottom+20);if(!overlap&&Math.hypot(x-rect.left,y-rect.top)>=target)break;} return {x,y}; }
  function dodge(ev){ if(answered||!no)return; const now=performance.now(); if(ev?.type==='click'&&now-lastDodge<420){ev.preventDefault();return;} lastDodge=now; ev?.preventDefault(); ev?.stopPropagation(); attempts++; noMsg.textContent=jokes[(attempts-1)%jokes.length]; noMsg.setAttribute('aria-hidden','false'); const rect=no.getBoundingClientRect(),p=farPos(rect); no.classList.add('dodging'); Object.assign(no.style,{position:'fixed',right:'auto',left:`${p.x}px`,top:`${p.y}px`,transform:'none',zIndex:'100',boxShadow:'0 18px 50px rgba(0,0,0,.45),0 0 30px rgba(145,100,255,.22)',transition:'left .14s ease, top .14s ease, opacity .14s ease'}); if(qi===data.questions.length-1&&attempts>=3)no.style.scale=`${Math.max(.55,1-(attempts-2)*.1)}`; if(qi===data.questions.length-1&&attempts>=6){no.style.opacity='0';noMsg.textContent='Ja nee. Nou het jy hom heeltemal weggejaag.';} }
  no?.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')dodge(e)});
  if(no){ if('PointerEvent'in window)no.addEventListener('pointerdown',dodge); else no.addEventListener('touchstart',dodge,{passive:false}); no.addEventListener('click',dodge); }
  start?.addEventListener('click',()=>{screen(quiz);load();});
  yes?.addEventListener('click',()=>{if(answered)return;answered=true;const q=data.questions[qi];resetNo();eTitle.textContent=q.evidenceTitle;eText.textContent=q.evidence;evidence.classList.add('show');evidence.setAttribute('aria-hidden','false');});
  next?.addEventListener('click',()=>{if(qi<data.questions.length-1){qi++;load();quiz.scrollIntoView({behavior:'smooth',block:'start'});}else screen(complete);});
  enter?.addEventListener('click',()=>{complete.classList.remove('active');memory.hidden=false;requestAnimationFrame(()=>{memory.scrollIntoView({behavior:'smooth'});initReveal();});});

  let observer;
  function initReveal(){observer?.disconnect();observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');if(!e.target.matches('.university-sticky'))observer.unobserve(e.target);}}),{threshold:.14,rootMargin:'0px 0px -5%'});$$('.scroll-reveal,.journey-card,.role-stack,.avalanche').forEach(el=>observer.observe(el));}

  const captions={Ma:'Die middelpunt van ons klein heelal.',Jy:'De Wet \u2014 jou oudste, nou op pad na elektriese ingenieurswese.',Joshua:'Hy waardeer dat Mamma luister en stadig kwaad word.',Caleb:'Hy se jy is die beste, mooiste en vriendelikste mamma in die wereld.',Richter:'Hy waardeer hoe vriendelik Mamma met hom is.'};
  $$('.family-node').forEach(n=>n.addEventListener('click',()=>{$('#constellationCaption').textContent=captions[n.dataset.person]||n.dataset.person;}));

  const photos=['assets/photos/family/hero-1.jpg','assets/photos/family/hero-2.jpg','assets/photos/family/hero-3.jpg','assets/photos/sports/sport-1.jpg','assets/photos/sports/sport-2.jpg','assets/photos/family/family-1.jpg','assets/photos/sports/sport-3.jpg','assets/photos/family/family-2.jpg','assets/photos/south-africa/south-africa-1.jpg','assets/photos/canada/canada-1.jpg','assets/photos/sports/sport-4.jpg','assets/photos/family/family-3.jpg','assets/photos/misc/memory-1.jpg','assets/photos/family/mom-1.jpg'];
  $$('.placeholder-card').forEach((slot,i)=>{const src=photos[i];if(!src)return;const img=new Image();img.onload=()=>{slot.style.backgroundImage=`linear-gradient(180deg,transparent 55%,rgba(4,5,15,.62)),url("${src}")`;slot.style.backgroundSize='cover';slot.style.backgroundPosition='center';slot.classList.add('has-photo');};img.src=src;});

  const dialog=$('#memoryDialog'); $$('.memory-tile').forEach(t=>t.addEventListener('click',()=>{$('#dialogCaption').textContent=t.dataset.caption||'Herinnering';dialog?.showModal?.();})); $('[data-close-dialog]')?.addEventListener('click',()=>dialog?.close());
  const wall=$('#avalancheWall'); for(let i=0;wall&&i<24;i++){const c=document.createElement('div');c.className='avalanche-card';c.style.left=`${Math.random()*90}%`;c.style.top=`${Math.random()*78}%`;c.style.setProperty('--r',`${-12+Math.random()*24}deg`);wall.appendChild(c);}

  const letter=$('#letterDialog'), body=$('#letterBody'), open=$('#openLetter');
  (data.letter?.body||[]).forEach(text=>{const p=document.createElement('p');p.textContent=text;body?.appendChild(p);});
  let timer; function startHold(e){e?.preventDefault();clearTimeout(timer);timer=setTimeout(()=>letter?.showModal?.(),600);} function cancel(){clearTimeout(timer);} open?.addEventListener('pointerdown',startHold);open?.addEventListener('pointerup',cancel);open?.addEventListener('pointercancel',cancel); $('[data-close-letter]')?.addEventListener('click',()=>letter?.close());

  if(matchMedia('(prefers-reduced-motion: reduce)').matches)$$('.scroll-reveal').forEach(el=>el.classList.add('in-view'));
})();
