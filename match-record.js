export const APP_VERSION = '1.0.1';

export function normaliseCapturer(firstName, surname) {
  const first = String(firstName ?? '').trim().replace(/\s+/g, ' ') || 'Name';
  const last = String(surname ?? '').trim().replace(/\s+/g, ' ') || 'Surname';
  if (first.length > 60 || last.length > 60) throw new Error('Capturer names must be 60 characters or fewer.');
  if (/[<>\u0000-\u001f]/.test(first) || /[<>\u0000-\u001f]/.test(last)) throw new Error('Capturer names contain unsupported characters.');
  return { firstName: first, surname: last, fullName: `${first} ${last}` };
}

export function createMatchArchiveRecord({ id, savedAt, input, summary, reportDetails = null, parScoreTables = null }) {
  if (!id || !/^[A-Za-z0-9-]{8,80}$/.test(String(id))) throw new Error('A valid match record ID is required.');
  if (!input || typeof input !== 'object') throw new Error('Match input is missing.');
  const legacyFullName = [input.capturerFirstName, input.capturerSurname]
    .filter(value => value && value !== 'Name' && value !== 'Surname').join(' ');
  const fullName = String(input.capturerFullName || input.capturedBy || legacyFullName).trim().replace(/\\s+/g, ' ');
  let capturedBy;
  if (fullName) {
    if (fullName.length > 120) throw new Error('Capturer name must be 120 characters or fewer.');
    if (/[<>\\u0000-\\u001f]/.test(fullName)) throw new Error('Capturer name contains unsupported characters.');
    capturedBy = { firstName: fullName, surname: '', fullName };
  } else {
    capturedBy = normaliseCapturer('', '');
  }
  if (!summary || typeof summary !== 'object') throw new Error('DLS result summary is missing.');
  return {
    schemaVersion: 1,
    recordType: 'dls-match-record',
    id: String(id),
    capturedAt: savedAt || new Date().toISOString(),
    app: 'DLS 6.0 Umpire Calculator',
    appVersion: APP_VERSION,
    capturedBy,
    match: input,
    resultSummary: summary,
    reportDetails,
    parScoreTables
  };
}
