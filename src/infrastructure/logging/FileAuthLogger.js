const fs = require('fs');
const path = require('path');
const AuthLogger = require('../../application/ports/AuthLogger');

class FileAuthLogger extends AuthLogger {
  constructor(logDir) {
    super();
    this.logDir = logDir;
    this.logFile = path.join(logDir, 'auth.log');
  }

  log(username, success, ip) {
    if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir);

    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const entry = `[${timestamp}] IP: ${ip} - User: ${username} - Status: ${status}\n`;

    fs.appendFileSync(this.logFile, entry);
  }
}

module.exports = FileAuthLogger;