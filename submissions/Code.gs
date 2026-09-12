// Google Apps Script V8. Set script properties LENS_SUBMISSIONS_SHEET_ID and
// LENS_SUBMISSIONS_EMAIL_TO. Uses a dedicated "Submissions" tab.
const TERMS_VERSION = '2026-09-12';
const HEADERS = ['receivedAt', 'submissionId', 'name', 'email', 'project', 'driveLink', 'notes', 'consent', 'termsVersion', 'notification'];
function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return jsonResponse({ service: 'LENS submissions', termsVersion: TERMS_VERSION }); }
function validateSubmission(data) {
  if (data.consent !== 'true' || data.termsVersion !== TERMS_VERSION) throw new Error('consent');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(data.submissionId || '')) throw new Error('id');
  for (const [key, max] of [['name', 200], ['email', 254], ['project', 500], ['driveLink', 2048], ['notes', 5000]]) {
    if (typeof data[key] !== 'string' || data[key].length > max || (key !== 'notes' && !data[key].trim())) throw new Error('field');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('email');
  if (!/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(data.driveLink)) throw new Error('link');
}
function cellText(value) { return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value; }
function doPost(e) {
  const data = (e && e.parameter) || {};
  try { validateSubmission(data); } catch (error) { return jsonResponse({ ok: false, error: 'invalid_submission' }); }
  const properties = PropertiesService.getScriptProperties();
  const sheetId = properties.getProperty('LENS_SUBMISSIONS_SHEET_ID');
  if (!sheetId) return jsonResponse({ ok: false, error: 'not_configured' });
  const lock = LockService.getScriptLock();
  let sheet, row;
  try {
    lock.waitLock(20000);
    const book = SpreadsheetApp.openById(sheetId);
    sheet = book.getSheetByName('Submissions') || book.insertSheet('Submissions');
    if (!sheet.getLastRow()) sheet.appendRow(HEADERS);
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(2, 2, last - 1, 1).getValues();
      const found = ids.findIndex(item => item[0] === data.submissionId);
      if (found >= 0) {
        const saved = sheet.getRange(found + 2, 3, 1, 7).getValues()[0];
        const expected = ['name', 'email', 'project', 'driveLink', 'notes'].map(k => cellText(data[k])).concat(['true', TERMS_VERSION]);
        // Sheets may omit a leading formula-escape apostrophe when reading cells.
        const plain = x => String(x).replace(/^'(?=[\s]*[=+\-@])/, '');
        const normalise = (value, index) => {
          if (index === 5) return String(value).toLowerCase();
          if (index === 6 && value instanceof Date) {
            return Utilities.formatDate(value, book.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
          }
          return plain(value);
        };
        if (!saved.every((v, i) => normalise(v, i) === normalise(expected[i], i))) return jsonResponse({ ok: false, error: 'id_conflict' });
        return jsonResponse({ ok: true, submissionId: data.submissionId });
      }
    }
    sheet.appendRow([new Date().toISOString(), data.submissionId, ...['name', 'email', 'project', 'driveLink', 'notes'].map(k => cellText(data[k])), 'true', "'" + TERMS_VERSION, 'pending']);
    SpreadsheetApp.flush();
    row = sheet.getLastRow();
  } catch (error) {
    return jsonResponse({ ok: false, error: 'storage_failed' });
  } finally { if (lock.hasLock()) lock.releaseLock(); }
  // Receipt means the record is saved. Email failure must not invite duplicate submissions.
  try {
    const to = properties.getProperty('LENS_SUBMISSIONS_EMAIL_TO');
    if (to) {
      MailApp.sendEmail({ to, subject: 'LENS submission: ' + data.project.replace(/[\r\n]/g, ' '), body: ['Submission: ' + data.submissionId, 'Name: ' + data.name, 'Email: ' + data.email, 'Project: ' + data.project, 'File: ' + data.driveLink, 'Notes: ' + data.notes, 'Consent accepted: ' + TERMS_VERSION].join('\n') });
      sheet.getRange(row, 10).setValue('sent');
    } else { sheet.getRange(row, 10).setValue('not_configured'); }
  } catch (error) {
    try { sheet.getRange(row, 10).setValue('failed'); } catch (_) {}
  }
  return jsonResponse({ ok: true, submissionId: data.submissionId });
}
