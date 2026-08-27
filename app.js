(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Dorothy's exact birth time is unknown. The live clock is anchored to
  // 00:00 on 26 August 1988 in South Africa Standard Time (UTC+2).
  const birth = new Date('1988-08-25T22:00:00.000Z');
  const DAY = 86400000;
  const MINUTE = 60000;
  const formatter = new Intl.NumberFormat('en-CA');

  const style = document.createElement('style');
  style.textContent = `
    .age-gate-screen,.stats-screen,.wrong-age-screen{width:100%;}
    .age-gate-inner,.wrong-age-inner,.stats-inner{width:min(980px,100%);margin:auto;text-align:center;}
    .age-gate-card,.wrong-age-card{width:min(660px,100%);margin:auto;padding:clamp(28px,6vw,58px);border-radius:32px;}
    .age-gate-title,.wrong-age-title,.stats-title{font-size:clamp(2.8rem,8vw,6.4rem);line-height:.95;letter-spacing:-.055em;margin:16px 0 20px;}
    .age-gate-copy,.wrong-age-copy,.stats-copy{color:var(--muted);font-size:clamp(1rem,2.2vw,1.2rem);line-height:1.7;max-width:680px;margin:0 auto 28px;}
    .age-form{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;}
    .age-input{width:150px;padding:16px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.17);background:rgba(255,255,255,.07);color:white;text-align:center;font-size:1.2rem;font-weight:850;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.08);}
    .age-input:focus{border-color:#8ea0ff;box-shadow:0 0 0 4px rgba(112,107,255,.14);}
    .age-breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:32px 0;}
    .age-breakdown div{padding:18px 12px;border-radius:20px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);}
    .age-breakdown strong{display:block;font-size:clamp(1.3rem,3vw,2.2rem);letter-spacing:-.03em;}
    .age-breakdown span{display:block;color:#aeb5d1;font-size:.8rem;margin-top:5px;text-transform:uppercase;letter-spacing:.09em;}
    .stats-screen.active{display:block!important;min-height:100svh;padding:max(72px,env(safe-area-inset-top)) max(20px,5vw) 80px;overflow:visible;}
    .stats-header{max-width:800px;margin:0 auto 44px;text-align:center;}
    .stats-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:980px;margin:auto;}
    .stat-card{min-height:240px;padding:clamp(24px,4vw,38px);border-radius:28px;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 70px rgba(0,0,0,.24);}
    .stat-card small{color:#aeb8ff;font-weight:800;text-transform:uppercase;letter-spacing:.14em;}
    .stat-number{display:block;font-size:clamp(2.1rem,6vw,4.8rem);font-weight:950;letter-spacing:-.06em;line-height:.95;margin:14px 0 12px;overflow-wrap:anywhere;}
    .stat-card p{color:var(--muted);line-height:1.55;margin:0;}
    .stats-footer{max-width:720px;margin:42px auto 0;text-align:center;}
    .stats-note{font-size:.82rem;color:#9fa6c2;line-height:1.55;margin-bottom:20px;}
    #statsContinue:disabled{opacity:.38;cursor:not-allowed;filter:saturate(.35);}
    #statsUnlockHint{min-height:1.4em;color:#b8c1ff;margin:12px 0 20px;font-size:.9rem;}
    .live-age-widget{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));z-index:9999;width:min(245px,calc(100vw - 24px));padding:11px 14px;border-radius:18px;background:rgba(10,12,31,.72);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:0 14px 45px rgba(0,0,0,.3);pointer-events:none;transition:.3s ease;}
    .live-age-widget .widget-label{display:block;color:#aeb8ff;font-size:.61rem;font-weight:850;text-transform:uppercase;letter-spacing:.13em;margin-bottom:4px;}
    .live-age-widget .widget-main{display:flex;align-items:baseline;gap:7px;white-space:nowrap;}
    .live-age-widget .widget-main strong{font-size:1rem;}
    .live-age-widget .widget-main span{font-size:.68rem;color:#b9bfd8;overflow:hidden;text-overflow:ellipsis;}
    .widget-locked .widget-main strong{letter-spacing:.12em;color:#d2d6ea;}
    @media(max-width:650px){
      .age-breakdown{grid-template-columns:repeat(2,1fr);}
      .stats-grid{grid-template-columns:1fr;}
      .stat-card{min-height:205px;}
      .live-age-widget{width:auto;max-width:185px;padding:8px 10px;border-radius:14px;}
      .live-age-widget .widget-main strong{font-size:.82rem;}
      .live-age-widget .widget-main span{font-size:.58rem;}
      .live-age-widget .widget-label{font-size:.53rem;}
    }
  `;
  document.head.appendChild(style);

  const intro = $('#intro');
  if (!intro) return;
  intro.classList.remove('active');

  const gate = document.createElement('section');
  gate.id = 'ageGate';
  gate.className = 'screen age-gate-screen active';
  gate.innerHTML = `
    <div class="age-gate-inner">
      <div class="age-gate-card glass-card">
        <p class="kicker">Eers een baie belangrike vraag</p>
        <h1 class="age-gate-title">Hoe oud is jy nou, Mamma?</h1>
        <p class="age-gate-copy">Geen druk nie. Dis net die eerste sekuriteitskontrole.</p>
        <form id="ageForm" class="age-form">
          <input id="ageInput" class="age-input" type="number" inputmode="numeric" min="0" max="120" step="1" required aria-label="Jou ouderdom" placeholder="Jare">
          <button class="primary-btn" type="submit">Dit is my antwoord <span>→</span></button>
        </form>
      </div>
    </div>`;

  const wrong = document.createElement('section');
  wrong.id = 'wrongAge';
  wrong.className = 'screen wrong-age-screen';
  wrong.innerHTML = `
    <div class="wrong-age-inner">
      <div class="wrong-age-card glass-card">
        <p class="kicker">Ai, Mamma 😌</p>
        <h2 class="wrong-age-title">Nie heeltemal nie.</h2>
        <p class="wrong-age-copy">Jy is eintlik <strong id="wrongYearsText">38</strong> jaar oud. Of, as ons onnodig presies wil wees…</p>
        <div class="age-breakdown">
          <div><strong id="ageYears">—</strong><span>jaar</span></div>
          <div><strong id="ageMonths">—</strong><span>maande</span></div>
          <div><strong id="ageWeeks">—</strong><span>weke</span></div>
          <div><strong id="ageDays">—</strong><span>dae</span></div>
          <div><strong id="ageHours">—</strong><span>ure</span></div>
          <div><strong id="ageMinutes">—</strong><span>minute</span></div>
          <div style="grid-column:1/-1"><strong id="ageSeconds">—</strong><span>sekondes — en steeds aan die tel</span></div>
        </div>
        <button id="wrongAgeContinue" class="primary-btn">Okay, wys my die res <span>→</span></button>
      </div>
    </div>`;

  const stats = document.createElement('section');
  stats.id = 'statsScreen';
  stats.className = 'screen stats-screen';
  stats.innerHTML = `
    <div class="stats-inner">
      <div class="stats-header">
        <p class="kicker">38 jaar klink eenvoudig</p>
        <h2 class="stats-title">Tot jy dit begin uitmekaar haal.</h2>
        <p class="stats-copy">Hier is ’n paar totaal onnodige — maar nogal indrukwekkende — maniere om Mamma se tyd op aarde te meet.</p>
      </div>
      <div class="stats-grid">
        <article class="stat-card"><small>Jy leef al vir ongeveer</small><strong id="statSeconds" class="stat-number">—</strong><p>sekondes. Hierdie een hou aan tel terwyl jy kyk.</p></article>
        <article class="stat-card"><small>Jou hart het ongeveer</small><strong id="statHeartbeats" class="stat-number">—</strong><p>keer geklop, met ’n eenvoudige leeftydskatting van gemiddeld 70 slae per minuut.</p></article>
        <article class="stat-card"><small>As ’n mens 8 uur per nag slaap</small><strong id="statSleep" class="stat-number">—</strong><p>van jou lewe sou ongeveer aan slaap bestee gewees het.</p></article>
        <article class="stat-card"><small>As ’n stort gemiddeld 8 minute duur</small><strong id="statWater" class="stat-number">—</strong><p>water teen ongeveer 9.5 L/min — net ’n speelse skatting, maar steeds ’n belaglike hoeveelheid water.</p></article>
        <article class="stat-card"><small>Totale dae op aarde</small><strong id="statDays" class="stat-number">—</strong><p>dae waarin jy kon werk, lag, plan maak, kinders rondry en almal probeer leer om maniere te hê.</p></article>
        <article id="lastStatCard" class="stat-card"><small>Reise om die son</small><strong class="stat-number">38</strong><p>En gelukkig is daar nog baie oor. Jou eie volgende hoofstuk tel ook.</p></article>
      </div>
      <div class="stats-footer">
        <p class="stats-note">Die sekonde-, minuut-, uur- en dagtellings gebruik 00:00 op 26 Augustus 1988 in Suid-Afrika as anker omdat ons nie jou presiese geboortetyd hier gebruik nie. Hartklop, slaap en stortwater is doelbewus gemerkte skattings.</p>
        <p id="statsUnlockHint">Kyk eers deur al die statistieke ↓</p>
        <button id="statsContinue" class="primary-btn" disabled>Goed. Bring nou die toets <span>→</span></button>
      </div>
    </div>`;

  intro.parentNode.insertBefore(gate, intro);
  intro.parentNode.insertBefore(wrong, intro);
  intro.parentNode.insertBefore(stats, intro);

  const widget = document.createElement('aside');
  widget.id = 'liveAgeWidget';
  widget.className = 'live-age-widget widget-locked';
  widget.setAttribute('aria-live', 'polite');
  widget.innerHTML = `<span class="widget-label">Mamma se live ouderdom</span><div class="widget-main"><strong id="widgetYears">???</strong><span id="widgetSeconds">wag vir antwoord…</span></div>`;
  document.body.appendChild(widget);

  const preScreens = [gate, wrong, stats, intro, $('#quiz'), $('#quizComplete')];
  const show = (screen) => {
    preScreens.forEach((x) => x?.classList.remove('active'));
    screen?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  function lifetime(now = new Date()) {
    const ms = Math.max(0, now - birth);
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(ms / MINUTE);
    const totalHours = Math.floor(ms / 3600000);
    const totalDays = Math.floor(ms / DAY);
    const totalWeeks = Math.floor(totalDays / 7);

    // Calendar age in South Africa time.
    const sast = new Date(now.getTime() + 2 * 3600000);
    const birthYear = 1988;
    const birthMonth = 7; // August, zero-indexed.
    const birthDay = 26;
    let years = sast.getUTCFullYear() - birthYear;
    if (sast.getUTCMonth() < birthMonth || (sast.getUTCMonth() === birthMonth && sast.getUTCDate() < birthDay)) years -= 1;
    let months = (sast.getUTCFullYear() - birthYear) * 12 + (sast.getUTCMonth() - birthMonth);
    if (sast.getUTCDate() < birthDay) months -= 1;
    return { years, months, totalWeeks, totalDays, totalHours, totalMinutes, totalSeconds };
  }

  const setText = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = value;
  };

  function updateLifetime() {
    const a = lifetime();
    setText('#wrongYearsText', formatter.format(a.years));
    setText('#ageYears', formatter.format(a.years));
    setText('#ageMonths', formatter.format(a.months));
    setText('#ageWeeks', formatter.format(a.totalWeeks));
    setText('#ageDays', formatter.format(a.totalDays));
    setText('#ageHours', formatter.format(a.totalHours));
    setText('#ageMinutes', formatter.format(a.totalMinutes));
    setText('#ageSeconds', formatter.format(a.totalSeconds));
    setText('#statSeconds', formatter.format(a.totalSeconds));
    setText('#statHeartbeats', `≈ ${formatter.format(Math.floor(a.totalMinutes * 70))}`);
    setText('#statSleep', `≈ ${(a.totalHours / 3 / 24 / 365.2425).toFixed(1)} jaar`);
    setText('#statWater', `≈ ${formatter.format(Math.floor(a.totalDays * 8 * 9.5))} L`);
    setText('#statDays', formatter.format(a.totalDays));
    if (!widget.classList.contains('widget-locked')) {
      setText('#widgetYears', `${a.years} jaar`);
      setText('#widgetSeconds', `${formatter.format(a.totalSeconds)} sekondes`);
    }
  }

  updateLifetime();
  setInterval(updateLifetime, 1000);

  function revealWidget() {
    widget.classList.remove('widget-locked');
    updateLifetime();
  }

  let statsObserver;
  function armStatsGate() {
    const btn = $('#statsContinue');
    const last = $('#lastStatCard');
    btn.disabled = true;
    setText('#statsUnlockHint', 'Kyk eers deur al die statistieke ↓');
    statsObserver?.disconnect();
    statsObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)) {
        window.setTimeout(() => {
          btn.disabled = false;
          setText('#statsUnlockHint', 'Reg. Nou kan ons aangaan.');
        }, 650);
        statsObserver.disconnect();
      }
    }, { threshold: [0.6] });
    statsObserver.observe(last);
  }

  $('#ageForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = Number($('#ageInput').value);
    if (!Number.isFinite(value)) return;
    revealWidget();
    updateLifetime();
    if (value === lifetime().years) {
      show(stats);
      requestAnimationFrame(armStatsGate);
    } else {
      show(wrong);
    }
  });

  $('#wrongAgeContinue')?.addEventListener('click', () => {
    show(stats);
    requestAnimationFrame(armStatsGate);
  });

  let mainLoaded = false;
  function loadMainAndStartQuiz() {
    if (mainLoaded) return;
    mainLoaded = true;
    const script = document.createElement('script');
    script.src = 'main-app.js';
    script.onload = () => {
      // Skip the old intro screen: stats flow directly into the quiz wall.
      $('#startQuiz')?.click();
    };
    script.onerror = () => {
      mainLoaded = false;
      setText('#statsUnlockHint', 'Die toets wou nie laai nie. Probeer asseblief weer.');
      $('#statsContinue').disabled = false;
    };
    document.body.appendChild(script);
  }

  $('#statsContinue')?.addEventListener('click', () => {
    if ($('#statsContinue').disabled) return;
    show(intro);
    loadMainAndStartQuiz();
  });
})();