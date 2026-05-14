function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var recipient = 'kksummitweb@gmail.com';

    var name = String(p.name || '').trim();
    var email = String(p.email || '').trim();
    var phone = String(p.phone || '').trim();
    var business = String(p.business || '').trim();
    var details = String(p.details || '').trim();
    var submittedAt = String(p.submittedAt || '').trim() || new Date().toISOString();
    var sourcePage = String(p.sourcePage || '').trim();

    if (!name || !email || !details) {
      return jsonResponse({ result: 'error', message: 'Missing required fields.' });
    }

    // Save each submission to the active sheet when a sheet is bound to this script.
    try {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (spreadsheet) {
        var sheet = spreadsheet.getActiveSheet();
        sheet.appendRow([submittedAt, name, email, phone, business, details, sourcePage]);
      }
    } catch (_sheetError) {
      // Continue sending email even if sheet logging fails.
    }

    var subject = 'New Website Inquiry from ' + name;
    var body =
      'New form submission:\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + (phone || 'Not provided') + '\n' +
      'Business: ' + (business || 'Not provided') + '\n' +
      'Details: ' + details + '\n' +
      'Time: ' + submittedAt + '\n' +
      'Source: ' + (sourcePage || 'Not provided');

    try {
      MailApp.sendEmail(recipient, subject, body, {
        replyTo: email || recipient,
      });
      Logger.log('Email sent successfully to ' + recipient + ' for ' + name);
    } catch (emailError) {
      Logger.log('Email sending error: ' + String(emailError));
      return jsonResponse({ result: 'error', message: 'Email failed to send: ' + String(emailError) });
    }

    return jsonResponse({ result: 'success', message: 'Form submitted and email notification sent!' });
  } catch (err) {
    return jsonResponse({ result: 'error', message: String(err) });
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}