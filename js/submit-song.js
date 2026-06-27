/**
 * submit-song.js — 游客推荐歌曲 + 管理员审核
 */
import engine from './data-engine.js';

export function initSubmitSong() {
  const btn = document.getElementById('submitSongBtn');
  if (!btn) return;

  btn.addEventListener('click', submitSong);

  // 点击弹窗外层可关闭
  const modal = document.getElementById('submitSongModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

async function submitSong() {
  const fields = {
    title: document.getElementById('submitSongTitle'),
    year: document.getElementById('submitSongYear'),
    bvid: document.getElementById('submitSongBvid'),
    bilibiliUrl: document.getElementById('submitSongUrl'),
    type: document.getElementById('submitSongType'),
    section: document.getElementById('submitSongSection'),
    description: document.getElementById('submitSongDesc'),
    submitter: document.getElementById('submitSongAuthor'),
  };

  const title = fields.title.value.trim();
  if (!title) {
    setStatus('请输入歌曲名称', 'error');
    fields.title.focus();
    return;
  }

  const pending = (await engine.getData('pendingSongs')) || [];
  pending.push({
    id: Date.now(),
    title,
    year: fields.year.value.trim(),
    bvid: fields.bvid.value.trim(),
    bilibiliUrl: fields.bilibiliUrl.value.trim(),
    type: fields.type.value,
    section: fields.section.value,
    description: fields.description.value.trim(),
    submitter: fields.submitter.value.trim() || '匿名',
    status: 'pending',
    submittedAt: new Date().toISOString().slice(0, 10),
  });

  engine.saveData('pendingSongs', pending);

  // 清空表单
  Object.values(fields).forEach(f => { if (f) f.value = ''; });
  setStatus('✅ 已提交，感谢推荐！管理员审核通过后会展示。', 'success');
  setTimeout(() => {
    document.getElementById('submitSongModal').classList.remove('active');
    setStatus('', '');
  }, 2000);
}

function setStatus(msg, type) {
  const el = document.getElementById('submitSongStatus');
  if (el) {
    el.textContent = msg;
    el.style.color = type === 'error' ? '#ff4444' : type === 'success' ? '#44cc44' : '';
  }
}
