/**
 * wishes.js — 祝福墙逻辑
 * 提交祝福 + 持久化到 localStorage
 */

import engine from './data-engine.js';
import { renderWishes } from './renderer.js';

export async function initWishes() {
  const form = document.getElementById('wishForm');
  const grid = document.getElementById('wishesGrid');
  if (!grid) return;

  // 渲染已有祝福
  await refreshWishes();

  if (!form) return;
  const submitBtn = document.getElementById('wishSubmit');
  const authorInput = document.getElementById('wishAuthor');
  const contentInput = document.getElementById('wishContent');
  const colorRadios = document.querySelectorAll('input[name="wishColor"]');

  function getSelectedColor() {
    for (const r of colorRadios) {
      if (r.checked) return r.value;
    }
    return '#66CCFF';
  }

  submitBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();
    if (!content) {
      contentInput.focus();
      return;
    }

    const wishes = (await engine.getData('wishes')) || [];
    const now = new Date();
    wishes.unshift({
      id: Date.now(),
      author: authorInput.value.trim() || '匿名',
      content,
      color: getSelectedColor(),
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    });

    engine.saveData('wishes', wishes);
    contentInput.value = '';
    await refreshWishes();
  });

  // Enter 快捷键提交
  contentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitBtn.click();
    }
  });
}

export async function refreshWishes() {
  const grid = document.getElementById('wishesGrid');
  if (!grid) return;
  const wishes = await engine.getData('wishes');
  renderWishes(grid, wishes || []);
}

export async function getWishes() {
  return (await engine.getData('wishes')) || [];
}
