import { calculateMatch, parseOvers, prepareEvents, ballsToOvers } from './engine.js';

const $ = (id) => document.getElementById(id);
let currentResult = null;
let currentInput = null;
let activeTable = 'overs';
let deferredInstallPrompt = null;

function setConnectionStatus() {
  const el = $('connectionState');
  const online = navigator.onLine;
  el.classList.toggle('online', online);
  el.classList.toggle('offline', !online);
  el.lastElementChild.textContent = online ? 'Online · offline-ready' : 'Offline · calculating locally';
}
window.addEventListener('online', setConnectionStatus);
window.addEventListener('offline', setConnectionStatus);
setConnectionStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  $('installButton').classList.remove('hidden');
});
$('installButton').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $('installButton').classList.add('hidden');
});

function addEventRow(containerId, row = {}) {
  const container = $(containerId);
  const wrapper = document.createElement('div');
  wrapper.className = 'event-row';
  wrapper.innerHTML = `
    <input type="text" class="event-overs" inputmode="decimal" placeholder="e.g. 17.3" aria-label="Overs bowled at interruption" value="">
    <input type="number" class="event-score" min="0" max="999" step="1" placeholder="Runs" aria-label="Score at interruption">
    <input type="number" class="event-wickets" min="0" max="10" step="1" placeholder="Wkts" aria-label="Wickets down at interruption" value="0">
    <input type="text" class="event-loss" inputmode="decimal" placeholder="e.g. 4.0 or A" aria-label="Overs lost at interruption">
    <button class="remove-event" type="button" aria-label="Remove interruption">×</button>`;
  wrapper.querySelector('.event-overs').value = row.oversBowled ?? '';
  wrapper.querySelector('.event-score').value = row.scoreAtEvent ?? '';
  wrapper.querySelector('.event-wickets').value = row.wickets ?? 0;
  wrapper.querySelector('.event-loss').value = row.oversLost ?? '';
  wrapper.querySelector('.remove-event').addEventListener('click', () => {
    wrapper.remove();
    updateEmptyMessages();
  });
  container.appendChild(wrapper);
  updateEmptyMessages();
}

function updateEmptyMessages() {
  $('firstEmpty').style.display = $('firstEvents').children.length ? 'none' : 'block';
  $('secondEmpty').style.display = $('secondEvents').children.length ? 'none' : 'block';
}
$('addFirstEvent').addEventListener('click', () => addEventRow('firstEvents'));
$('addSecondEvent').addEventListener('click', () => addEventRow('secondEvents'));

function readEventRows(containerId) {
  return [...$(containerId).querySelectorAll('.event-row')].map(row => ({
    oversBowled: row.querySelector('.event-overs').value.trim(),
    scoreAtEvent: row.querySelector('.event-score').value.trim(),
    wickets: row.querySelector('.event-wickets').value,
    oversLost: row.querySelector('.event-loss').value.trim()
  }));
}

function collectInput() {
  const firstOvers = Number($('firstOvers').value);
  const secondOvers = Number($('secondOvers').value);
  const firstRows = readEventRows('firstEvents');
  const secondRows = readEventRows('secondEvents');
  const firstEvents = prepareEvents(firstRows, firstOvers, 'First innings');
  const secondEvents = prepareEvents(secondRows, secondOvers, 'Second innings');
  const firstRuns = Number($('firstRuns').value);
  for (let i = 0; i < firstEvents.length; i++) {
    if (firstEvents[i].scoreAtEvent != null && firstEvents[i].scoreAtEvent > firstRuns) {
      throw new Error(`First-innings interruption ${i + 1}: score at stoppage cannot exceed the final innings total.`);
    }
  }
  return {
    matchName: $('matchName').value.trim(),
    firstOvers,
    firstRuns,
    secondOvers,
    penaltyRuns: Number($('penaltyRuns').value || 0),
    firstEvents,
    secondEvents,
    firstEventRows: firstRows,
    secondEventRows: secondRows
  };
}

function prettyOvers(decimal) {
  const balls = Math.max(0, Math.round(decimal * 6));
  return ballsToOvers(balls);
}

function displayResult(input, result) {
  currentInput = input;
  currentResult = result;
  $('results').classList.remove('hidden');
  $('resultTitle').textContent = input.matchName || 'Revised target';
  $('resultSub').textContent = `${input.firstOvers} overs · ${input.firstRuns} runs · second innings scheduled for ${input.secondOvers} overs`;
  $('targetNumber').textContent = result.target.toLocaleString('en-ZA');
  $('lambdaValue').textContent = result.lambda.toFixed(4);
  $('adjustmentValue').textContent = result.adjustmentFactor.toFixed(9);
  $('revisedOvers').textContent = result.finalSecondOvers;
  $('resourceSummary').replaceChildren();
  const chips = [
    `First-innings overs lost: ${prettyOvers(result.firstResourcesLost)}`,
    `Second-innings overs lost: ${prettyOvers(result.secondResourcesLost)}`,
    `First-innings interruptions: ${input.firstEvents.length}`,
    `Second-innings interruptions: ${input.secondEvents.length}`
  ];
  for (const label of chips) {
    const chip = document.createElement('span');
    chip.className = 'resource-chip';
    chip.textContent = label;
    $('resourceSummary').appendChild(chip);
  }
  renderTable(activeTable);
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderTable(type) {
  if (!currentResult) return;
  activeTable = type;
  document.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.table === type;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  const rows = type === 'overs' ? currentResult.overRows : currentResult.ballRows;
  const unit = type === 'overs' ? 'over-by-over' : 'ball-by-ball';
  $('tableMeta').textContent = `${rows.length} ${type === 'overs' ? 'over' : 'ball'} positions · par score across 0–9 wickets · complete revised innings`;
  const table = $('parTable');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.replaceChildren();
  tbody.replaceChildren();
  const headRow = document.createElement('tr');
  for (const label of [type === 'overs' ? 'Overs bowled' : 'Overs / balls bowled', 'Overs remaining', ...Array.from({ length: 10 }, (_, i) => `${i} wkts`)]) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement('tr');
    const values = [row.oversBowled, row.oversRemaining, ...row.par];
    for (const value of values) {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.appendChild(td);
    }
    fragment.appendChild(tr);
  }
  tbody.appendChild(fragment);
  $('exportCsv').dataset.table = type;
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => renderTable(tab.dataset.table)));
$('matchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  $('formError').textContent = '';
  try {
    const input = collectInput();
    const result = calculateMatch(input);
    displayResult(input, result);
  } catch (error) {
    $('formError').textContent = error?.message || 'Could not calculate this scenario.';
  }
});

function clearOutput() {
  currentInput = null;
  currentResult = null;
  $('results').classList.add('hidden');
  $('formError').textContent = '';
  $('saveMessage').textContent = '';
}
$('resetButton').addEventListener('click', () => {
  $('matchName').value = '';
  $('firstOvers').value = '50';
  $('firstRuns').value = '300';
  $('secondOvers').value = '50';
  $('penaltyRuns').value = '0';
  $('firstEvents').replaceChildren();
  $('secondEvents').replaceChildren();
  updateEmptyMessages();
  clearOutput();
  $('matchName').focus();
});

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function safeFilename(value) {
  return (value || 'dls-match').normalize('NFKD').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'dls-match';
}
function scenarioDocument() {
  if (!currentInput || !currentResult) throw new Error('Calculate a match first.');
  return { app: 'DLS 6.0 Umpire Calculator', appVersion: '0.1.0', exportedAt: new Date().toISOString(), input: currentInput, resultSummary: { target: currentResult.target, lambda: currentResult.lambda, adjustmentFactor: currentResult.adjustmentFactor } };
}
$('exportScenario').addEventListener('click', () => {
  try { downloadBlob(`${safeFilename(currentInput?.matchName)}.json`, JSON.stringify(scenarioDocument(), null, 2), 'application/json'); }
  catch (error) { $('saveMessage').textContent = error.message; }
});
$('exportCsv').addEventListener('click', () => {
  if (!currentResult) return;
  const rows = $('exportCsv').dataset.table === 'balls' ? currentResult.ballRows : currentResult.overRows;
  const header = ['Overs bowled', 'Overs remaining', ...Array.from({ length: 10 }, (_, i) => `${i} wickets`)];
  const lines = [header, ...rows.map(row => [row.oversBowled, row.oversRemaining, ...row.par])]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','));
  downloadBlob(`${safeFilename(currentInput?.matchName)}-${$('exportCsv').dataset.table}-par-scores.csv`, lines.join('\r\n'), 'text/csv;charset=utf-8');
});

const STORAGE_KEY = 'dls60-umpire-saved-v1';
function getSaved() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? data : []; }
  catch { return []; }
}
function putSaved(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function renderSaved() {
  const container = $('savedList');
  container.replaceChildren();
  const saved = getSaved();
  if (!saved.length) {
    const empty = document.createElement('div'); empty.className = 'empty-events'; empty.textContent = 'No saved matches yet.'; container.appendChild(empty); return;
  }
  for (const item of saved) {
    const row = document.createElement('div'); row.className = 'saved-item';
    const info = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = item.input.matchName || 'Unnamed match';
    const detail = document.createElement('small'); detail.textContent = `${item.input.firstRuns} runs · target ${item.summary.target} · ${new Date(item.savedAt).toLocaleString()}`;
    info.append(title, detail);
    const actions = document.createElement('div'); actions.className = 'saved-actions';
    const load = document.createElement('button'); load.className = 'button button-secondary'; load.type = 'button'; load.textContent = 'Load'; load.addEventListener('click', () => loadScenario(item.input));
    const remove = document.createElement('button'); remove.className = 'button button-quiet'; remove.type = 'button'; remove.textContent = 'Delete'; remove.addEventListener('click', () => { putSaved(getSaved().filter(x => x.id !== item.id)); renderSaved(); });
    actions.append(load, remove); row.append(info, actions); container.appendChild(row);
  }
}
function inputFromUiRaw(input) {
  return {
    matchName: input.matchName || '', firstOvers: input.firstOvers, firstRuns: input.firstRuns,
    secondOvers: input.secondOvers, penaltyRuns: input.penaltyRuns || 0,
    firstEventRows: input.firstEventRows || [], secondEventRows: input.secondEventRows || []
  };
}
function loadScenario(input) {
  $('matchName').value = input.matchName || '';
  $('firstOvers').value = input.firstOvers;
  $('firstRuns').value = input.firstRuns;
  $('secondOvers').value = input.secondOvers;
  $('penaltyRuns').value = input.penaltyRuns || 0;
  $('firstEvents').replaceChildren();
  $('secondEvents').replaceChildren();
  (input.firstEventRows || []).forEach(row => addEventRow('firstEvents', row));
  (input.secondEventRows || []).forEach(row => addEventRow('secondEvents', row));
  updateEmptyMessages();
  $('matchForm').requestSubmit();
}
$('saveScenario').addEventListener('click', () => {
  try {
    const doc = scenarioDocument();
    const saved = getSaved();
    saved.unshift({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, savedAt: new Date().toISOString(), input: inputFromUiRaw(doc.input), summary: doc.resultSummary });
    putSaved(saved.slice(0, 50));
    renderSaved();
    $('saveMessage').textContent = 'Match saved on this device.';
  } catch (error) { $('saveMessage').textContent = error.message; }
});
$('clearSaved').addEventListener('click', () => {
  if (getSaved().length && confirm('Delete all saved matches from this device?')) { putSaved([]); renderSaved(); }
});
$('importScenario').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const input = data.input || data;
    if (!input || !input.firstOvers || !Array.isArray(input.firstEventRows || []) || !Array.isArray(input.secondEventRows || [])) throw new Error('This does not look like a DLS match export.');
    loadScenario(input);
    $('saveMessage').textContent = 'Match imported and recalculated on this device.';
  } catch (error) { $('saveMessage').textContent = `Import failed: ${error.message}`; }
  event.target.value = '';
});

renderSaved();
updateEmptyMessages();
// Show a baseline reference result at first launch. Replace the sample inputs with the actual match details.
try {
  const input = collectInput();
  displayResult(input, calculateMatch(input));
  $('resultSub').textContent = 'Sample scenario: 50 overs, 300 runs, no interruptions. Replace the values above for your match.';
} catch { /* User can still enter a scenario and calculate. */ }
