import { calculateMatch, parseOvers, prepareEvents, ballsToOvers, oversToBalls, deriveSecondOvers } from './engine.js';

const $ = (id) => document.getElementById(id);
let currentResult = null;
let currentInput = null;
let activeTable = 'overs';
let deferredInstallPrompt = null;
let previousMatchType = $('matchType').value;

const MATCH_TYPES = {
  odi: { overs: 50, minOvers: 20, label: 'ODI regulations (50 overs/innings; min. 20 overs/side)' },
  t20: { overs: 20, minOvers: 5, label: 'Twenty20 (20 overs/innings; min. 5 overs/side)' },
  'other-50-10': { overs: 50, minOvers: 10, label: 'Other: 50 overs/innings; min. 10 overs/side' },
  'other-45-20': { overs: 45, minOvers: 20, label: 'Other: 45 overs/innings; min. 20 overs/side' },
  'other-40-10': { overs: 40, minOvers: 10, label: 'Other: 40 overs/innings; min. 10 overs/side' }
};

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

function formatOvers(value) {
  return ballsToOvers(oversToBalls(Number(value)));
}

function addEventRow(containerId, row = {}) {
  const container = $(containerId);
  const wrapper = document.createElement('div');
  wrapper.className = 'event-row';
  wrapper.innerHTML = `
    <label class="event-field"><span>Overs bowled at stoppage</span><input type="text" class="event-overs" inputmode="decimal" placeholder="e.g. 17.3" aria-label="Overs bowled at stoppage"></label>
    <label class="event-field"><span>Runs at stoppage</span><input type="number" class="event-score" min="0" max="999" step="1" placeholder="e.g. 125" aria-label="Runs at stoppage"></label>
    <label class="event-field"><span>Wickets down</span><input type="number" class="event-wickets" min="0" max="10" step="1" placeholder="e.g. 3" aria-label="Wickets down at stoppage" value="0"></label>
    <label class="event-field"><span>Overs lost</span><input type="text" class="event-loss" inputmode="decimal" placeholder="e.g. 4.0 or A" aria-label="Overs lost at interruption"><small>Use A for all remaining overs.</small></label>
    <button class="remove-event" type="button" aria-label="Remove interruption">×</button>`;
  wrapper.querySelector('.event-overs').value = row.oversBowled ?? '';
  wrapper.querySelector('.event-score').value = row.scoreAtEvent ?? '';
  wrapper.querySelector('.event-wickets').value = row.wickets ?? 0;
  wrapper.querySelector('.event-loss').value = row.oversLost ?? '';
  wrapper.querySelector('.remove-event').addEventListener('click', () => {
    wrapper.remove();
    updateEmptyMessages();
    if (containerId === 'firstEvents') syncSecondOversFromFirst();
  });
  if (containerId === 'firstEvents') {
    wrapper.querySelectorAll('input').forEach(input => input.addEventListener('input', syncSecondOversFromFirst));
  }
  container.appendChild(wrapper);
  updateEmptyMessages();
  if (containerId === 'firstEvents') syncSecondOversFromFirst();
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

function isBlankEventRow(row) {
  return !row.oversBowled && !row.oversLost && !row.scoreAtEvent && (!row.wickets || row.wickets === '0');
}

function firstInningsAllocationPreview() {
  const scheduled = Number($('firstOvers').value);
  if (!Number.isInteger(scheduled) || scheduled < 1 || scheduled > 99) {
    return { valid: false, message: 'Enter valid first-innings scheduled overs to calculate the chase allocation.' };
  }
  const rows = readEventRows('firstEvents').filter(row => !isBlankEventRow(row));
  if (!rows.length) return { valid: true, totalLostBalls: 0, remainingOvers: `${scheduled}.0`, remainingBalls: scheduled * 6 };

  // Only use a fully entered first-innings event. An incomplete row must not
  // silently change the scheduled overs for the chasing side.
  const completeRows = [];
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].oversBowled || !rows[i].oversLost) {
      return { valid: false, message: `Complete interruption ${i + 1}: enter both overs bowled and overs lost.` };
    }
    completeRows.push(rows[i]);
  }
  try {
    const events = prepareEvents(completeRows, scheduled, 'First innings');
    const remainingOvers = deriveSecondOvers(scheduled, events);
    const remainingBalls = oversToBalls(parseOvers(remainingOvers));
    const totalLostBalls = scheduled * 6 - remainingBalls;
    return { valid: true, events, totalLostBalls, remainingOvers, remainingBalls };
  } catch (error) {
    return { valid: false, message: error?.message || 'Check the first-innings interruption entries.' };
  }
}

function syncSecondOversFromFirst() {
  const automatic = $('autoSecondOvers').checked;
  $('secondOvers').readOnly = automatic;
  $('secondOversModeLabel').textContent = automatic ? 'automatic' : 'manual override';
  if (!automatic) {
    $('secondOversHelp').textContent = 'Manual override is on. Enter the scheduled overs allocated to the chasing side in cricket notation.';
    return;
  }
  const preview = firstInningsAllocationPreview();
  if (!preview.valid) {
    $('secondOversHelp').textContent = `${preview.message} The last valid allocation is retained until the entry is complete.`;
    return;
  }
  $('secondOvers').value = preview.remainingOvers;
  const totalLost = ballsToOvers(preview.totalLostBalls);
  const scheduled = Number($('firstOvers').value);
  $('secondOversHelp').textContent = preview.totalLostBalls
    ? `${scheduled}.0 overs − ${totalLost} overs lost = ${preview.remainingOvers} overs automatically allocated to the chasing side.`
    : `No first-innings overs lost: the chasing side is allocated ${preview.remainingOvers} overs.`;
}

$('autoSecondOvers').addEventListener('change', syncSecondOversFromFirst);
$('firstOvers').addEventListener('input', syncSecondOversFromFirst);

function applyMatchType(type, { presetOvers = true } = {}) {
  const preset = MATCH_TYPES[type];
  const isCustom = type === 'custom';
  $('minOversPerSide').readOnly = !isCustom;
  $('minimumOversModeLabel').textContent = isCustom ? 'enter playing-conditions minimum' : 'match type setting';
  if (preset) {
    if (presetOvers) $('firstOvers').value = String(preset.overs);
    $('minOversPerSide').value = String(preset.minOvers);
  } else if (isCustom) {
    if (!$('minOversPerSide').value || $('minOversPerSide').value === '20') $('minOversPerSide').value = '10';
  }
  syncSecondOversFromFirst();
}

$('matchType').addEventListener('change', () => {
  const nextType = $('matchType').value;
  const hasEvents = $('firstEvents').children.length || $('secondEvents').children.length;
  if (hasEvents && !confirm('Changing match type changes the innings allocation. Clear the interruption entries and continue?')) {
    $('matchType').value = previousMatchType;
    return;
  }
  if (hasEvents) {
    $('firstEvents').replaceChildren();
    $('secondEvents').replaceChildren();
    updateEmptyMessages();
  }
  previousMatchType = nextType;
  applyMatchType(nextType);
  clearOutput();
});

function currentMatchTypeLabel() {
  const type = $('matchType').value;
  if (type === 'custom') return `Custom (${Number($('firstOvers').value)} overs/innings; min. ${Number($('minOversPerSide').value)} overs/side)`;
  return MATCH_TYPES[type]?.label || $('matchType').selectedOptions[0]?.textContent || 'Custom match type';
}

function collectInput() {
  const firstOvers = Number($('firstOvers').value);
  const firstRuns = Number($('firstRuns').value);
  const firstRows = readEventRows('firstEvents');
  const secondRows = readEventRows('secondEvents');
  const firstEvents = prepareEvents(firstRows, firstOvers, 'First innings');
  const autoSecondOvers = $('autoSecondOvers').checked;
  if (autoSecondOvers) syncSecondOversFromFirst();
  const secondOvers = parseOvers($('secondOvers').value, 'Second-innings scheduled overs');
  const secondEvents = prepareEvents(secondRows, secondOvers, 'Second innings');
  if (!Number.isInteger(firstRuns) || firstRuns < 0) throw new Error('First-innings total runs must be a whole number of 0 or more.');
  for (let i = 0; i < firstEvents.length; i++) {
    if (firstEvents[i].scoreAtEvent != null && firstEvents[i].scoreAtEvent > firstRuns) {
      throw new Error(`First-innings interruption ${i + 1}: score at stoppage cannot exceed the final innings total.`);
    }
  }
  const minOversPerSide = Number($('minOversPerSide').value);
  if (!Number.isInteger(minOversPerSide) || minOversPerSide < 0 || minOversPerSide > 99) {
    throw new Error('Minimum overs per side must be a whole number between 0 and 99.');
  }
  return {
    matchName: $('matchName').value.trim(),
    matchType: $('matchType').value,
    matchTypeLabel: currentMatchTypeLabel(),
    minOversPerSide,
    autoSecondOvers,
    firstOvers,
    firstRuns,
    secondOvers,
    secondOversNotation: $('secondOvers').value,
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
  $('resultSub').textContent = `${input.matchTypeLabel} · First innings: ${input.firstOvers} overs / ${input.firstRuns} runs · chasing allocation: ${formatOvers(input.secondOvers)} overs`;
  $('targetNumber').textContent = result.target.toLocaleString('en-ZA');
  $('lambdaValue').textContent = result.lambda.toFixed(4);
  $('adjustmentValue').textContent = result.adjustmentFactor.toFixed(9);
  $('revisedOvers').textContent = result.finalSecondOvers;
  $('resourceSummary').replaceChildren();
  const chips = [
    `First-innings overs lost: ${prettyOvers(result.firstResourcesLost)}`,
    `Second-innings overs lost: ${prettyOvers(result.secondResourcesLost)}`,
    `First-innings interruptions: ${input.firstEvents.length}`,
    `Second-innings interruptions: ${input.secondEvents.length}`,
    `Minimum overs per side: ${input.minOversPerSide}`,
    `Chase allocation: ${input.autoSecondOvers ? 'automatic' : 'manual override'}`
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
  $('matchType').value = 'odi';
  previousMatchType = 'odi';
  $('firstOvers').value = '50';
  $('firstRuns').value = '300';
  $('minOversPerSide').value = '20';
  $('minOversPerSide').readOnly = true;
  $('minimumOversModeLabel').textContent = 'match type setting';
  $('autoSecondOvers').checked = true;
  $('secondOvers').value = '50.0';
  $('penaltyRuns').value = '0';
  $('firstEvents').replaceChildren();
  $('secondEvents').replaceChildren();
  updateEmptyMessages();
  syncSecondOversFromFirst();
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
  return { app: 'DLS 6.0 Umpire Calculator', appVersion: '0.2.0', exportedAt: new Date().toISOString(), input: currentInput, resultSummary: { target: currentResult.target, lambda: currentResult.lambda, adjustmentFactor: currentResult.adjustmentFactor } };
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
    const detail = document.createElement('small'); detail.textContent = `${item.input.matchTypeLabel || item.input.matchType || 'Match'} · ${item.input.firstRuns} runs · target ${item.summary.target} · ${new Date(item.savedAt).toLocaleString()}`;
    info.append(title, detail);
    const actions = document.createElement('div'); actions.className = 'saved-actions';
    const load = document.createElement('button'); load.className = 'button button-secondary'; load.type = 'button'; load.textContent = 'Load'; load.addEventListener('click', () => loadScenario(item.input));
    const remove = document.createElement('button'); remove.className = 'button button-quiet'; remove.type = 'button'; remove.textContent = 'Delete'; remove.addEventListener('click', () => { putSaved(getSaved().filter(x => x.id !== item.id)); renderSaved(); });
    actions.append(load, remove); row.append(info, actions); container.appendChild(row);
  }
}
function inputFromUiRaw(input) {
  return {
    matchName: input.matchName || '',
    matchType: input.matchType || 'odi',
    matchTypeLabel: input.matchTypeLabel || '',
    minOversPerSide: input.minOversPerSide ?? 20,
    autoSecondOvers: input.autoSecondOvers !== false,
    firstOvers: input.firstOvers,
    firstRuns: input.firstRuns,
    secondOvers: input.secondOvers,
    secondOversNotation: formatOvers(input.secondOvers),
    penaltyRuns: input.penaltyRuns || 0,
    firstEventRows: input.firstEventRows || [],
    secondEventRows: input.secondEventRows || []
  };
}
function loadScenario(input) {
  const matchType = input.matchType && (MATCH_TYPES[input.matchType] || input.matchType === 'custom') ? input.matchType : 'custom';
  $('matchType').value = matchType;
  previousMatchType = $('matchType').value;
  applyMatchType($('matchType').value, { presetOvers: false });
  $('matchName').value = input.matchName || '';
  $('firstOvers').value = input.firstOvers;
  $('firstRuns').value = input.firstRuns;
  $('minOversPerSide').value = input.minOversPerSide ?? (MATCH_TYPES[matchType]?.minOvers ?? 10);
  $('minOversPerSide').readOnly = matchType !== 'custom';
  $('minimumOversModeLabel').textContent = matchType === 'custom' ? 'enter playing-conditions minimum' : 'match type setting';
  $('autoSecondOvers').checked = input.autoSecondOvers !== false;
  $('secondOvers').value = input.secondOversNotation || formatOvers(input.secondOvers);
  $('penaltyRuns').value = input.penaltyRuns || 0;
  $('firstEvents').replaceChildren();
  $('secondEvents').replaceChildren();
  (input.firstEventRows || []).forEach(row => addEventRow('firstEvents', row));
  (input.secondEventRows || []).forEach(row => addEventRow('secondEvents', row));
  updateEmptyMessages();
  syncSecondOversFromFirst();
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
