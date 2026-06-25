/**
 * countdown.js — 双人生日倒计时
 * 同时显示言和（7月11日）与洛天依（7月12日）的倒计时
 */

const YANHE_DATE = '2026-07-11T00:00:00';
const TIANYI_DATE = '2026-07-12T00:00:00';

let intervalId = null;

export function startCountdown() {
  updateBoth();
  intervalId = setInterval(updateBoth, 1000);
}

export function stopCountdown() {
  if (intervalId) clearInterval(intervalId);
}

function updateBoth() {
  const now = new Date();
  const yanhe = new Date(YANHE_DATE);
  const tianyi = new Date(TIANYI_DATE);

  const yanheDone = now >= yanhe;
  const tianyiDone = now >= tianyi;

  // 言和倒计时
  if (yanheDone) {
    setNum('cdYanheDays', '🎉');
    setNum('cdYanheHours', '🎉');
    setNum('cdYanheMinutes', '🎉');
    setNum('cdYanheSeconds', '🎉');
    document.querySelectorAll('.countdown-box')[0]?.classList.add('celebrated');
  } else {
    renderCountdown(yanhe, now, 'cdYanhe');
  }

  // 天依倒计时
  if (tianyiDone) {
    setNum('cdTianyiDays', '🎉');
    setNum('cdTianyiHours', '🎉');
    setNum('cdTianyiMinutes', '🎉');
    setNum('cdTianyiSeconds', '🎉');
    document.querySelectorAll('.countdown-box')[1]?.classList.add('celebrated');
  } else {
    renderCountdown(tianyi, now, 'cdTianyi');
  }

  // 庆祝模式
  if (yanheDone || tianyiDone) {
    document.body.classList.add('celebrate');
  }

  if (yanheDone && tianyiDone) {
    document.body.classList.add('celebrate-both');
    launchCelebration();
  }
}

function renderCountdown(target, now, prefix) {
  const diff = target - now;
  if (diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  setNum(`${prefix}Days`, String(days).padStart(2, '0'));
  setNum(`${prefix}Hours`, String(hours).padStart(2, '0'));
  setNum(`${prefix}Minutes`, String(minutes).padStart(2, '0'));
  setNum(`${prefix}Seconds`, String(seconds).padStart(2, '0'));
}

function setNum(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function launchCelebration() {
  document.dispatchEvent(new CustomEvent('de1314:celebrate'));
}
