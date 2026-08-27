(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const data = JSON.parse($('#site-content').textContent);
  const P = window.__PHOTO_DATA__ || {};

  const photoLibrary = [
    { src: P.kiss, label: 'Richter & Mamma', caption: 'Richter gee vir Mamma ’n soen.' },
    { src: P.family, label: 'Ons familie', caption: 'Mamma saam met De Wet, Richter, Joshua en Caleb.' },
    { src: P.mom, label: 'Mamma', caption: 'Dorothy teen sononder — stil, sterk en mooi.' },
    { src: P.family, label: 'Jy het opgedaag', caption: 'Al die sport, ritte en dae waarop Mamma opgedaag het.' },
    { src: P.mom, label: 'Die werk wat ons sien', caption: 'Die persoon agter al die werk, liefde en kalmte.' },
    { src: P.family, label: 'Waar jy vandaan kom', caption: 'Familie — die mense voor ons en die mense wat jy grootgemaak het.' },
    { src: P.kiss, label: 'Klein oomblikke', caption: 'Die klein oomblikke wat uiteindelik die groot herinneringe word.' }
  ];
  const slotPhotos = [photoLibrary[0], photoLibrary[1], photoLibrary[2], photoLibrary[3], photoLibrary[4], photoLibrary[5], photoLibrary[6], photoLibrary[1]];
  const memoryPhotos = [photoLibrary[0], photoLibrary[5], photoLibrary[3], photoLibrary[1], photoLibrary[6], photoLibrary[2]];

  const stars = $('#stars');
  if (stars) {
    for (let i = 0; i < 38; i += 1) {
      const x = document.createElement('span');
      x.className = 'star';
      x.style.left = `${Math.random() * 100}%`;
      x.style.top = `${Math.random() * 100}%`;
      x.style.animationDelay = `${Math.random() * 3}s`;
      stars.appendChild(x);
    }
  }

  const intro = $('#intro');
  const quiz = $('#quiz');
  const complete = $('#quizComplete');
  const lane = $('#memoryLane');
  const no = $('#noBtn');
  const yes = $('#yesBtn');
  const qText = $('#questionText');
  const qCount = $('#questionCounter');
  const bar = $('#progressBar');
  const eCard = $('#evidenceCard');
  const eTitle = $('#evidenceTitle');
  const eText = $('#evidenceText');
  const noMsg = $('#noMessage');
  const nextBtn = $('#nextQuestion');
  const unlockBtn = $('#enterMemoryLane');

  let qi = 0;
  let attempts = 0;
  let answered = false;
  let quizPassed = false;
  let lastDodge = 0;

  const jokes = [
    'Nee wat, Mamma. Daardie antwoord gaan nie vandag werk nie.',
    'Mooi probeer. Die knoppie glo jou nie.',
    'Mamma… moenie jok nie, onthou? 😌',
    'Hierdie webblad aanvaar nie laster teen my mamma nie.',
    'Regtig? Nog steeds? Ek bewonder die deursettingsvermoë.',
    'Hy hardloop vinniger as ons wanneer jy sê ons moet regmaak.',
    'Daardie antwoord oortree Mamma se eie reëls.',
    'Respek asseblief. Veral vir jouself.'
  ];

  // Hard content gate: the birthday story stays unavailable until all 10 questions are completed.
  document.documentElement.classList.add('quiz-gated');
  document.body.classList.add('quiz-gated');
  if (lane) {
    lane.hidden = true;
    lane.setAttribute('aria-hidden', 'true');
    lane.setAttribute('inert', '');
  }
  if (unlockBtn) unlockBtn.innerHTML = 'Ontsluit die res <span>→</span>';

  const show = (screen) => {
    [intro, quiz, complete].forEach((x) => x?.classList.remove('active'));
    screen?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  function resetNo() {
    if (!no) return;
    Object.assign(no.style, {
      position: '', left: '', top: '', right: '', transform: '', opacity: '1', scale: '1', zIndex: '', boxShadow: ''
    });
    no.classList.remove('dodging');
  }

  function setNextEnabled(enabled) {
    if (!nextBtn) return;
    nextBtn.disabled = !enabled;
    nextBtn.setAttribute('aria-disabled', String(!enabled));
    nextBtn.tabIndex = enabled ? 0 : -1;
  }

  function loadQ() {
    const q = data.questions[qi];
    answered = false;
    attempts = 0;
    qText.textContent = q.question;
    qCount.textContent = `Vraag ${qi + 1} van ${data.questions.length}`;
    bar.style.width = `${((qi + 1) / data.questions.length) * 100}%`;
    eCard.classList.remove('show');
    eCard.setAttribute('aria-hidden', 'true');
    noMsg.textContent = '';
    setNextEnabled(false);
    resetNo();
  }

  function dodge(e) {
    if (answered || !no) return;
    const now = performance.now();
    if (e?.type === 'click' && now - lastDodge < 400) {
      e.preventDefault();
      return;
    }
    lastDodge = now;
    e?.preventDefault();
    e?.stopPropagation();
    attempts += 1;
    noMsg.textContent = jokes[(attempts - 1) % jokes.length];

    const r = no.getBoundingClientRect();
    const vv = window.visualViewport;
    const w = vv?.width || innerWidth;
    const h = vv?.height || innerHeight;
    const ox = vv?.offsetLeft || 0;
    const oy = vv?.offsetTop || 0;
    const pad = 16;
    let x = ox + pad;
    let y = oy + 80;

    for (let i = 0; i < 25; i += 1) {
      x = ox + pad + Math.random() * Math.max(1, w - r.width - pad * 2);
      y = oy + 80 + Math.random() * Math.max(1, h - r.height - 120);
      if (Math.hypot(x - r.left, y - r.top) > Math.min(w, h) * 0.35) break;
    }

    Object.assign(no.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`, right: 'auto', transform: 'none', zIndex: '100', boxShadow: '0 18px 50px rgba(0,0,0,.48)'
    });
    no.classList.add('dodging');

    if (qi === data.questions.length - 1 && attempts >= 3) {
      no.style.scale = Math.max(0.55, 1 - (attempts - 2) * 0.1);
      if (attempts >= 6) {
        no.style.opacity = '0';
        noMsg.textContent = 'Ja nee. Nou het jy hom heeltemal weggejaag 😂';
      }
    }
  }

  no?.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') dodge(e);
  });
  no?.addEventListener('pointerdown', dodge);
  no?.addEventListener('click', dodge);
  no?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') dodge(e);
  });

  $('#startQuiz')?.addEventListener('click', () => {
    show(quiz);
    loadQ();
  });

  yes?.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    resetNo();
    const q = data.questions[qi];
    eTitle.textContent = q.evidenceTitle;
    eText.textContent = q.evidence;
    eCard.classList.add('show');
    eCard.setAttribute('aria-hidden', 'false');
    setNextEnabled(true);
  });

  nextBtn?.addEventListener('click', () => {
    // Do not allow pointer, keyboard or scripted UI progression until this question was actually answered.
    if (!answered) {
      noMsg.textContent = 'Eers “Ek is”, Mamma. Die res bly agter die hek 😌';
      return;
    }

    if (qi < data.questions.length - 1) {
      qi += 1;
      loadQ();
      return;
    }

    quizPassed = true;
    show(complete);
  });

  unlockBtn?.addEventListener('click', () => {
    if (!quizPassed) return;
    complete.classList.remove('active');
    document.documentElement.classList.remove('quiz-gated');
    document.body.classList.remove('quiz-gated');
    lane.hidden = false;
    lane.removeAttribute('aria-hidden');
    lane.removeAttribute('inert');
    requestAnimationFrame(() => {
      lane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      initReveal();
    });
  });

  let obs;
  function initReveal() {
    obs?.disconnect();
    obs = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (!entry.target.matches('.university-sticky')) obs.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -5%' });
    $$('.scroll-reveal,.journey-card,.role-stack,.avalanche').forEach((x) => obs.observe(x));
  }

  const cc = $('#constellationCaption');
  const caps = {
    Ma: 'Die middelpunt van ons klein heelal.',
    Jy: 'De Wet — jou oudste, nou op pad na elektriese ingenieurswese.',
    Joshua: 'Joshua — hy waardeer hoe jy luister en stadig kwaad word.',
    Caleb: 'Caleb — hy sê jy is die beste, gaafste en mooiste Mamma in die wêreld.',
    Richter: 'Richter — hy waardeer hoe vriendelik en goed jy met hom is.'
  };
  $$('.family-node').forEach((n) => n.addEventListener('click', () => { cc.textContent = caps[n.dataset.person]; }));

  function apply(el, p) {
    if (!el || !p?.src) return;
    el.style.backgroundImage = `linear-gradient(180deg,transparent 48%,rgba(4,5,15,.7)),url("${p.src}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.classList.add('has-photo');
    const s = $('span', el);
    if (s) s.textContent = p.label;
    el.dataset.caption = p.caption;
  }

  const slots = $$('.hero-photo-stack .placeholder-card,.film-strip .placeholder-card');
  slots.forEach((el, i) => apply(el, slotPhotos[i % slotPhotos.length]));
  $$('.memory-tile').forEach((el, i) => apply(el, memoryPhotos[i]));

  const cost = $('.cost-photo');
  if (cost && P.mom) {
    cost.style.backgroundImage = `linear-gradient(180deg,rgba(6,8,22,.06),rgba(6,8,22,.3)),url("${P.mom}")`;
    cost.style.backgroundSize = 'cover';
    cost.style.backgroundPosition = 'center';
  }

  const dlg = $('#memoryDialog');
  const dlgPhoto = $('.dialog-photo');
  const dlgCap = $('#dialogCaption');
  function openPhoto(p) {
    if (!p) return;
    apply(dlgPhoto, { ...p, label: p.caption });
    dlgPhoto.style.backgroundSize = 'contain';
    dlgPhoto.style.backgroundRepeat = 'no-repeat';
    dlgPhoto.style.backgroundPosition = 'center';
    dlgCap.textContent = p.caption;
    dlg.showModal?.();
  }

  [...slots, ...$$('.memory-tile')].forEach((el) => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      const isMemory = el.matches('.memory-tile');
      const pool = isMemory ? memoryPhotos : slotPhotos;
      const list = isMemory ? $$('.memory-tile') : slots;
      openPhoto(pool[list.indexOf(el) % pool.length]);
    });
  });
  $('[data-close-dialog]')?.addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  const wall = $('#avalancheWall');
  if (wall) {
    for (let i = 0; i < 24; i += 1) {
      const p = photoLibrary[i % photoLibrary.length];
      const c = document.createElement('div');
      c.className = 'avalanche-card';
      c.style.left = `${Math.random() * 90}%`;
      c.style.top = `${Math.random() * 78}%`;
      c.style.setProperty('--r', `${-12 + Math.random() * 24}deg`);
      c.style.backgroundImage = `linear-gradient(180deg,transparent,rgba(4,5,15,.55)),url("${p.src}")`;
      c.style.backgroundSize = 'cover';
      c.style.backgroundPosition = 'center';
      wall.appendChild(c);
    }
  }

  const letter = $('#letterDialog');
  const body = $('#letterBody');
  data.letter.body.forEach((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    body.appendChild(p);
  });

  let timer;
  const openLetter = $('#openLetter');
  openLetter?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    timer = setTimeout(() => letter.showModal?.(), 650);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => openLetter?.addEventListener(ev, () => clearTimeout(timer)));
  $('[data-close-letter]')?.addEventListener('click', () => letter.close());

  const j = $('.journey-card');
  if (j) new IntersectionObserver(([e]) => { if (e.isIntersecting) j.classList.add('in-view'); }, { threshold: 0.3 }).observe(j);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.scroll-reveal').forEach((x) => x.classList.add('in-view'));
  }
})();