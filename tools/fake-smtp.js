// Local test SMTP sink: accepts one-or-more messages and writes them to tools/smtp-received.txt. Dev only.
const net = require('net'); const fs = require('fs');
const out = __dirname + '/smtp-received.txt';
net.createServer((s) => {
  let data = false, buf = '';
  s.write('220 fake-smtp ready\r\n');
  s.on('data', (d) => {
    buf += d.toString();
    if (data) { if (/\r\n\.\r\n$/.test(buf)) { fs.appendFileSync(out, buf + '\n=====\n'); buf = ''; data = false; s.write('250 queued\r\n'); } return; }
    buf.split('\r\n').filter(Boolean).forEach((l) => {
      const u = l.toUpperCase();
      if (u.startsWith('EHLO')) s.write('250 fake\r\n');
      else if (u.startsWith('MAIL') || u.startsWith('RCPT')) s.write('250 ok\r\n');
      else if (u === 'DATA') { s.write('354 go\r\n'); data = true; }
      else if (u === 'QUIT') { s.write('221 bye\r\n'); s.end(); }
    });
    if (!data) buf = '';
  });
}).listen(2525, '127.0.0.1', () => console.log('fake smtp on 2525'));
