(() => {
  const dataEl = document.getElementById('site-content');
  const data = JSON.parse(dataEl.textContent);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // These are intentionally written so “Ek is” / “Ek is nie” answers every one naturally.
  const questionOverrides = [
    'Hardwerkend én nogal ongelooflik?',
    'Iemand wat altyd vir my kinders opdaag — selfs wanneer ek moeg is?',
    'Die een wat hierdie hele familie op een of ander manier aan die gang hou?',
    'Dapper genoeg om my hele lewe oor ’n oseaan te skuif en van voor af te begin?',
    'Iemand wat omtrent enigiets vir my kinders sal doen?',
    'Empaties, saggeaard en iemand wat regtig omgee oor mense?',
    'Iemand wat meer vir hierdie familie opgeoffer het as wat ek self besef?',
    'Sterker as wat ek myself krediet voor gee?',
    'Iemand wat kinders grootgemaak het wat gereed is om hul eie pad te begin stap?',
    'Belaglik, oorweldigend baie liefgehê?'
  ];
  questionOverrides.forEach((question, i) => {
    if (data.questions[i]) data.questions[i].question = question;
  });

  // 38 little lights for 38 years.
  const stars = $('#stars');
  if (stars) {
    for (let i = 0; i < data.site.age; i += 1) {
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3.4}s`;
      star.style.animationDuration = `${2.4 + Math.random() * 3.8}s`;
      stars.appendChild(star);
    }
  }

  const intro = $('#intro');
  const quiz = $('#quiz');
  const complete = $('#quizComplete');
  const memoryLane = $('#memoryLane');
  const startQuiz = $('#startQuiz');
  const yesBtn = $('#yesBtn');
  const noBtn = $('#noBtn');
  const questionText = $('#questionText');
  const questionCounter = $('#questionCounter');
  const progressBar = $('#progressBar');
  const evidenceCard = $('#evidenceCard');
  const evidenceTitle = $('#evidenceTitle');
  const evidenceText = $('#evidenceText');
  const nextQuestion = $('#nextQuestion');
  const noMessage = $('#noMessage');
  const enterMemoryLane = $('#enterMemoryLane');

  // Force the questionnaire into the actual centre of wide desktop screens.
  if (quiz) {
    quiz.style.justifyContent = 'center';
    quiz.style.justifyItems = 'stretch';
    quiz.style.width = '100%';
    quiz.style.textAlign = 'center';
  }

  let questionIndex = 0;
  let noAttempts = 0;
  let currentQuestionAnswered = false;
  let lastDodgeAt = 0;

  const cheekyMessages = [
    'Nee wat, Ma. Daardie antwoord is vandag buite werking.',
    'Ha! Mooi probeer. Hy het jou gesien kom.',
    'Nee-knoppie: 1. Ma: 0.',
    'Ons het ongelukkig te veel bewyse. Probeer weer 😌',
    'Daai knoppie het nou self besluit jy lieg.',
    'Ma… ek het hierdie ding gebou. Ek het hiervoor beplan.',
    'Hy hardloop vinniger as ons almal wanneer jy sê ons moet skoonmaak.',
    'Jy kan hom jaag, maar jy gaan hom nie vang nie 😂',
    'Hierdie webblad aanvaar nie laster teen my ma nie.',
    'Regtig? Nog steeds? Ek bewonder die deursettingsvermoë.',
    'Nee. Absoluut nie. Volgende poging.',
    'Okay, nou maak jy die knoppie senuweeagtig.'
  ];

  function showScreen(screen) {
    [intro, quiz, complete].forEach((el) => el?.classList.remove('active'));
    screen?.classList.add('active');
  }

  function resetNoButton() {
    if (!noBtn) return;
    noBtn.classList.remove('dodging');
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.right = '';
    noBtn.style.transform = '';
    noBtn.style.opacity = '1';
    noBtn.style.scale = '1';
    noBtn.style.zIndex = '';
    noBtn.style.boxShadow = '';
    noBtn.style.transition = '';
  }

  function loadQuestion() {
    const q = data.questions[questionIndex];
    currentQuestionAnswered = false;
    noAttempts = 0;
    questionText.textContent = q.question;
    questionCounter.textContent = `Vraag ${questionIndex + 1} van ${data.questions.length}`;
    progressBar.style.width = `${((questionIndex + 1) / data.questions.length) * 100}%`;
    evidenceCard.classList.remove('show');
    evidenceCard.setAttribute('aria-hidden', 'true');
    noMessage.textContent = '';
    noMessage.setAttribute('aria-hidden', 'true');
    resetNoButton();
  }

  function farViewportPosition(rect) {
    const vv = window.visualViewport;
    const width = vv?.width || window.innerWidth;
    const height = vv?.height || window.innerHeight;
    const offsetLeft = vv?.offsetLeft || 0;
    const offsetTop = vv?.offsetTop || 0;
    const edge = window.innerWidth <= 600 ? 16 : 28;
    const safeTop = offsetTop + (window.innerWidth <= 600 ? 82 : 28);
    const minX = offsetLeft + edge;
    const maxX = Math.max(minX, offsetLeft + width - rect.width - edge);
    const minY = safeTop;
    const maxY = Math.max(minY, offsetTop + height - rect.height - 30);
    const currentX = rect.left;
    const currentY = rect.top;
    const targetDistance = Math.min(width, height) * (window.innerWidth <= 600 ? 0.38 : 0.32);
    const yesRect = yesBtn.getBoundingClientRect();

    let x = minX;
    let y = minY;
    let tries = 0;
    do {
      x = minX + Math.random() * Math.max(1, maxX - minX);
      y = minY + Math.random() * Math.max(1, maxY - minY);
      const tooCloseToYes = !(
        x + rect.width < yesRect.left - 18 ||
        x > yesRect.right + 18 ||
        y + rect.height < yesRect.top - 18 ||
        y > yesRect.bottom + 18
      );
      if (!tooCloseToYes && Math.hypot(x - currentX, y - currentY) >= targetDistance) break;
      tries += 1;
    } while (tries < 24);

    if (Math.hypot(x - currentX, y - currentY) < targetDistance * 0.75) {
      x = currentX < offsetLeft + width / 2 ? maxX : minX;
      y = currentY < offsetTop + height / 2 ? maxY : minY;
    }
    return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) };
  }

  function dodgeNoButton(event) {
    if (currentQuestionAnswered || !noBtn) return;
    const now = performance.now();

    // pointerdown/touch followed by click should count as one attempt, not two.
    if (event?.type === 'click' && now - lastDodgeAt < 420) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    lastDodgeAt = now;
    event?.preventDefault();
    event?.stopPropagation();

    noAttempts += 1;
    noMessage.textContent = cheekyMessages[(noAttempts - 1) % cheekyMessages.length];
    noMessage.setAttribute('aria-hidden', 'false');
    noMessage.animate(
      [{ opacity: 0, transform: 'translateY(7px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
      { duration: 300, easing: 'ease-out' }
    );

    const rect = noBtn.getBoundingClientRect();
    const { x, y } = farViewportPosition(rect);

    // Fixed positioning is the important mobile change: it can now flee across the screen,
    // not just inside the tiny answer area.
    noBtn.classList.add('dodging');
    noBtn.style.position = 'fixed';
    noBtn.style.right = 'auto';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.transform = 'none';
    noBtn.style.zIndex = '100';
    noBtn.style.boxShadow = '0 18px 50px rgba(0,0,0,.45), 0 0 30px rgba(145,100,255,.22)';
    noBtn.style.transition = 'left .15s cubic-bezier(.2,.8,.2,1), top .15s cubic-bezier(.2,.8,.2,1), opacity .15s ease';

    if (questionIndex === data.questions.length - 1 && noAttempts >= 3) {
      noBtn.style.scale = `${Math.max(.56, 1 - (noAttempts - 2) * .09)}`;
      if (noAttempts >= 6) {
        noBtn.style.opacity = '0';
        noMessage.textContent = 'Ja nee. Nou het jy hom heeltemal weggejaag. “Ek is” is al wat oor is 😂';
      }
    }
  }

  // Desktop: run before the mouse can settle on it.
  noBtn?.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') dodgeNoButton(e);
  });
  // Mobile: move on the first contact, before the browser can complete a click.
  if (noBtn) {
    if ('PointerEvent' in window) noBtn.addEventListener('pointerdown', dodgeNoButton);
    else noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
    noBtn.addEventListener('click', dodgeNoButton);
    noBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') dodgeNoButton(e);
    });
  }

  startQuiz?.addEventListener('click', () => {
    showScreen(quiz);
    loadQuestion();
  });

  yesBtn?.addEventListener('click', () => {
    if (currentQuestionAnswered) return;
    currentQuestionAnswered = true;
    const q = data.questions[questionIndex];
    resetNoButton();
    evidenceTitle.textContent = q.evidenceTitle;
    evidenceText.textContent = q.evidence;
    evidenceCard.classList.add('show');
    evidenceCard.setAttribute('aria-hidden', 'false');
    yesBtn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
      { duration: 360, easing: 'ease-out' }
    );
  });

  nextQuestion?.addEventListener('click', () => {
    if (questionIndex < data.questions.length - 1) {
      questionIndex += 1;
      loadQuestion();
      quiz.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else {
      showScreen(complete);
    }
  });

  enterMemoryLane?.addEventListener('click', () => {
    complete.classList.remove('active');
    memoryLane.hidden = false;
    requestAnimationFrame(() => {
      memoryLane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      initScrollAnimations();
    });
  });

  let scrollObserver;
  function initScrollAnimations() {
    scrollObserver?.disconnect();
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (!entry.target.matches('.university-sticky')) scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .16, rootMargin: '0px 0px -6% 0px' });
    $$('.scroll-reveal, .journey-card, .role-stack, .avalanche').forEach((el) => scrollObserver.observe(el));
  }

  const constellation = $('#constellation');
  const constellationCaption = $('#constellationCaption');
  const captions = {
    Ma: 'Die middelpunt van ons klein heelal.',
    Jy: 'Jou oudste — nou op pad universiteit toe.',
    Joshua: 'Een van die vier lewens wat jy elke dag help dra.',
    Caleb: 'Nog ’n hele persoon se wêreld waarvan jy alles probeer onthou.',
    Richter: 'Nog ’n kind wat altyd weet waar “huis” is.'
  };
  $$('.family-node').forEach((node) => node.addEventListener('click', () => {
    constellationCaption.textContent = captions[node.dataset.person] || node.dataset.person;
  }));
  constellation?.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = constellation.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - .5) * -4;
    const ry = ((e.clientX - rect.left) / rect.width - .5) * 4;
    constellation.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  constellation?.addEventListener('pointerleave', () => { constellation.style.transform = ''; });

  const localPhotoFiles = [
    'assets/photos/family/hero-1.jpg',
    'assets/photos/family/hero-2.jpg',
    'assets/photos/family/hero-3.jpg',
    'assets/photos/sports/sport-1.jpg',
    'assets/photos/sports/sport-2.jpg',
    'assets/photos/family/family-1.jpg',
    'assets/photos/sports/sport-3.jpg',
    'assets/photos/family/family-2.jpg',
    'assets/photos/south-africa/south-africa-1.jpg',
    'assets/photos/canada/canada-1.jpg',
    'assets/photos/sports/sport-4.jpg',
    'assets/photos/family/family-3.jpg',
    'assets/photos/misc/memory-1.jpg',
    'assets/photos/family/mom-1.jpg'
  ];
  $$('.placeholder-card').forEach((slot, index) => {
    const src = localPhotoFiles[index];
    if (!src) return;
    const img = new Image();
    img.alt = slot.textContent.trim() || 'Familie herinnering';
    img.onload = () => {
      slot.style.backgroundImage = `linear-gradient(180deg, transparent 55%, rgba(4,5,15,.62)), url("${src}")`;
      slot.style.backgroundSize = 'cover';
      slot.style.backgroundPosition = 'center';
      slot.classList.add('has-photo');
    };
    img.src = src;
  });

  const memoryDialog = $('#memoryDialog');
  const dialogCaption = $('#dialogCaption');
  $$('.memory-tile').forEach((tile) => tile.addEventListener('click', () => {
    dialogCaption.textContent = tile.dataset.caption || 'Herinnering';
    if (typeof memoryDialog?.showModal === 'function') memoryDialog.showModal();
  }));
  $('[data-close-dialog]')?.addEventListener('click', () => memoryDialog?.close());
  memoryDialog?.addEventListener('click', (e) => { if (e.target === memoryDialog) memoryDialog.close(); });

  const wall = $('#avalancheWall');
  if (wall) {
    for (let i = 0; i < 24; i += 1) {
      const card = document.createElement('div');
      card.className = 'avalanche-card';
      card.style.left = `${Math.random() * 90}%`;
      card.style.top = `${Math.random() * 78}%`;
      card.style.setProperty('--r', `${-12 + Math.random() * 24}deg`);
      card.style.transitionDelay = `${Math.random() * .75}s`;
      wall.appendChild(card);
    }
  }

  const openLetter = $('#openLetter');
  const letterDialog = $('#letterDialog');
  const letterBody = $('#letterBody');
  data.letter.body.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    letterBody?.appendChild(p);
  });
  let holdTimer = null;
  function cancelLetterHold() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
    openLetter?.getAnimations().forEach((a) => a.cancel());
  }
  openLetter?.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    openLetter.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.975)' }],
      { duration: 700, fill: 'forwards', easing: 'linear' }
    );
    holdTimer = window.setTimeout(() => {
      holdTimer = null;
      if (typeof letterDialog?.showModal === 'function') letterDialog.showModal();
      openLetter.getAnimations().forEach((a) => a.cancel());
    }, 650);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => openLetter?.addEventListener(name, cancelLetterHold));
  openLetter?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (typeof letterDialog?.showModal === 'function') letterDialog.showModal();
    }
  });
  $('[data-close-letter]')?.addEventListener('click', () => letterDialog?.close());

  const journey = $('.journey-card');
  if (journey) {
    const journeyObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) journey.classList.add('in-view');
    }, { threshold: .35 });
    journeyObserver.observe(journey);
  }

  window.addEventListener('scroll', () => {
    if (window.innerWidth < 861 || memoryLane?.hidden) return;
    const stack = $('.hero-photo-stack');
    if (!stack) return;
    const rect = stack.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const amount = (window.innerHeight / 2 - rect.top) * .025;
    const cards = $$('.photo-card', stack);
    if (cards[0]) cards[0].style.translate = `0 ${amount}px`;
    if (cards[1]) cards[1].style.translate = `0 ${-amount * .7}px`;
    if (cards[2]) cards[2].style.translate = `0 ${amount * .45}px`;
  }, { passive: true });

  noBtn?.setAttribute('type', 'button');
  yesBtn?.setAttribute('type', 'button');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.scroll-reveal').forEach((el) => el.classList.add('in-view'));
  }
})();
