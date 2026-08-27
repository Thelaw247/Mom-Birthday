(() => {
  const dataEl = document.getElementById('site-content');
  const data = JSON.parse(dataEl.textContent);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // 38 tiny lights for 38 years.
  const stars = $('#stars');
  for (let i = 0; i < data.site.age; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3.4}s`;
    star.style.animationDuration = `${2.4 + Math.random() * 3.8}s`;
    stars.appendChild(star);
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

  let questionIndex = 0;
  let noAttempts = 0;
  let currentQuestionAnswered = false;

  const cheekyMessages = [
    'Nee wat. Daardie antwoord werk nie vandag nie.',
    'Mooi probeer, Ma.',
    'Verkeerde antwoorde is vir vandag afgeskakel.',
    'Ons het ongelukkig bewyse.',
    'Daai knoppie is blykbaar skaam.',
    'Jy kan probeer. Hy gaan steeds weghardloop.',
    'Ma. Ons het hierdie webblad gebou. Jy gaan nie wen nie.',
    'Dis oulik dat jy nog probeer.',
    'Nee. Volgende poging.',
    'Hierdie een is nie onderhandelbaar nie.'
  ];

  function showScreen(screen) {
    [intro, quiz, complete].forEach((el) => el.classList.remove('active'));
    screen.classList.add('active');
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

  function resetNoButton() {
    noBtn.classList.remove('dodging');
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.right = '';
    noBtn.style.transform = '';
    noBtn.style.opacity = '1';
    noBtn.style.scale = '1';
  }

  function dodgeNoButton(event) {
    if (currentQuestionAnswered) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    noAttempts += 1;
    noMessage.textContent = cheekyMessages[Math.min(noAttempts - 1, cheekyMessages.length - 1)];
    noMessage.setAttribute('aria-hidden', 'false');

    const zone = $('#answerZone');
    const zoneRect = zone.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const padding = 8;
    const maxX = Math.max(padding, zoneRect.width - btnRect.width - padding);
    const maxY = Math.max(padding, zoneRect.height - btnRect.height - padding);

    noBtn.classList.add('dodging');
    noBtn.style.right = 'auto';
    noBtn.style.transform = 'none';

    let x = padding + Math.random() * Math.max(1, maxX - padding);
    let y = padding + Math.random() * Math.max(1, maxY - padding);

    // Keep it away from the yes button when possible.
    const yesRect = yesBtn.getBoundingClientRect();
    const relativeYesX = yesRect.left - zoneRect.left;
    const relativeYesY = yesRect.top - zoneRect.top;
    if (Math.abs(x - relativeYesX) < btnRect.width * 0.9 && Math.abs(y - relativeYesY) < btnRect.height * 1.3) {
      x = x < zoneRect.width / 2 ? maxX : padding;
      y = y < zoneRect.height / 2 ? maxY : padding;
    }

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;

    if (questionIndex === data.questions.length - 1 && noAttempts >= 3) {
      noBtn.style.scale = `${Math.max(0.56, 1 - (noAttempts - 2) * 0.09)}`;
      if (noAttempts >= 6) {
        noBtn.style.opacity = '0';
        noMessage.textContent = 'Ja nee. Ons het hom nou heeltemal verwyder.';
      }
    }
  }

  // Desktop: flee before the cursor arrives.
  noBtn.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') dodgeNoButton(e);
  });
  // Mobile/touch: the first touch moves it before a click can be generated.
  noBtn.addEventListener('pointerdown', dodgeNoButton);
  noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
  noBtn.addEventListener('click', dodgeNoButton);
  noBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') dodgeNoButton(e);
  });

  startQuiz.addEventListener('click', () => {
    showScreen(quiz);
    loadQuestion();
  });

  yesBtn.addEventListener('click', () => {
    if (currentQuestionAnswered) return;
    currentQuestionAnswered = true;
    const q = data.questions[questionIndex];
    evidenceTitle.textContent = q.evidenceTitle;
    evidenceText.textContent = q.evidence;
    evidenceCard.classList.add('show');
    evidenceCard.setAttribute('aria-hidden', 'false');
    yesBtn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
      { duration: 360, easing: 'ease-out' }
    );
  });

  nextQuestion.addEventListener('click', () => {
    if (questionIndex < data.questions.length - 1) {
      questionIndex += 1;
      loadQuestion();
      quiz.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else {
      showScreen(complete);
    }
  });

  enterMemoryLane.addEventListener('click', () => {
    complete.classList.remove('active');
    memoryLane.hidden = false;
    requestAnimationFrame(() => {
      memoryLane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      initScrollAnimations();
    });
  });

  // Scroll reveal + special scene triggers.
  let scrollObserver;
  function initScrollAnimations() {
    if (scrollObserver) scrollObserver.disconnect();
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (!entry.target.matches('.university-sticky')) scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

    $$('.scroll-reveal, .journey-card, .role-stack, .avalanche').forEach((el) => scrollObserver.observe(el));
  }

  // Constellation feels alive, but stays usable on touch screens.
  const constellation = $('#constellation');
  const constellationCaption = $('#constellationCaption');
  const captions = {
    'Ma': 'Die middelpunt van ons klein heelal.',
    'Jy': 'Jou oudste — nou op pad universiteit toe.',
    'Joshua': 'Een van die vier lewens wat jy elke dag help dra.',
    'Caleb': 'Nog ’n hele persoon se wêreld waarvan jy alles probeer onthou.',
    'Richter': 'Nog ’n kind wat altyd weet waar “huis” is.'
  };
  $$('.family-node').forEach((node) => {
    node.addEventListener('click', () => {
      constellationCaption.textContent = captions[node.dataset.person] || node.dataset.person;
    });
  });
  constellation.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = constellation.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
    constellation.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  constellation.addEventListener('pointerleave', () => { constellation.style.transform = ''; });

  // Photo placeholders can later be replaced just by dropping in files with these names.
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

  // Memory lightbox.
  const memoryDialog = $('#memoryDialog');
  const dialogCaption = $('#dialogCaption');
  $$('.memory-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      dialogCaption.textContent = tile.dataset.caption || 'Herinnering';
      if (typeof memoryDialog.showModal === 'function') memoryDialog.showModal();
    });
  });
  $('[data-close-dialog]').addEventListener('click', () => memoryDialog.close());
  memoryDialog.addEventListener('click', (e) => { if (e.target === memoryDialog) memoryDialog.close(); });

  // Build the memory avalanche from small cards.
  const avalanche = $('#avalanche');
  const wall = $('#avalancheWall');
  for (let i = 0; i < 24; i += 1) {
    const card = document.createElement('div');
    card.className = 'avalanche-card';
    card.style.left = `${Math.random() * 90}%`;
    card.style.top = `${Math.random() * 78}%`;
    card.style.setProperty('--r', `${-12 + Math.random() * 24}deg`);
    card.style.transitionDelay = `${Math.random() * 0.75}s`;
    wall.appendChild(card);
  }

  // Hold-to-open letter: works with mouse and mobile touch.
  const openLetter = $('#openLetter');
  const letterDialog = $('#letterDialog');
  const letterBody = $('#letterBody');
  data.letter.body.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    letterBody.appendChild(p);
  });

  let holdTimer = null;
  let holdStart = 0;
  function beginLetterHold(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    holdStart = performance.now();
    openLetter.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.975)' }],
      { duration: 700, fill: 'forwards', easing: 'linear' }
    );
    holdTimer = window.setTimeout(() => {
      holdTimer = null;
      if (typeof letterDialog.showModal === 'function') letterDialog.showModal();
      openLetter.getAnimations().forEach((a) => a.cancel());
    }, 650);
  }
  function cancelLetterHold() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
    openLetter.getAnimations().forEach((a) => a.cancel());
  }
  openLetter.addEventListener('pointerdown', beginLetterHold);
  openLetter.addEventListener('pointerup', cancelLetterHold);
  openLetter.addEventListener('pointercancel', cancelLetterHold);
  openLetter.addEventListener('pointerleave', cancelLetterHold);
  openLetter.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (typeof letterDialog.showModal === 'function') letterDialog.showModal();
    }
  });
  $('[data-close-letter]').addEventListener('click', () => letterDialog.close());

  // Make the journey animation react even if the browser opens mid-page.
  const journey = $('.journey-card');
  const journeyObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) journey.classList.add('in-view');
  }, { threshold: .35 });
  journeyObserver.observe(journey);

  // Gentle parallax for the three hero memory cards on desktop only.
  window.addEventListener('scroll', () => {
    if (window.innerWidth < 861 || memoryLane.hidden) return;
    const stack = $('.hero-photo-stack');
    if (!stack) return;
    const rect = stack.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const amount = (window.innerHeight / 2 - rect.top) * 0.025;
    const cards = $$('.photo-card', stack);
    if (cards[0]) cards[0].style.translate = `0 ${amount}px`;
    if (cards[1]) cards[1].style.translate = `0 ${-amount * .7}px`;
    if (cards[2]) cards[2].style.translate = `0 ${amount * .45}px`;
  }, { passive: true });

  // Safety: never let the fake negative answer submit/activate via context quirks.
  noBtn.setAttribute('type', 'button');
  yesBtn.setAttribute('type', 'button');

  // If reduced motion is requested, reveal all content immediately.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.scroll-reveal').forEach((el) => el.classList.add('in-view'));
  }
})();
