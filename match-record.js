export const APP_VERSION = '0.5.0';

export function normaliseCapturer(firstName, surname) {
  const first = String(firstName ?? '').trim().replace(/\s+/g, ' ');
  const last = String(surname ?? '').trim().replace(/\s+/g, ' ');
  if (!first) throw new Error('The match capturer first name is required.');
  if (!last) throw new Error('The match capturer surname is required.');
  if (first.length > 60 || last.length > 60) throw new Error('Capturer names must be 60 characters or fewer.');
  if (/[<>\u0000-\u001f]/.test(first) || /[<>\u0000-\u001f]/.test(last)) throw new Error('Capturer names contain unsupported characters.');
  return { firstName: first, surname: last, fullName: `${first} ${last}` };
}

export function createMatchArchiveRecord({ id, savedAt, input, summary, reportDetails = null, parScoreTables = null }) {
  if (!id || !/^[A-Za-z0-9-]{8,80}$/.test(String(id))) throw new Error('A valid match record ID is required.');
  if (!input || typeof input !== 'object') throw new Error('Match input is missing.');
  const capturedBy = normaliseCapturer(input.capturerFirstName, input.capturerSurname);
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
