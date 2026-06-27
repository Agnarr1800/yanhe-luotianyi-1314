/**
 * main.js — 主入口
 * 初始化所有模块
 */

import engine from './data-engine.js';
import { renderCharacters, renderTimeline, renderSongs } from './renderer.js';
import ParticleSystem from './particles.js';
import { startCountdown } from './countdown.js';
import { initWishes, refreshWishes } from './wishes.js';
import { initAdmin } from './admin.js';
import { initSubmitSong } from './submit-song.js';

async function main() {
  // 1. 粒子背景
  new ParticleSystem('particleCanvas');

  // 2. 渲染角色档案
  const charsContainer = document.getElementById('charactersContainer');
  if (charsContainer) {
    const chars = await engine.getData('characters');
    renderCharacters(charsContainer, chars || []);
  }

  // 3. 渲染时间线
  const tlContainer = document.getElementById('timelineContainer');
  if (tlContainer) {
    const events = await engine.getData('timeline');
    renderTimeline(tlContainer, events || []);
  }

  // 4. 渲染经典作品
  const songsContainer = document.getElementById('songsContainer');
  if (songsContainer) {
    const songs = await engine.getData('songs');
    const originals = (songs || []).filter(s => s.type !== 'fan');
    renderSongs(songsContainer, originals);
  }

  // 5. 渲染今年贺曲
  const fanContainer = document.getElementById('fanSongsContainer');
  if (fanContainer) {
    const songs = await engine.getData('songs');
    const fans = (songs || []).filter(s => s.type === 'fan');
    renderSongs(fanContainer, fans);
  }

  // 6. 生日直播
  await renderLive();

  // 7. 倒计时
  startCountdown();

  // 8. 祝福墙
  await initWishes();

  // 9. 游客推荐歌曲
  initSubmitSong();

  // 10. 管理后台
  initAdmin();
}

// 页面加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// 渲染生日直播
async function renderLive() {
  const container = document.getElementById('liveContainer');
  if (!container) return;
  const config = await engine.getData('config');

  // 优先显示录播
  if (config.recordBvid) {
    container.innerHTML = `
      <div class="live-player">
        <iframe src="https://player.bilibili.com/player.html?bvid=${config.recordBvid}&autoplay=0&high_quality=1&as_wide=1" allowfullscreen frameborder="no" scrolling="no"></iframe>
      </div>
      <p style="text-align:center;color:var(--text-secondary);margin-top:12px;">📼 录播回放</p>
    `;
    return;
  }

  // 有直播间 ID 直接显示直播
  if (config.liveRoomId) {
    container.innerHTML = `
      <div class="live-player" style="position:relative;">
        <span style="position:absolute;top:12px;left:12px;z-index:10;background:#ff4444;color:#fff;padding:4px 12px;border-radius:20px;font-size:0.85rem;font-weight:600;">🔴 LIVE</span>
        <iframe src="https://live.bilibili.com/${config.liveRoomId}?is_room_feed=1&embedded=1" allowfullscreen frameborder="no" allow="autoplay"></iframe>
      </div>
    `;
    return;
  }

  // 默认占位
  container.innerHTML = `
    <div class="live-placeholder">
      <div class="live-icon">📺</div>
      <div class="live-text">直播信息将在管理后台配置后显示</div>
    </div>
  `;
}

// 暴露刷新函数给 admin.js
window.__de1314 = {
  refresh: {
    live: renderLive,
    characters: async () => {
      const c = document.getElementById('charactersContainer');
      if (c) renderCharacters(c, (await engine.getData('characters')) || []);
    },
    timeline: async () => {
      const t = document.getElementById('timelineContainer');
      if (t) renderTimeline(t, (await engine.getData('timeline')) || []);
    },
    songs: async () => {
      const s = document.getElementById('songsContainer');
      if (s) renderSongs(s, ((await engine.getData('songs')) || []).filter(x => x.type !== 'fan'));
      const f = document.getElementById('fanSongsContainer');
      if (f) renderSongs(f, ((await engine.getData('songs')) || []).filter(x => x.type === 'fan'));
    },
    wishes: refreshWishes,
  },
};
