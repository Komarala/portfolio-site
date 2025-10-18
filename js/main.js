async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
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

function projectCard({ title, description, techStack = [], imagePath }) {
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
      </div>
    </article>
  `;
}

let skillsChartRef = null;

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

async function render() {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme: restore persisted preference
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (saved !== 'light') {
      // No saved preference: follow system
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.body.classList.add('dark-mode');
    }
  } catch {}
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      try {
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      } catch {}
      // Rebuild chart to update colors
      if (window.__skillsData) buildSkillsChart(window.__skillsData);
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
    const grid = document.getElementById('projects-grid');
    if (Array.isArray(projects) && grid) {
      grid.innerHTML = projects.map(projectCard).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

render();
