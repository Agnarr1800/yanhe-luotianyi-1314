/**
 * data-engine.js — 数据引擎
 * 职责：读取 JSON 数据文件 → 合并 localStorage 覆盖 → 提供统一数据接口
 *
 * 数据流：
 *   data/*.json (基线) → 页面渲染
 *      ↑
 *   localStorage (编辑后) — 优先读取，无则回退基线
 *      ↑
 *   管理后台表单 → 写入 localStorage
 *      ↓
 *   导出 JSON / 重置为基线
 */

const STORAGE_KEYS = {
  config: 'de1314_config',
  characters: 'de1314_characters',
  timeline: 'de1314_timeline',
  songs: 'de1314_songs',
  wishes: 'de1314_wishes',
};

// 缓存已加载的基线数据
let _baselineCache = {};

/**
 * 加载 JSON 数据文件（基线）
 */
async function loadBaseline(name) {
  if (_baselineCache[name]) return _baselineCache[name];
  try {
    const resp = await fetch(`data/${name}.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _baselineCache[name] = data;
    return data;
  } catch (e) {
    console.warn(`[DataEngine] 基线 ${name}.json 加载失败:`, e);
    return null;
  }
}

/**
 * 获取数据：优先 localStorage，无则回退基线
 */
async function getData(name) {
  const stored = localStorage.getItem(STORAGE_KEYS[name]);
  if (stored) {
    try { return JSON.parse(stored); }
    catch (e) { console.warn(`[DataEngine] localStorage ${name} 解析失败`, e); }
  }
  return loadBaseline(name);
}

/**
 * 保存数据到 localStorage
 */
function saveData(name, data) {
  localStorage.setItem(STORAGE_KEYS[name], JSON.stringify(data));
}

/**
 * 重置某数据为基线
 */
async function resetData(name) {
  localStorage.removeItem(STORAGE_KEYS[name]);
  return loadBaseline(name);
}

/**
 * 重置所有数据为基线
 */
async function resetAll() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  _baselineCache = {};
}

/**
 * 导出全部数据为 JSON 对象
 */
async function exportAll() {
  const result = {};
  for (const key of Object.keys(STORAGE_KEYS)) {
    result[key] = await getData(key);
  }
  return result;
}

/**
 * 导入全部数据
 */
async function importAll(data) {
  for (const key of Object.keys(STORAGE_KEYS)) {
    if (data[key] !== undefined) {
      saveData(key, data[key]);
    }
  }
}

/**
 * 获取所有数据键名
 */
function getKeys() {
  return Object.keys(STORAGE_KEYS);
}

/**
 * 获取存储键名
 */
function getStorageKey(name) {
  return STORAGE_KEYS[name];
}

export default {
  getData,
  saveData,
  resetData,
  resetAll,
  exportAll,
  importAll,
  loadBaseline,
  getKeys,
  getStorageKey,
};
