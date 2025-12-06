async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setTextById(id, text) {
  const el = typeof id === 'string' ? document.getElementById(id) : null;
  if (el && typeof text === 'string') el.textContent = text;
}

function applySiteContent(site) {
  if (!site) return;
  // Hero
  if (site.hero) {
    setTextById('hero-name', site.hero.name);
    setTextById('hero-title', site.hero.title);
    setTextById('hero-subtitle', site.hero.subtitle);
    if (site.hero.image) {
      const heroImg = document.querySelector('#hero picture img');
      if (heroImg) {
        heroImg.src = site.hero.image;
        // Optional: update preload? (can’t change link preload reliably at runtime)
      }
    }
  }
  // About
  if (site.about) {
    setTextById('about-title', site.about.title);
    setTextById('about-text', site.about.text);
  }
  // KPI
  if (Array.isArray(site.kpi)) {
    const kpiGrid = document.getElementById('kpi-grid');
    if (kpiGrid) {
      kpiGrid.innerHTML = site.kpi
        .map(({ label, value }) => `
          <div class="bg-white rounded-lg shadow px-4 py-5 flex flex-col items-center justify-center text-center">
            <div class="text-2xl sm:text-3xl font-semibold text-blue-600">${value}</div>
            <div class="mt-1 text-xs sm:text-sm text-slate-600">${label}</div>
          </div>
        `)
        .join('');
    }
  }
  // Experience
  if (site.experience && Array.isArray(site.experience.items)) {
    setTextById('experience-title', site.experience.title || 'Experience');
    const timeline = document.getElementById('experience-timeline');
    if (timeline) {
      timeline.innerHTML = site.experience.items
        .map(({ period, company, location, role, bullets = [] }) => `
          <article class="relative pl-6 border-l border-slate-200">            
            <div class="text-xs font-medium text-slate-500">${period} · ${location}</div>
            <h3 class="mt-1 text-base sm:text-lg font-semibold text-slate-900">${role} · ${company}</h3>
            <ul class="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
              ${bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </article>
        `)
        .join('');
    }
  }
  // Section headings
  if (site.skills && site.skills.title) setTextById('skills-title', site.skills.title);
  if (site.projects && site.projects.title) setTextById('projects-title', site.projects.title);
  if (site.contact) {
    setTextById('contact-title', site.contact.title);
    setTextById('contact-text', site.contact.text);
  }
}

function skillItem({ name, proficiency }) {
  const pct = Math.max(0, Math.min(100, Number(proficiency) || 0));
  return `
    <div class="bg-white rounded-lg shadow p-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-base font-medium text-slate-800">${name}</h3>
        <span class="text-sm text-slate-500">${pct}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function projectCard({ title, description, techStack = [], imagePath, githubUrl, demoUrl }) {
  const tech = techStack.join(', ');
  const ext = (imagePath || '').split('.').pop()?.toLowerCase();
  let media = '';
  if (['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(ext)) {
    const base = (imagePath || '').replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');
    media = `
      <picture>
        <source srcset="${base}.avif" type="image/avif" />
        <source srcset="${base}.webp" type="image/webp" />
        <img src="${imagePath}" alt="${title}" class="w-full h-48 object-cover" loading="lazy" />
      </picture>
    `;
  } else {
    // SVG fallback: include width/height to reduce CLS
    media = `<img src="${imagePath}" alt="${title}" width="800" height="450" class="w-full h-48 object-cover" loading="lazy" />`;
  }
  return `
    <article class="bg-white rounded-lg shadow overflow-hidden">
      ${media}
      <div class="p-5">
        <h3 class="text-lg font-semibold text-slate-900">${title}</h3>
        <p class="mt-2 text-slate-600 text-sm">${description}</p>
        <p class="mt-3 text-slate-500 text-xs">Tech: ${tech}</p>
        <div class="mt-4 flex flex-wrap gap-2 text-xs">
          ${githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">
              <span>GitHub</span>
            </a>` : ''}
          ${demoUrl ? `<a href="${demoUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800">
              <span>Live Demo</span>
            </a>` : ''}
        </div>
      </div>
    </article>
  `;
}

let skillsChartRef = null;
let mlopsChartRef = null;

function buildSkillsChart(skills) {
  if (!window.Chart) return;
  const ctx = document.getElementById('skillsChart');
  if (!ctx) return;
  if (skillsChartRef) {
    skillsChartRef.destroy();
    skillsChartRef = null;
  }
  const trackPlugin = {
    id: 'trackPlugin',
    beforeDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta) return;
      ctx.save();
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-surface').trim() || '#e5e7eb';
      meta.data.forEach((bar) => {
        const { y, height } = bar.getProps(['y', 'height'], true);
        const chartArea = chart.chartArea;
        const x0 = chartArea.left + 2;
        const x1 = chartArea.right - 2;
        const bw = x1 - x0;
        const by = y - height / 2 + 1;
        const bh = height - 2;
        ctx.fillRect(x0, by, bw, bh);
      });
      ctx.restore();
    },
  };

  const labels = skills.map(s => s.name);
  const data = skills.map(s => Math.max(0, Math.min(100, Number(s.proficiency) || 0)));
  skillsChartRef = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Proficiency',
        data,
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--color-primary-600').trim() || '#2563eb',
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: { display: false },
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--color-muted').trim() || '#64748b' },
        },
        y: {
          grid: { display: false },
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--color-muted').trim() || '#64748b' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
    plugins: [trackPlugin],
  });
}

function buildMlopsProfileChart(mlopsProfile) {
  if (!window.Chart || !mlopsProfile || !Array.isArray(mlopsProfile.axes)) return;
  const ctx = document.getElementById('mlopsProfileChart');
  if (!ctx) return;
  if (mlopsChartRef) {
    mlopsChartRef.destroy();
    mlopsChartRef = null;
  }
  const labels = mlopsProfile.axes.map(a => a.label);
  const data = mlopsProfile.axes.map(a => Number(a.value) || 0);
  mlopsChartRef = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'MLOps Profile',
          data,
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          borderColor: getComputedStyle(document.body).getPropertyValue('--color-primary-600').trim() || '#2563eb',
          borderWidth: 2,
          pointBackgroundColor: '#2563eb',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
         r: {
          angleLines: { color: '#e5e7eb' },
          grid: { color: '#e5e7eb' },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false },
          pointLabels: {
            color: getComputedStyle(document.body).getPropertyValue('--color-muted').trim() || '#64748b',
            font: { size: 10 },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

async function render() {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Timezone
  const timeElement = document.getElementById('live-timestamp');

  function updateECTTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Zurich', // Central European Time
    });
    timeElement.textContent = formatter.format(now);
  }

  updateECTTime();
  setInterval(updateECTTime, 60_000);

  // Site strings from JSON
  try {
    const site = await fetchJSON('data/site.json');
    applySiteContent(site);
    if (site.mlopsProfile) {
      window.__mlopsProfile = site.mlopsProfile;
      buildMlopsProfileChart(site.mlopsProfile);
    }
  } catch (e) {
    console.error(e);
  }

  // Follow system theme automatically; rebuild visuals on preference changes
  const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (media && typeof media.addEventListener === 'function') {
    media.addEventListener('change', () => {
      if (window.__skillsData) buildSkillsChart(window.__skillsData);
      if (window.__mlopsProfile) buildMlopsProfileChart(window.__mlopsProfile);
      if (window.AOS) window.AOS.refreshHard();
    });
  }

  // AOS init
  if (window.AOS) {
    window.AOS.init({ duration: 600, easing: 'ease-out', once: true });
  }

  // Skills
  try {
    const skills = await fetchJSON('data/skills.json');
    const grid = document.getElementById('skills-grid');
    if (Array.isArray(skills) && grid) {
      grid.innerHTML = skills.map(skillItem).join('');
    }

  // Chart.js visualization
  window.__skillsData = skills;
  buildSkillsChart(skills);
  } catch (e) {
    console.error(e);
  }

  // Projects
  try {
    const projects = await fetchJSON('data/projects.json');
    window.__projects = Array.isArray(projects) ? projects : [];
    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = window.__projects.map(projectCard).join('');
    }
    // Project filters
    const filterButtons = document.querySelectorAll('.projects-filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-filter');
        filterButtons.forEach(b => b.classList.remove('active', 'bg-slate-900', 'text-white'));
        btn.classList.add('active', 'bg-slate-900', 'text-white');
        if (!grid) return;
        const filtered = value === 'all'
          ? window.__projects
          : window.__projects.filter(p => Array.isArray(p.categories) && p.categories.includes(value));
        grid.innerHTML = filtered.map(projectCard).join('');
      });
    });
    // GitHub updates strip (ticker style using projects data)
    const updatesStrip = document.getElementById('github-updates-strip');
    if (updatesStrip && window.__projects.length) {
      const items = window.__projects
        .map(p => {
          const repoLabel = (p.githubUrl || '').split('/').slice(-1)[0] || 'repo';
          return `<span class="inline-flex items-center gap-1 mr-8">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>${p.title} <span class="text-slate-400">(${repoLabel})</span></span>
            </span>`;
        })
        .join('');
      // duplicate content for seamless scrolling effect
      updatesStrip.innerHTML = items + items;
    }
  } catch (e) {
    console.error(e);
  }
}

// Floating tiles
function initFloatingTiles() {
  // Dismissible first-load tile (uses localStorage flag)
  const storageKey = 'hai_floating_ad_dismissed_v1';
  if (!localStorage.getItem(storageKey)) {
    const ad = document.createElement('div');
    ad.className = 'floating-ad';
    ad.innerHTML = `
      <div class="floating-ad-header">
        <div class="floating-ad-title">Welcome to hAI</div>
        <button type="button" aria-label="Close">
          &times;
        </button>
      </div>
      <div class="floating-ad-body">
        Explore my work in MLOps, AI systems, and hands-on projects. Use the navigation above or jump straight into the AI game using the chat bubble.
      </div>
    `;
    const closeBtn = ad.querySelector('button');
    closeBtn.addEventListener('click', () => {
      ad.classList.remove('floating-ad-show');
      ad.classList.add('floating-ad-hide');
      // localStorage.setItem(storageKey, '1');
      setTimeout(() => ad.remove(), 200);
    });
    document.body.appendChild(ad);
    // trigger macOS-like appear animation on next frame
    requestAnimationFrame(() => {
      ad.classList.add('floating-ad-show');
    });
  }

  // Persistent chatbot-style floating button linking to hosted game
  const chatBtn = document.createElement('button');
  chatBtn.type = 'button';
  chatBtn.className = 'chat-fab';
  chatBtn.setAttribute('aria-label', 'Open AI game');
  chatBtn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5">
      <path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1.6.8L16 13H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/>
    </svg>
  `;
  chatBtn.addEventListener('click', () => {
    // TODO: replace with your actual hosted game URL
    window.open('https://linguamate.netlify.app/', '_blank', 'noopener');
  });
  document.body.appendChild(chatBtn);
}

// Simple live widget: keep timestamp ticking every second
setInterval(() => {
  const el = document.getElementById('live-timestamp');
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${hh}:${mm}`;
}, 1000);

render().then(() => {
  initFloatingTiles();
});
