import { calculateMatch, parseOvers, prepareEvents, ballsToOvers, oversToBalls, deriveSecondOvers } from './engine.js';

const $ = (id) => document.getElementById(id);
let currentResult = null;
let currentInput = null;
let activeTable = 'overs';
let deferredInstallPrompt = null;
let previousMatchType = $('matchType').value;

const MATCH_TYPES = {
  odi: { overs: 50, minOvers: 20, label: 'ODI regulations (50 overs/innings)' },
  t20: { overs: 20, minOvers: 5, label: 'Twenty20 (20 overs/innings)' },
  'other-50-10': { overs: 50, minOvers: 10, label: 'Other: 50 overs/innings' },
  'other-45-20': { overs: 45, minOvers: 20, label: 'Other: 45 overs/innings' },
  'other-40-10': { overs: 40, minOvers: 10, label: 'Other: 40 overs/innings' }
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

function applyMatchType(type, { presetOvers = true, preserveOtherMinimum = false } = {}) {
  const preset = MATCH_TYPES[type];
  const isFixedMinimum = type === 'odi' || type === 't20';
  const isOther = type.startsWith('other-') || type === 'custom';

  $('minOversPerSide').readOnly = isFixedMinimum;
  $('minimumOversModeLabel').textContent = isFixedMinimum ? 'fixed by match type' : 'editable playing condition';
  if (preset) {
    if (presetOvers) $('firstOvers').value = String(preset.overs);
    if (!preserveOtherMinimum || isFixedMinimum) $('minOversPerSide').value = String(preset.minOvers);
  } else if (type === 'custom') {
    if (presetOvers || !$('minOversPerSide').value || Number($('minOversPerSide').value) < 1) $('minOversPerSide').value = '10';
  }

  if (isFixedMinimum) {
    $('minimumOversHelp').textContent = type === 'odi'
      ? 'ODI default: 20 minimum overs per side.'
      : 'T20 default: 5 minimum overs per side.';
  } else if (isOther) {
    $('minimumOversHelp').textContent = 'Set the minimum overs required by this competition’s playing conditions.';
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
$('minOversPerSide').addEventListener('input', clearOutput);

function currentMatchTypeLabel() {
  const type = $('matchType').value;
  const min = Number($('minOversPerSide').value);
  const scheduled = Number($('firstOvers').value);
  if (type === 'custom') return `Custom (${scheduled} overs/innings; minimum ${min} overs/side)`;
  const preset = MATCH_TYPES[type];
  if (preset) return `${preset.label}; minimum ${min} overs/side`;
  return $('matchType').selectedOptions[0]?.textContent || 'Custom match type';
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
  if (!Number.isInteger(minOversPerSide) || minOversPerSide < 1 || minOversPerSide > 99) {
    throw new Error('Minimum overs per side must be a whole number between 1 and 99.');
  }
  if (minOversPerSide > firstOvers) {
    throw new Error('Minimum overs per side cannot exceed the scheduled first-innings overs.');
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
  $('resultTitle').textContent = input.matchName || (result.noResult ? 'No result' : 'Revised target');
  $('resultSub').textContent = `${input.matchTypeLabel} · First innings: ${input.firstOvers} overs / ${input.firstRuns} runs · chasing allocation: ${formatOvers(input.secondOvers)} overs`;
  $('targetNumber').textContent = result.target.toLocaleString('en-ZA');
  const targetLabel = document.querySelector('.target-label');
  targetLabel.textContent = result.noResult ? 'PROVISIONAL DLS TARGET · NO RESULT' : 'SECOND INNINGS TARGET';
  const outcome = $('minimumOversOutcome');
  outcome.classList.toggle('hidden', !result.noResult);
  if (result.noResult) {
    outcome.textContent = `NO RESULT: ${result.noResultReason}`;
  }
  $('secondFinalRuns').value = '';
  $('secondFinalWickets').value = '';
  $('secondFinalOvers').value = '';
  updateReportAvailability();
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
  $('tableMeta').textContent = `${rows.length} ${type === 'overs' ? 'over' : 'ball'} positions · overs bowled ${rows[0]?.oversBowled ?? '—'} to ${rows.at(-1)?.oversBowled ?? '—'} · par score for 0–9 wickets`; 
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
  $('minimumOversModeLabel').textContent = 'fixed by match type';
  $('minimumOversHelp').textContent = 'ODI default: 20 minimum overs per side.';
  $('autoSecondOvers').checked = true;
  $('secondOvers').value = '50.0';
  $('penaltyRuns').value = '0';
  ['secondFinalRuns','secondFinalWickets','secondFinalOvers','reportCompetition','reportFirstTeam','reportSecondTeam','reportVenue'].forEach(id => { if ($(id)) $(id).value = ''; });
  if ($('reportDate')) $('reportDate').value = '';
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
  return { app: 'DLS 6.0 Umpire Calculator', appVersion: '0.3.1', exportedAt: new Date().toISOString(), input: currentInput, resultSummary: { target: currentResult.target, lambda: currentResult.lambda, adjustmentFactor: currentResult.adjustmentFactor, noResult: currentResult.noResult } };
}
function updateReportAvailability() {
  const button = $('createMatchReport');
  if (!button) return;
  const scoreText = $('secondFinalRuns').value.trim();
  const score = scoreText === '' ? NaN : Number(scoreText);
  const scoreValid = Number.isInteger(score) && score >= 0;
  const targetReached = !!currentResult && scoreValid && score >= currentResult.target;
  const eligible = targetReached && !currentResult.noResult;
  button.disabled = !eligible;
  const tag = $('reportGateTag');
  const status = $('reportAvailability');
  if (!currentResult) {
    tag.textContent = 'Calculate a match first';
    status.textContent = 'Calculate the DLS target, then enter the chasing team’s final score.';
  } else if (currentResult.noResult) {
    tag.textContent = 'No result';
    status.textContent = `Report unavailable: ${currentResult.noResultReason}`;
  } else if (!scoreValid) {
    tag.textContent = 'Target not yet confirmed';
    status.textContent = `Enter the chasing team's final score. The target is ${currentResult.target}.`;
  } else if (!targetReached) {
    tag.textContent = 'Target not achieved';
    status.textContent = `Score ${score} is below the target of ${currentResult.target}. The match report remains unavailable.`;
  } else {
    tag.textContent = 'Target achieved';
    status.textContent = `Target ${currentResult.target} achieved with ${score} runs. The DLS match report is now available.`;
  }
}

$('secondFinalRuns').addEventListener('input', updateReportAvailability);
$('secondFinalWickets').addEventListener('input', updateReportAvailability);
$('secondFinalOvers').addEventListener('input', updateReportAvailability);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}
function reportEventRows(events) {
  if (!events.length) return '<tr><td colspan="5">No interruptions recorded.</td></tr>';
  return events.map((e, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(ballsToOvers(oversToBalls(e.oversBowled)))}</td><td>${e.scoreAtEvent == null ? '—' : e.scoreAtEvent}</td><td>${e.wickets}</td><td>${escapeHtml(ballsToOvers(oversToBalls(e.oversLost)))}</td></tr>`).join('');
}
function createReportHtml() {
  if (!currentInput || !currentResult) throw new Error('Calculate a match first.');
  const finalRuns = Number($('secondFinalRuns').value);
  if (!Number.isInteger(finalRuns) || finalRuns < currentResult.target) throw new Error('The chasing team must have reached the DLS target before a match report can be created.');
  if (currentResult.noResult) throw new Error('A match report cannot be created because the minimum-overs requirement was not met.');
  const wicketsRaw = $('secondFinalWickets').value.trim();
  const wicketsLost = wicketsRaw === '' ? null : Number(wicketsRaw);
  if (wicketsLost != null && (!Number.isInteger(wicketsLost) || wicketsLost < 0 || wicketsLost > 9)) throw new Error('For a completed win, wickets lost must be a whole number from 0 to 9.');
  for (const event of currentInput.secondEvents) {
    if (event.scoreAtEvent != null && event.scoreAtEvent > finalRuns) throw new Error('The final chasing score cannot be lower than a score already recorded at an interruption.');
    if (wicketsLost != null && event.wickets > wicketsLost) throw new Error('Wickets lost at finish cannot be lower than the wickets already lost at an interruption.');
  }
  const finalOvers = $('secondFinalOvers').value.trim();
  if (finalOvers) {
    const parsedFinalOvers = parseOvers(finalOvers, 'Chasing innings overs at finish');
    if (oversToBalls(parsedFinalOvers) > oversToBalls(currentResult.finalSecondOvers)) throw new Error('Overs at finish cannot exceed the revised chase length.');
  }
  const competition = $('reportCompetition').value.trim() || '—';
  const team1 = $('reportFirstTeam').value.trim() || 'Team batting first';
  const team2 = $('reportSecondTeam').value.trim() || 'Team batting second';
  const venue = $('reportVenue').value.trim() || '—';
  const dateValue = $('reportDate').value;
  const matchDate = dateValue ? new Date(`${dateValue}T12:00:00`).toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' }) : new Date().toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' });
  const wicketMargin = wicketsLost == null ? '' : ` Won by ${10 - wicketsLost} wicket${10 - wicketsLost === 1 ? '' : 's'}.`;
  const resultText = `${team2} achieved the target of ${currentResult.target} with ${finalRuns} runs${wicketMargin}`;
  const matchTitle = currentInput.matchName || `${team1} vs ${team2}`;
  const firstTable = reportEventRows(currentInput.firstEvents);
  const secondTable = reportEventRows(currentInput.secondEvents);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DLS Match Report - ${escapeHtml(matchTitle)}</title><style>
    *{box-sizing:border-box}body{font:14px/1.5 Arial,sans-serif;color:#17263d;margin:0;background:#eef2f7}.page{max-width:900px;margin:24px auto;background:#fff;padding:38px 44px;box-shadow:0 8px 28px #12243a18}.top{border-bottom:3px solid #17395f;padding-bottom:18px;margin-bottom:22px}.eyebrow{font-size:11px;letter-spacing:.13em;color:#38649a;font-weight:bold;text-transform:uppercase}.top h1{font-size:27px;margin:5px 0;color:#132b49}.sub{color:#64748b}.meta,.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.tile{border:1px solid #dbe3ed;border-radius:8px;padding:11px}.tile small{display:block;color:#718096;font-size:10px;text-transform:uppercase;font-weight:bold}.tile strong{display:block;font-size:16px;margin-top:4px}.section{margin:22px 0}.section h2{font-size:16px;color:#18385f;border-bottom:1px solid #dbe3ed;padding-bottom:7px}.callout{background:#edf5ff;border-left:4px solid #2a65ac;padding:14px 16px;margin:16px 0}.callout strong{font-size:18px}.result{background:#edf8f1;border-left:4px solid #258354;padding:14px 16px;margin:16px 0}.result strong{color:#17603f}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}th,td{text-align:left;padding:8px;border:1px solid #dbe3ed}th{background:#f0f4f8;color:#354a66}.foot{border-top:1px solid #dbe3ed;margin-top:30px;padding-top:12px;font-size:10px;color:#77869a}.actions{display:flex;gap:10px;justify-content:flex-end;margin:0 auto 18px;max-width:900px}.actions button{background:#245ea9;color:#fff;border:0;border-radius:7px;padding:10px 15px;font-weight:bold;cursor:pointer}@media(max-width:620px){.page{margin:0;padding:22px 16px}.meta,.stats{grid-template-columns:1fr 1fr}.actions{padding:12px;justify-content:stretch}.actions button{flex:1}}@media print{body{background:#fff}.page{box-shadow:none;margin:0 auto;padding:10mm;max-width:none}.actions{display:none}.section,.callout,.result{break-inside:avoid}}
    </style></head><body><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div><main class="page"><header class="top"><div class="eyebrow">DLS 6.0 · Match report</div><h1>${escapeHtml(matchTitle)}</h1><div class="sub">${escapeHtml(competition)} · ${escapeHtml(venue)} · ${escapeHtml(matchDate)}</div></header>
    <div class="meta"><div class="tile"><small>Match format</small><strong>${escapeHtml(currentInput.matchTypeLabel)}</strong></div><div class="tile"><small>Minimum overs per side</small><strong>${currentInput.minOversPerSide}</strong></div><div class="tile"><small>Overs at start</small><strong>${escapeHtml(formatOvers(currentInput.firstOvers))}</strong></div></div>
    <section class="section"><h2>First innings — ${escapeHtml(team1)}</h2><div class="stats"><div class="tile"><small>Final score</small><strong>${currentInput.firstRuns}</strong></div><div class="tile"><small>Scheduled overs</small><strong>${escapeHtml(formatOvers(currentInput.firstOvers))}</strong></div><div class="tile"><small>Overs lost</small><strong>${escapeHtml(prettyOvers(currentResult.firstResourcesLost))}</strong></div><div class="tile"><small>Overs available</small><strong>${escapeHtml(prettyOvers(currentResult.firstRemainingOvers))}</strong></div></div><h3>Interruption record</h3><table><thead><tr><th>#</th><th>Overs bowled</th><th>Score</th><th>Wickets</th><th>Overs lost</th></tr></thead><tbody>${firstTable}</tbody></table></section>
    <section class="section"><h2>Second innings — ${escapeHtml(team2)}</h2><div class="stats"><div class="tile"><small>Target</small><strong>${currentResult.target}</strong></div><div class="tile"><small>Final score</small><strong>${finalRuns}${wicketsLost == null ? '' : `/${wicketsLost}`}</strong></div><div class="tile"><small>Overs at finish</small><strong>${escapeHtml(finalOvers || 'Not entered')}</strong></div></div><p>Overs allocated at start of chase: <strong>${escapeHtml(formatOvers(currentInput.secondOvers))}</strong>. Second-innings overs lost: <strong>${escapeHtml(prettyOvers(currentResult.secondResourcesLost))}</strong>. Revised chase length: <strong>${escapeHtml(currentResult.finalSecondOvers)}</strong>.</p><h3>Interruption record</h3><table><thead><tr><th>#</th><th>Overs bowled</th><th>Score</th><th>Wickets</th><th>Overs lost</th></tr></thead><tbody>${secondTable}</tbody></table></section>
    <div class="callout"><div>Revised DLS target</div><strong>${currentResult.target} runs</strong><div>First-innings lambda: ${currentResult.lambda.toFixed(4)} · Adjustment factor: ${currentResult.adjustmentFactor.toFixed(9)}</div></div><div class="result"><strong>RESULT</strong><br>${escapeHtml(resultText)}</div>
    <footer class="foot">Generated locally by the private DLS 6.0 Umpire Calculator. This report is a user-generated calculation summary, not an ICC-issued or certified match report. Verify official match decisions against the authorised DLS application and applicable playing conditions.</footer></main></body></html>`;
}

$('createMatchReport').addEventListener('click', () => {
  try {
    const html = createReportHtml();
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      downloadBlob(`${safeFilename(currentInput?.matchName)}-dls-match-report.html`, html, 'text/html;charset=utf-8');
      $('reportAvailability').textContent = 'Popup blocked: the report HTML has been downloaded instead.';
      return;
    }
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  } catch (error) {
    $('reportAvailability').textContent = error?.message || 'Could not create the match report.';
  }
});

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
    const detail = document.createElement('small'); detail.textContent = `${item.input.matchTypeLabel || item.input.matchType || 'Match'} · ${item.input.firstRuns} runs · ${item.summary.noResult ? 'No result' : `target ${item.summary.target}`} · ${new Date(item.savedAt).toLocaleString()}`;
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
  applyMatchType(matchType, { presetOvers: false, preserveOtherMinimum: true });
  $('minOversPerSide').value = input.minOversPerSide ?? (MATCH_TYPES[matchType]?.minOvers ?? 10);
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
if ($('reportDate')) $('reportDate').value = new Date().toLocaleDateString('en-CA');
// Show a baseline reference result at first launch. Replace the sample inputs with the actual match details.
try {
  const input = collectInput();
  displayResult(input, calculateMatch(input));
  $('resultSub').textContent = 'Sample scenario: 50 overs, 300 runs, no interruptions. Replace the values above for your match.';
} catch { /* User can still enter a scenario and calculate. */ }
