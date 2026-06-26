/**
 * renderer.js — 渲染引擎
 * 职责：从数据结构渲染为 DOM，插入指定容器
 */

/**
 * 渲染角色档案
 */
export function renderCharacters(container, characters) {
  container.innerHTML = characters.map(c => `
    <div class="char-card" data-char-id="${c.id}">
      <div class="char-avatar" style="border-color: ${c.color};${c.avatarUrl ? `background-image: url('${c.avatarUrl}'); background-size: cover; background-position: center;` : ''} color: ${c.color};">
        ${c.avatarUrl ? '' : c.name.slice(0, 1)}
      </div>
      <div class="char-name">${c.name}</div>
      <div class="char-name-en">${c.nameEn}</div>
      <div class="char-anniversary" style="color: ${c.color};">${c.anniversary} 周年</div>
      <div class="char-voice">🎤 声源：${c.voiceProvider}</div>
      <div class="char-desc">${c.description}</div>
      <div class="char-songs">
        ${(c.representativeSongs || []).map(s => `<span>${s}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // 滚动入场动画
  setTimeout(() => {
    container.querySelectorAll('.char-card').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 200);
    });
  }, 100);
}

/**
 * 渲染时间线
 */
export function renderTimeline(container, events) {
  container.innerHTML = events.map((ev, i) => `
    <div class="timeline-item${ev.highlight ? ' highlight' : ''}" data-index="${i}">
      <div class="timeline-date">${ev.year}${ev.month ? '.' + ev.month : ''}${ev.day ? '.' + ev.day : ''}</div>
      <div class="timeline-title">${ev.title}</div>
      <div class="timeline-desc">${ev.description || ''}</div>
    </div>
  `).join('');

  // Intersection Observer 滚动动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  container.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
}

/**
 * 渲染歌曲列表
 */
export function renderSongs(container, songs) {
  if (!songs || songs.length === 0) {
    container.innerHTML = '<div class="empty-state">✨ 暂无曲目，等待管理员添加 ✨</div>';
    return;
  }

  container.innerHTML = songs.map(s => `
    <div class="song-card" data-song-id="${s.id}" data-bvid="${s.bvid || ''}">
      <div class="song-card-header">
        <span class="song-title">${s.title}</span>
        <span class="song-meta">
          <span class="song-year">${s.year}</span>
          <span class="song-type song-type-${s.type || 'original'}">${typeLabel(s.type)}</span>
        </span>
        <span class="song-expand-hint">hover 展开 ▶</span>
      </div>
      <div class="song-card-body">
        ${s.bvid ? '<div class="song-player"><div class="player-placeholder">▶ 悬停加载</div><iframe class="bilibili-player" allowfullscreen frameborder="no" scrolling="no"></iframe></div>' : ''}
        <div class="song-info">
          <div class="song-desc">${s.description || ''}</div>
          ${s.bilibiliUrl ? `<a class="song-link" href="${s.bilibiliUrl}" target="_blank" rel="noopener">在B站打开 ↗</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // 滚动动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.song-card').forEach(el => {
    observer.observe(el);

    // 悬停时加载 iframe（避免折叠状态加载B站播放器导致无法播放）
    const bvid = el.dataset.bvid;
    const iframe = el.querySelector('.bilibili-player');
    if (bvid && iframe) {
      let loaded = false;
      el.addEventListener('mouseenter', () => {
        if (!loaded) {
          iframe.src = `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`;
          loaded = true;
        }
      }, { once: true });
    }
  });
}

function typeLabel(type) {
  switch (type) {
    case 'original': return '原创曲';
    case 'cover': return '翻唱';
    case 'fan': return '贺曲/同人';
    default: return type || '原创曲';
  }
}

/**
 * 渲染祝福墙
 */
export function renderWishes(container, wishes) {
  if (!wishes || wishes.length === 0) {
    container.innerHTML = '<div class="empty-state">💫 还没有祝福，来写下第一份吧</div>';
    return;
  }

  container.innerHTML = wishes.map(w => {
    const isGradient = w.color === 'gradient';
    const extraClass = isGradient ? ' wish-gradient-text' : '';
    const textStyle = isGradient ? '' : `color: ${w.color || '#66CCFF'};`;
    return `
    <div class="wish-card">
      <div class="wish-card-content${extraClass}" style="${textStyle}">${escapeHtml(w.content)}</div>
      <div class="wish-card-author">— ${escapeHtml(w.author || '匿名')}</div>
      <div class="wish-card-date">${w.date || ''}</div>
    </div>
  `}).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
