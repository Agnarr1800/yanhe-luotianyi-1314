/**
 * admin.js — 管理后台
 * 入口：按 \` 键（反引号）或 URL 参数 ?admin，或点击右下角按钮
 * 功能：登录 → CRUD 各数据区块 → 导入/导出/重置
 */

import engine from './data-engine.js';

const ADMIN_PASSWORD = '1314';

export function initAdmin() {
  // 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('admin')) {
    setTimeout(showAdmin, 500);
  }

  // 快捷键：按 ` 键（反引号）打开管理后台
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      toggleAdmin();
    }
  });

  // 右下角浮动按钮
  addFloatingAdminBtn();
}

// 右下角浮动入口按钮
function addFloatingAdminBtn() {
  const btn = document.createElement('div');
  btn.textContent = '🔧';
  btn.title = '管理后台（按 ` 键打开）';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '100',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'var(--text-secondary, #aaa)',
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(255,255,255,0.15)';
    btn.style.transform = 'scale(1.1)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(255,255,255,0.08)';
    btn.style.transform = 'scale(1)';
  });
  btn.addEventListener('click', toggleAdmin);
  document.body.appendChild(btn);
}

function toggleAdmin() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
    panel.innerHTML = '';
  } else {
    showAdmin();
  }
}

function showAdmin() {
  const panel = document.getElementById('adminPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="admin-panel-inner" id="adminInner">
      <div class="admin-login" id="adminLogin">
        <h2 class="admin-title">🔐 管理后台</h2>
        <input type="password" id="adminPassword" placeholder="输入管理员密码" />
        <div class="admin-error" id="adminError"></div>
        <button class="admin-btn admin-btn-primary" id="adminLoginBtn">登录</button>
      </div>
    </div>
  `;
  panel.classList.add('active');

  document.getElementById('adminLoginBtn').addEventListener('click', checkPassword);
  document.getElementById('adminPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
  document.getElementById('adminPassword').focus();
}

function checkPassword() {
  const input = document.getElementById('adminPassword');
  const error = document.getElementById('adminError');
  if (input.value === ADMIN_PASSWORD) {
    error.textContent = '';
    buildAdminDashboard();
  } else {
    error.textContent = '密码错误，请重试';
    input.value = '';
    input.focus();
  }
}

async function buildAdminDashboard() {
  const inner = document.getElementById('adminInner');
  if (!inner) return;

  inner.innerHTML = `
    <h2 class="admin-title">⚙️ 管理后台</h2>
    <p style="text-align:center;color:var(--text-secondary);margin-bottom:24px;">
      按 <kbd>Ctrl+Shift+A</kbd> 关闭 | 修改后自动保存
    </p>

    <div class="admin-section">
      <h3>📋 角色档案</h3>
      <div id="adminCharacters"></div>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-primary" id="adminSaveChars">保存角色</button>
      </div>
    </div>

    <div class="admin-section">
      <h3>📅 时间线</h3>
      <div id="adminTimeline"></div>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-primary" id="adminAddTimeline">+ 添加事件</button>
        <button class="admin-btn admin-btn-success" id="adminSaveTimeline">保存时间线</button>
      </div>
    </div>

    <div class="admin-section">
      <h3>🎵 曲目管理</h3>
      <div id="adminSongs"></div>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-primary" id="adminAddSong">+ 添加曲目</button>
        <button class="admin-btn admin-btn-success" id="adminSaveSongs">保存曲目</button>
      </div>
    </div>

    <div class="admin-section">
      <h3>💬 祝福管理</h3>
      <div id="adminWishes"></div>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-success" id="adminSaveWishes">保存祝福</button>
      </div>
    </div>

    <div class="admin-section">
      <h3>🎥 生日直播/录播</h3>
      <div class="admin-field">
        <label>B站直播间ID（如 12345）</label>
        <input type="text" id="adminLiveRoomId" placeholder="留空则不显示直播" />
      </div>
      <div class="admin-field">
        <label>录播BVID（如 BV1xx411c7mD）</label>
        <input type="text" id="adminRecordBvid" placeholder="直播结束后填录播BVID" />
      </div>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-success" id="adminSaveLive">保存直播设置</button>
      </div>
    </div>

    <div class="admin-section">
      <h3>📦 数据导入/导出</h3>
      <div class="admin-actions">
        <button class="admin-btn admin-btn-success" id="adminExport">📥 导出数据 (JSON)</button>
        <button class="admin-btn" id="adminImportBtn">📤 导入数据</button>
        <input type="file" id="adminImportFile" accept=".json" style="display:none" />
        <button class="admin-btn admin-btn-danger" id="adminReset">⚠️ 重置所有数据</button>
      </div>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <button class="admin-btn admin-btn-danger" onclick="document.getElementById('adminPanel').classList.remove('active')">关闭后台</button>
    </div>
  `;

  // 加载各区块数据
  await loadAdminCharacters();
  await loadAdminTimeline();
  await loadAdminSongs();
  await loadAdminWishes();
  await loadAdminLive();

  // 绑定事件
  document.getElementById('adminSaveChars').addEventListener('click', saveAdminCharacters);
  document.getElementById('adminAddTimeline').addEventListener('click', addTimelineItem);
  document.getElementById('adminSaveTimeline').addEventListener('click', saveAdminTimeline);
  document.getElementById('adminAddSong').addEventListener('click', addSongItem);
  document.getElementById('adminSaveSongs').addEventListener('click', saveAdminSongs);
  document.getElementById('adminSaveWishes').addEventListener('click', saveAdminWishes);
  document.getElementById('adminSaveLive').addEventListener('click', saveAdminLive);
  document.getElementById('adminExport').addEventListener('click', exportData);
  document.getElementById('adminImportBtn').addEventListener('click', () => document.getElementById('adminImportFile').click());
  document.getElementById('adminImportFile').addEventListener('change', importData);
  document.getElementById('adminReset').addEventListener('click', resetAllData);
}

// ===== 角色编辑 =====
let _charsData = [];

async function loadAdminCharacters() {
  _charsData = (await engine.getData('characters')) || [];
  renderAdminChars();
}

function renderAdminChars() {
  const container = document.getElementById('adminCharacters');
  container.innerHTML = _charsData.map((c, i) => `
    <div class="admin-field">
      <label>ID</label>
      <input type="text" value="${c.id}" data-char-idx="${i}" data-field="id" />
    </div>
    <div class="admin-field">
      <label>名字 / 英文名</label>
      <div style="display:flex;gap:8px;">
        <input type="text" value="${c.name}" data-char-idx="${i}" data-field="name" style="flex:1" />
        <input type="text" value="${c.nameEn}" data-char-idx="${i}" data-field="nameEn" style="flex:1" />
      </div>
    </div>
    <div class="admin-field">
      <label>代表色 / 强调色</label>
      <div style="display:flex;gap:8px;">
        <input type="color" value="${c.color}" data-char-idx="${i}" data-field="color" />
        <input type="color" value="${c.colorAccent}" data-char-idx="${i}" data-field="colorAccent" />
      </div>
    </div>
    <div class="admin-field">
      <label>声源 / 周年数</label>
      <div style="display:flex;gap:8px;">
        <input type="text" value="${c.voiceProvider}" data-char-idx="${i}" data-field="voiceProvider" style="flex:2" />
        <input type="number" value="${c.anniversary}" data-char-idx="${i}" data-field="anniversary" style="flex:1" />
      </div>
    </div>
    <div class="admin-field">
      <label>人物简介</label>
      <textarea data-char-idx="${i}" data-field="description">${c.description}</textarea>
    </div>
    <hr style="border-color:var(--card-border);margin:16px 0;" />
  `).join('');
}

function saveAdminCharacters() {
  const inputs = document.querySelectorAll('[data-char-idx]');
  inputs.forEach(input => {
    const idx = parseInt(input.dataset.charIdx);
    const field = input.dataset.field;
    if (_charsData[idx]) {
      _charsData[idx][field] = input.value;
    }
  });
  engine.saveData('characters', _charsData);
  // 刷新页面显示
  if (window.__de1314?.refresh?.characters) window.__de1314.refresh.characters();
  alert('✅ 角色数据已保存');
}

// ===== 时间线编辑 =====
let _tlData = [];

async function loadAdminTimeline() {
  _tlData = (await engine.getData('timeline')) || [];
  renderAdminTimeline();
}

function renderAdminTimeline() {
  const container = document.getElementById('adminTimeline');
  container.innerHTML = _tlData.map((ev, i) => `
    <div class="admin-field" style="display:flex;gap:8px;align-items:end;">
      <div style="flex:1"><label>年份</label><input type="text" value="${ev.year}" data-tl-idx="${i}" data-field="year" /></div>
      <div style="flex:0.5"><label>月</label><input type="text" value="${ev.month || ''}" data-tl-idx="${i}" data-field="month" /></div>
      <div style="flex:0.5"><label>日</label><input type="text" value="${ev.day || ''}" data-tl-idx="${i}" data-field="day" /></div>
      <button class="admin-btn admin-btn-danger" data-tl-del="${i}">✕</button>
    </div>
    <div class="admin-field">
      <label>标题</label>
      <input type="text" value="${ev.title}" data-tl-idx="${i}" data-field="title" />
    </div>
    <div class="admin-field">
      <label>描述</label>
      <textarea data-tl-idx="${i}" data-field="description">${ev.description || ''}</textarea>
    </div>
    <hr style="border-color:var(--card-border);margin:12px 0;" />
  `).join('');

  container.querySelectorAll('[data-tl-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.tlDel);
      _tlData.splice(idx, 1);
      renderAdminTimeline();
    });
  });
}

function addTimelineItem() {
  _tlData.push({ year: '2026', month: '7', day: '', title: '新事件', description: '', highlight: false });
  renderAdminTimeline();
}

function saveAdminTimeline() {
  const inputs = document.querySelectorAll('[data-tl-idx]');
  inputs.forEach(input => {
    const idx = parseInt(input.dataset.tlIdx);
    const field = input.dataset.field;
    if (_tlData[idx]) {
      _tlData[idx][field] = input.value;
    }
  });
  engine.saveData('timeline', _tlData);
  if (window.__de1314?.refresh?.timeline) window.__de1314.refresh.timeline();
  alert('✅ 时间线已保存');
}

// ===== 歌曲编辑 =====
let _songData = [];

async function loadAdminSongs() {
  _songData = (await engine.getData('songs')) || [];
  renderAdminSongs();
}

function renderAdminSongs() {
  const container = document.getElementById('adminSongs');
  if (!_songData.length) {
    container.innerHTML = '<p style="color:var(--text-secondary);">暂无曲目，点击下方添加</p>';
    return;
  }
  container.innerHTML = _songData.map((s, i) => `
    <div class="admin-field" style="display:flex;gap:8px;align-items:end;">
      <div style="flex:2"><label>曲名</label><input type="text" value="${s.title}" data-song-idx="${i}" data-field="title" /></div>
      <div style="flex:1"><label>年份</label><input type="text" value="${s.year}" data-song-idx="${i}" data-field="year" /></div>
      <div style="flex:1"><label>类型</label>
        <select data-song-idx="${i}" data-field="type">
          <option value="original" ${s.type==='original'?'selected':''}>原创</option>
          <option value="cover" ${s.type==='cover'?'selected':''}>翻唱</option>
          <option value="fan" ${s.type==='fan'?'selected':''}>贺曲/同人</option>
        </select>
      </div>
      <div style="flex:1"><label>播放量</label>
        <select data-song-idx="${i}" data-field="rank">
          <option value="" ${!s.rank?'selected':''}>普通</option>
          <option value="hall" ${s.rank==='hall'?'selected':''}>殿堂曲</option>
          <option value="legend" ${s.rank==='legend'?'selected':''}>传说曲</option>
          <option value="myth" ${s.rank==='myth'?'selected':''}>神话曲</option>
        </select>
      </div>
      <button class="admin-btn admin-btn-danger" data-song-del="${i}">✕</button>
    </div>
    <div class="admin-field">
      <label>描述 / B站链接 / BVID</label>
      <div style="display:flex;gap:8px;">
        <input type="text" value="${s.description || ''}" data-song-idx="${i}" data-field="description" style="flex:1" placeholder="描述" />
        <input type="url" value="${s.bilibiliUrl || ''}" data-song-idx="${i}" data-field="bilibiliUrl" style="flex:1" placeholder="B站链接（可选）" />
        <input type="text" value="${s.bvid || ''}" data-song-idx="${i}" data-field="bvid" style="flex:0.6" placeholder="BVID" />
      </div>
    </div>
    <hr style="border-color:var(--card-border);margin:12px 0;" />
  `).join('');

  container.querySelectorAll('[data-song-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.songDel);
      _songData.splice(idx, 1);
      renderAdminSongs();
    });
  });
}

function addSongItem() {
  const maxId = _songData.reduce((m, s) => Math.max(m, s.id || 0), 0);
  _songData.push({ id: maxId + 1, title: '新曲目', year: '2026', type: 'fan', rank: '', bvid: '', bilibiliUrl: '', coverUrl: '', description: '' });
  renderAdminSongs();
}

function saveAdminSongs() {
  const inputs = document.querySelectorAll('[data-song-idx]');
  inputs.forEach(input => {
    const idx = parseInt(input.dataset.songIdx);
    const field = input.dataset.field;
    if (_songData[idx]) {
      if (field === 'id') _songData[idx].id = parseInt(input.value) || Date.now();
      else _songData[idx][field] = input.value;
    }
  });
  // 确保每个条目有 id
  _songData.forEach((s, i) => { if (!s.id) s.id = Date.now() + i; });
  engine.saveData('songs', _songData);
  if (window.__de1314?.refresh?.songs) window.__de1314.refresh.songs();
  alert('✅ 曲目已保存');
}

// ===== 祝福编辑 =====
async function loadAdminWishes() {
  const data = (await engine.getData('wishes')) || [];
  const container = document.getElementById('adminWishes');
  if (!data.length) {
    container.innerHTML = '<p style="color:var(--text-secondary);">暂无祝福</p>';
    return;
  }
  container.innerHTML = data.map((w, i) => `
    <div style="display:flex;gap:8px;align-items:center;padding:8px;border-radius:8px;background:rgba(255,255,255,0.04);margin-bottom:8px;">
      <span style="flex:1;">${w.author}：${w.content.slice(0, 30)}${w.content.length > 30 ? '...' : ''}</span>
      <span style="font-size:0.8rem;color:var(--text-secondary);">${w.date || ''}</span>
      <button class="admin-btn admin-btn-danger" data-wish-del="${i}">删除</button>
    </div>
  `).join('');

  container.querySelectorAll('[data-wish-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.wishDel);
      const wishes = (await engine.getData('wishes')) || [];
      wishes.splice(idx, 1);
      engine.saveData('wishes', wishes);
      loadAdminWishes();
      if (window.__de1314?.refresh?.wishes) window.__de1314.refresh.wishes();
    });
  });
}

function saveAdminWishes() {
  alert('💬 祝福已保存（删除操作已即时生效）');
}

// ===== 直播/录播配置 =====
async function loadAdminLive() {
  const config = await engine.getData('config');
  document.getElementById('adminLiveRoomId').value = config.liveRoomId || '';
  document.getElementById('adminRecordBvid').value = config.recordBvid || '';
}

async function saveAdminLive() {
  const config = await engine.getData('config');
  config.liveRoomId = document.getElementById('adminLiveRoomId').value.trim();
  config.recordBvid = document.getElementById('adminRecordBvid').value.trim();
  engine.saveData('config', config);
  if (window.__de1314?.refresh?.live) window.__de1314.refresh.live();
  alert('✅ 直播配置已保存');
}

// ===== 导入/导出/重置 =====
async function exportData() {
  const data = await engine.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `de1314-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await engine.importAll(data);
    alert('✅ 数据导入成功！页面将刷新');
    location.reload();
  } catch (err) {
    alert('❌ 导入失败：' + err.message);
  }
}

async function resetAllData() {
  if (!confirm('⚠️ 确定要重置所有数据为初始状态吗？本地修改将丢失！')) return;
  await engine.resetAll();
  alert('✅ 已重置，页面将刷新');
  location.reload();
}
