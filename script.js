document.addEventListener('DOMContentLoaded', () => {

  /* ============ PRELOADER (terminal boot sequence) ============ */
  const preloader = document.getElementById('preloader');
  const lines = document.querySelectorAll('.pre-line');
  const barFill = document.getElementById('preBarFill');
  const percentLabel = document.getElementById('prePercent');

  function typeLine(el, cb){
    const text = el.dataset.text;
    el.classList.add('show');
    el.style.borderRightColor = 'rgba(167,139,250,.6)';
    let i = 0;
    const speed = 14;
    const timer = setInterval(() => {
      el.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length){
        clearInterval(timer);
        el.style.borderRightColor = 'transparent';
        cb && cb();
      }
    }, speed);
  }

  function runBoot(index){
    if (index >= lines.length){
      finishBoot();
      return;
    }
    typeLine(lines[index], () => runBoot(index + 1));
  }

  let progress = 0;
  const progressTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 14);
    barFill.style.width = progress + '%';
    percentLabel.textContent = String(Math.floor(progress)).padStart(2, '0') + '%';
    if (progress >= 100) clearInterval(progressTimer);
  }, 140);

  function finishBoot(){
    progress = 100;
    barFill.style.width = '100%';
    percentLabel.textContent = '100%';
    setTimeout(() => {
      preloader.classList.add('hide');
      document.body.style.overflow = '';
      initRevealsOnLoad();
      maybeShowWelcome();
    }, 500);
  }

  document.body.style.overflow = 'hidden';
  runBoot(0);
  // safety fallback in case something stalls
  setTimeout(() => { if (!preloader.classList.contains('hide')) finishBoot(); }, 6000);

  /* ============ WELCOME MODAL (first visit only) ============ */
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const welcomeClose = document.getElementById('welcomeClose');
  const welcomeEnter = document.getElementById('welcomeEnter');

  function maybeShowWelcome(){
    let hasVisited = false;
    try { hasVisited = localStorage.getItem('fmp_portfolio_visited') === 'true'; } catch (e) {}
    if (!hasVisited){
      welcomeOverlay.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  }
  function closeWelcome(){
    welcomeOverlay.hidden = true;
    document.body.style.overflow = '';
    try { localStorage.setItem('fmp_portfolio_visited', 'true'); } catch (e) {}
  }
  welcomeClose.addEventListener('click', closeWelcome);
  welcomeEnter.addEventListener('click', closeWelcome);
  welcomeOverlay.addEventListener('click', (e) => { if (e.target === welcomeOverlay) closeWelcome(); });

  /* ============ NAV: mobile toggle + scroll state + active link ============ */
  const nav = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  const sections = document.querySelectorAll('main .section, .hero');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  /* ============ SCROLL PROGRESS BAR ============ */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ============ SCROLL REVEAL ANIMATIONS ============ */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function initRevealsOnLoad(){
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ============ LIVE CLOCK (Asia/Dhaka) ============ */
  const clockEl = document.getElementById('liveClock');
  function updateClock(){
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Dhaka'
      }).format(now);
      clockEl.textContent = formatted + ' GMT+6';
    } catch (e) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ============ UPTIME COUNTER (days since starting the cybersecurity track) ============ */
  const uptimeEl = document.getElementById('uptimeCounter');
  const startDate = new Date('2023-01-01T00:00:00Z');
  function updateUptime(){
    const diffMs = Date.now() - startDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    uptimeEl.textContent = days.toLocaleString() + ' days';
  }
  updateUptime();

  /* ============ SET FOOTER YEAR ============ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ============ PROJECT DETAIL MODAL ============ */
  const PROJECTS = {
    issuetrackr: {
      tag: 'Web Platform',
      title: 'Issue-Trackr',
      image: 'assets/thumb-issuetrackr.svg',
      desc: 'An Issue & Change Request Management System that lets teams report, assign, and resolve system issues through a shared workflow — with status tracking and comment threads so nothing gets lost between report and resolution.',
      tags: ['Web App', 'Workflow Management'],
      link: 'https://github.com/git-purno/issue-trackr.git'
    },
    supershop: {
      tag: 'Desktop App',
      title: 'Online Supershop Management System',
      image: 'assets/thumb-supershop.svg',
      desc: 'A desktop retail application covering the full store loop — stocking inventory, ringing up sales at checkout, and reporting on performance — built for speed at the counter and accuracy in the records behind it.',
      tags: ['Java', 'MySQL'],
      link: ''
    },
    bus: {
      tag: 'Full-Stack',
      title: 'University Student Bus Management System',
      image: 'assets/thumb-bus.svg',
      desc: 'A full-stack Laravel application for a university transport office to manage routes, assign buses and drivers, publish schedules, and track student allocations — replacing spreadsheets and word-of-mouth coordination.',
      tags: ['Laravel', 'PHP', 'MySQL'],
      link: ''
    },
    greenev: {
      tag: 'Robotics',
      title: 'GreenEV',
      image: 'assets/thumb-greenev.svg',
      desc: 'A solar-powered EV charging station with an integrated storage unit — charging directly from solar when available, and drawing on stored power when it isn\u2019t, keeping the charge cycle running independent of sunlight.',
      tags: ['Solar Power', 'Embedded Systems'],
      link: ''
    }
  };

  const projectOverlay = document.getElementById('projectOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalImage = document.getElementById('modalImage');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTags = document.getElementById('modalTags');
  const modalLink = document.getElementById('modalLink');

  function openProject(id){
    const p = PROJECTS[id];
    if (!p) return;
    modalImage.src = p.image;
    modalImage.alt = p.title + ' project thumbnail';
    modalTag.textContent = p.tag;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalTags.innerHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    if (p.link){
      modalLink.href = p.link;
      modalLink.style.display = 'inline-block';
    } else {
      modalLink.removeAttribute('href');
      modalLink.style.display = 'none';
    }
    projectOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeProject(){
    projectOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.project));
  });
  modalClose.addEventListener('click', closeProject);
  projectOverlay.addEventListener('click', (e) => { if (e.target === projectOverlay) closeProject(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !projectOverlay.hidden) closeProject(); });

});
