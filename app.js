(() => {
  const photoMap = window.__BIRTHDAY_PHOTOS__ || {};
  document.querySelectorAll('[data-photo]').forEach((img) => {
    const src = photoMap[img.dataset.photo];
    if (src) img.src = src;
  });
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const birthday = new Date('1988-08-25T22:00:00.000Z'); // midnight Aug 26 SAST; exact birth time unknown
  const DAY = 86400000, MINUTE = 60000;
  const fmt = new Intl.NumberFormat('en-CA');
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');

  // Decorative 38-star sky.
  const stars = $('#stars');
  for (let i=0; i<38; i++) {
    const s=document.createElement('span'); s.className='star';
    s.style.left=`${Math.random()*100}%`; s.style.top=`${Math.random()*100}%`; s.style.animationDelay=`${Math.random()*3}s`;
    stars.appendChild(s);
  }


  const screens = $$('.gate-screen');
  function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    const next = $(id); next?.classList.add('active');
    if (next?.classList.contains('screen-scroll')) next.scrollTop = 0;
  }

  function ageNow(now=new Date()) {
    const ms=Math.max(0, now-birthday);
    const totalSeconds=Math.floor(ms/1000), totalMinutes=Math.floor(ms/MINUTE), totalHours=Math.floor(ms/3600000), totalDays=Math.floor(ms/DAY), totalWeeks=Math.floor(totalDays/7);
    const sast=new Date(now.getTime()+2*3600000);
    let years=sast.getUTCFullYear()-1988;
    if (sast.getUTCMonth()<7 || (sast.getUTCMonth()===7 && sast.getUTCDate()<26)) years--;
    let totalMonths=(sast.getUTCFullYear()-1988)*12+(sast.getUTCMonth()-7);
    if (sast.getUTCDate()<26) totalMonths--;
    return {years,totalMonths,totalWeeks,totalDays,totalHours,totalMinutes,totalSeconds};
  }
  const put=(id,v)=>{const el=$(id);if(el)el.textContent=v};
  let ageRevealed=false;
  function tick(){
    const a=ageNow();
    put('#wrongYearsText',a.years); put('#ageYears',fmt.format(a.years)); put('#ageMonths',fmt.format(a.totalMonths)); put('#ageWeeks',fmt.format(a.totalWeeks)); put('#ageDays',fmt.format(a.totalDays)); put('#ageHours',fmt.format(a.totalHours)); put('#ageMinutes',fmt.format(a.totalMinutes)); put('#ageSeconds',fmt.format(a.totalSeconds));
    put('#statSeconds',fmt.format(a.totalSeconds)); put('#statHeartbeats',`≈ ${fmt.format(Math.floor(a.totalMinutes*70))}`); put('#statSleep',`≈ ${(a.totalHours/3/24/365.2425).toFixed(1)} jaar`); put('#statWater',`≈ ${fmt.format(Math.floor(a.totalDays*8*9.5))} L`); put('#statDays',fmt.format(a.totalDays));
    if(ageRevealed){put('#widgetYears',`${a.years} jaar`);put('#widgetSeconds',`${fmt.format(a.totalSeconds)} sekondes`)}
  }
  tick(); setInterval(tick,1000);

  $('#ageForm').addEventListener('submit',e=>{
    e.preventDefault(); ageRevealed=true; $('#liveAgeWidget').classList.remove('widget-locked'); tick();
    const entered=Number($('#ageInput').value);
    if(entered===ageNow().years){showScreen('#statsScreen');armStats();}
    else showScreen('#wrongAge');
  });
  $('#wrongAgeContinue').addEventListener('click',()=>{showScreen('#statsScreen');armStats();});

  let statsObserver;
  function armStats(){
    const btn=$('#statsContinue'); btn.disabled=true; put('#statsUnlockHint','Kyk eers deur al die statistieke ↓');
    statsObserver?.disconnect();
    statsObserver=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.55)){
        setTimeout(()=>{btn.disabled=false;put('#statsUnlockHint','Reg. Nou kan ons aangaan.');},450); statsObserver.disconnect();
      }
    },{root:$('#statsScreen'),threshold:[.55]});
    statsObserver.observe($('#lastStatCard'));
  }
  $('#statsContinue').addEventListener('click',()=>{if(!$('#statsContinue').disabled){showScreen('#quizScreen');loadQuestion();}});

  const questions=[
    ['Hardwerkend én nogal ongelooflik?','Bewysstuk 01','Ons het in 2020 van Suid-Afrika na Kanada getrek. Jy het saam met ons van voor af begin, aangehou werk en seker gemaak ons voel veilig terwyl alles nuut was.'],
    ['Iemand wat altyd vir my kinders opdaag — selfs wanneer ek moeg is?','Bewysstuk 02','Vir elf jaar was jy deel van De Wet se stoei. Die laaste drie jaar het dit gereeld ’n uur stad toe beteken, drie of vier keer ’n week; voor dit was oefening omtrent vyf minute van die huis af. Jy was ook by Richter se hokkie en die tweeling se sport.'],
    ['Die een wat hierdie hele familie op een of ander manier aan die gang hou?','Bewysstuk 03','Vier seuns. Vier persoonlikhede. Vier stelle planne. En een Mamma wat gewoonlik weet wie waar moet wees en wie hulp nodig het.'],
    ['Dapper genoeg om my hele lewe oor ’n oseaan te skuif en van voor af te begin?','Bewysstuk 04','Suid-Afrika was bekend. Kanada was nuut. Jy het baie onsekerheid gedra sonder om dit ons las te maak.'],
    ['Iemand wat omtrent enigiets vir my kinders sal doen?','Bewysstuk 05','Die ryery. Die wagtyd. Die werk. Die kos. Die papierwerk. Die luister. Die moeilike dinge wat jy doen omdat jy vir ons lief is. Ons sien dit.'],
    ['Liefdevol, kalm en iemand wat eers dink voordat ek reageer?','Bewysstuk 06','Wanneer dinge skeefloop, verloor jy nie sommer jou kop nie. Jy dink, kyk wat gedoen moet word en beweeg dan vorentoe.'],
    ['Iemand wat meer vir hierdie familie opoffer as wat ek self soms besef?','Bewysstuk 07','Selfs jou hande wys hoeveel jy werk. Wanneer jou liggaam moeg raak, hou jy steeds aan en kom huis toe sonder om almal anders daarvoor te straf.'],
    ['Gedissiplineerd, konsekwent en sterk wanneer dinge moeilik raak?','Bewysstuk 08','Jy staan op vir wat reg is, hou van goeie maniere en respek, en bly konsekwent selfs wanneer dit makliker sou wees om nie te wees nie.'],
    ['Iemand wat kinders grootgemaak het wat gereed is om hul eie pad te begin stap?','Bewysstuk 09','De Wet gaan elektriese ingenieurswese studeer. Dis sy volgende hoofstuk, maar dit dra jare se ondersteuning, sport en jou geloof in hom saam.'],
    ['Belaglik, oorweldigend baie liefgehê?','Bewysstuk 10','Ja. Deur De Wet, Richter, Joshua en Caleb. Ons sien jou. Ons sien die harde goed ook. En ons is baie lief vir jou.']
  ];
  const jokes=['Nee wat, Mamma. Daardie antwoord gaan nie vandag werk nie.','Mooi probeer. Die knoppie glo jou nie.','Mamma… moenie jok nie, onthou? 😌','Hierdie webblad aanvaar nie laster teen my mamma nie.','Respek asseblief. Veral vir jouself.','Jy kan hom jaag, maar jy gaan hom nie vang nie.'];
  let qi=0,answered=false,noAttempts=0,noMoved=false;
  const no=$('#noBtn'),yes=$('#yesBtn'),next=$('#nextQuestion');
  const noAnchor=document.createComment('no-button-home'); no.before(noAnchor);
  function resetNo(){
    if(no.parentNode!==noAnchor.parentNode) noAnchor.parentNode.insertBefore(no,noAnchor.nextSibling);
    noMoved=false;Object.assign(no.style,{position:'',left:'',top:'',transform:'',zIndex:'',width:'',height:''});no.style.opacity='1';
  }
  function loadQuestion(){answered=false;noAttempts=0;resetNo();$('#noMessage').textContent='';$('#evidenceCard').classList.remove('show');$('#evidenceCard').setAttribute('aria-hidden','true');next.disabled=true;next.tabIndex=-1;$('#questionCounter').textContent=`Vraag ${qi+1} van ${questions.length}`;$('#progressBar').style.width=`${(qi+1)/questions.length*100}%`;$('#questionText').textContent=questions[qi][0];}
  function candidatePosition(width,height){
    const yr=yes.getBoundingClientRect();
    const vv=window.visualViewport; const vw=vv?.width||innerWidth, vh=vv?.height||innerHeight; const ox=vv?.offsetLeft||0, oy=vv?.offsetTop||0;
    const pad=16, topPad=76, bottomPad=24; let x=ox+pad,y=oy+topPad;
    for(let i=0;i<80;i++){
      x=ox+pad+Math.random()*Math.max(1,vw-width-pad*2);
      y=oy+topPad+Math.random()*Math.max(1,vh-height-topPad-bottomPad);
      const overlapsYes=!(x+width<yr.left-30||x>yr.right+30||y+height<yr.top-30||y>yr.bottom+30);
      if(!overlapsYes) break;
    }
    x=Math.max(ox+pad,Math.min(x,ox+vw-width-pad));
    y=Math.max(oy+topPad,Math.min(y,oy+vh-height-bottomPad));
    return{x,y};
  }
  function moveNo(){
    const r=no.getBoundingClientRect(), width=r.width, height=r.height;
    if(!noMoved){noMoved=true;document.body.appendChild(no);}
    const {x,y}=candidatePosition(width,height);
    Object.assign(no.style,{position:'fixed',left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`,zIndex:'12000',transform:'none'});
    noAttempts++; $('#noMessage').textContent=jokes[(noAttempts-1)%jokes.length];
  }
  window.addEventListener('pointermove',e=>{
    if(!finePointer.matches||answered||!$('#quizScreen').classList.contains('active'))return;
    const r=no.getBoundingClientRect(); const cx=r.left+r.width/2,cy=r.top+r.height/2; const distance=Math.hypot(e.clientX-cx,e.clientY-cy);
    if(distance<145) moveNo();
  },{passive:true});
  no.addEventListener('pointerenter',e=>{if(finePointer.matches&&!answered)moveNo();});
  no.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!finePointer.matches&&!answered){setTimeout(moveNo,0);}else if(finePointer.matches&&!answered){moveNo();}});
  no.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!answered){e.preventDefault();moveNo();}});
  yes.addEventListener('click',()=>{if(answered)return;answered=true;resetNo();const q=questions[qi];$('#evidenceTitle').textContent=q[1];$('#evidenceText').textContent=q[2];$('#evidenceCard').classList.add('show');$('#evidenceCard').setAttribute('aria-hidden','false');next.disabled=false;next.tabIndex=0;});
  next.addEventListener('click',()=>{if(!answered)return;if(qi<questions.length-1){qi++;loadQuestion();}else showScreen('#quizComplete');});
  $('#unlockExperience').addEventListener('click',()=>{
    $('#gateShell').hidden=true; const exp=$('#experience');exp.hidden=false;exp.removeAttribute('inert');document.body.classList.remove('locked');window.scrollTo(0,0);initReveals();
  });

  function initReveals(){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -4%'});$$('.reveal').forEach(el=>io.observe(el));
  }

  // Photo lightbox: every gallery photo keeps its natural aspect ratio on the page and uses contain in the dialog.
  const lightbox=$('#lightbox'),lbMedia=$('#lightboxMedia'),lbCap=$('#lightboxCaption');
  $$('#photoWall figure,.hero-gallery figure,.story-pair figure').forEach(fig=>fig.addEventListener('click',()=>{
    const img=$('img',fig),svg=$('svg.photo-slice',fig); lbMedia.innerHTML='';
    if(img){const clone=img.cloneNode(true);clone.removeAttribute('loading');lbMedia.appendChild(clone);lbCap.textContent=$('figcaption',fig)?.textContent||img.alt;}
    else if(svg){const clone=svg.cloneNode(true);clone.setAttribute('preserveAspectRatio','xMidYMid meet');lbMedia.appendChild(clone);lbCap.textContent=$('figcaption',fig)?.textContent||svg.getAttribute('aria-label')||'';}
    lightbox.showModal();
  }));
  $('[data-close-lightbox]').addEventListener('click',()=>lightbox.close()); lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
  const letter=$('#letterDialog');$('#openLetter').addEventListener('click',()=>letter.showModal());$('[data-close-letter]').addEventListener('click',()=>letter.close());letter.addEventListener('click',e=>{if(e.target===letter)letter.close();});
})();