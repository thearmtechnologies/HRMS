const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

if (process.env.GMAIL_TOKENS) {
  try {
    const tokens = JSON.parse(process.env.GMAIL_TOKENS);
    oAuth2Client.setCredentials(tokens);
  } catch (err) {
    console.error('❌ Invalid GMAIL_TOKENS format in .env:', err);
  }
} else {
  console.warn('⚠️ No GMAIL_TOKENS found in environment. Run googleAuth.js to generate them.');
}

oAuth2Client.on('tokens', (newTokens) => {
  try {
    const oldTokens = process.env.GMAIL_TOKENS ? JSON.parse(process.env.GMAIL_TOKENS) : {};
    const updatedTokens = { ...oldTokens, ...newTokens };

    const envPath = '.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    const newEnv = envContent.includes('GMAIL_TOKENS=')
      ? envContent.replace(/GMAIL_TOKENS=.*/g, `GMAIL_TOKENS=${JSON.stringify(updatedTokens)}`)
      : `${envContent}\nGMAIL_TOKENS=${JSON.stringify(updatedTokens)}`;
    fs.writeFileSync(envPath, newEnv, 'utf8');

    console.log('🔄 GMAIL_TOKENS refreshed and saved to .env');
  } catch (err) {
    console.error('❌ Failed to update tokens in .env:', err);
  }
});

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

async function sendEmail(to, subject, text) {
  const message = [
    `From: ${process.env.EMAIL_USER}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    text,
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  return res.data;
}

module.exports = { sendEmail };





// gmailClient.js
// const { google } = require('googleapis');
// const fs = require('fs');
// require('dotenv').config();

// const TOKEN_PATH = 'tokens.json';

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// // Load tokens
// if (fs.existsSync(TOKEN_PATH)) {
//   try {
//     const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
//     oAuth2Client.setCredentials(tokens);
//   } catch (err) {
//     console.error('❌ Failed to parse tokens.json:', err);
//   }
// } else {
//   console.warn('⚠️ No tokens.json found. Run googleAuth.js to generate tokens.');
// }

// const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// /**
//  * Send email (supports optional attachments)
//  * @param {string} to
//  * @param {string} subject
//  * @param {string} text
//  * @param {Array} attachments - Optional array of attachments [{ filename, content, contentType }]
//  */
// async function sendEmail(to, subject, text, attachments = []) {
//   // Create MIME boundary
//   const boundary = 'boundary-' + Math.random().toString(36).slice(2);

//   let messageParts = [
//     `From: ${process.env.EMAIL_USER}`,
//     `To: ${to}`,
//     `Subject: ${subject}`,
//     `MIME-Version: 1.0`,
//     attachments.length
//       ? `Content-Type: multipart/mixed; boundary=${boundary}\n`
//       : `Content-Type: text/plain; charset="UTF-8"\n`,
//   ];

//   if (attachments.length === 0) {
//     // Simple text email
//     messageParts.push(text);
//   } else {
//     // Multipart email with attachments
//     let body = [`--${boundary}`, `Content-Type: text/plain; charset="UTF-8"`, '', text, ''];

//     for (const attachment of attachments) {
//       const base64Data =
//         Buffer.isBuffer(attachment.content)
//           ? attachment.content.toString('base64')
//           : Buffer.from(attachment.content).toString('base64');

//       body.push(
//         `--${boundary}`,
//         `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
//         `Content-Disposition: attachment; filename="${attachment.filename}"`,
//         `Content-Transfer-Encoding: base64`,
//         '',
//         base64Data,
//         ''
//       );
//     }

//     body.push(`--${boundary}--`);
//     messageParts = messageParts.concat(body);
//   }

//   const rawMessage = messageParts.join('\n');

//   const encodedMessage = Buffer.from(rawMessage)
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');

//   const res = await gmail.users.messages.send({
//     userId: 'me',
//     requestBody: { raw: encodedMessage },
//   });

//   return res.data;
// }

// module.exports = { sendEmail };

