// FitTrack Google Drive Sync — Apps Script Backend
// Paste this entire file into Google Apps Script, then deploy as a Web App.

var FILE_NAME = 'fittrack_backup.json';

// ── GET: Restore data ─────────────────────────────────────────
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'restore') {
    return handleRestore();
  }
  return jsonResponse({status: 'ok', message: 'FitTrack Sync API running'});
}

// ── POST: Backup data ─────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'backup') {
      return handleBackup(body.data);
    }
    return jsonResponse({status: 'error', error: 'Unknown action'});
  } catch(err) {
    return jsonResponse({status: 'error', error: err.toString()});
  }
}

// ── BACKUP ────────────────────────────────────────────────────
function handleBackup(data) {
  try {
    var content = JSON.stringify({
      savedAt: new Date().toISOString(),
      data: data
    });
    var files = DriveApp.getFilesByName(FILE_NAME);
    if (files.hasNext()) {
      // Update existing file
      var file = files.next();
      file.setContent(content);
    } else {
      // Create new file
      DriveApp.createFile(FILE_NAME, content, MimeType.PLAIN_TEXT);
    }
    return jsonResponse({status: 'ok', savedAt: new Date().toISOString()});
  } catch(err) {
    return jsonResponse({status: 'error', error: err.toString()});
  }
}

// ── RESTORE ───────────────────────────────────────────────────
function handleRestore() {
  try {
    var files = DriveApp.getFilesByName(FILE_NAME);
    if (!files.hasNext()) {
      return jsonResponse({status: 'error', error: 'No backup file found in Drive'});
    }
    var file = files.next();
    var parsed = JSON.parse(file.getBlob().getDataAsString());
    return jsonResponse({status: 'ok', savedAt: parsed.savedAt, data: parsed.data});
  } catch(err) {
    return jsonResponse({status: 'error', error: err.toString()});
  }
}

// ── HELPER ────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
