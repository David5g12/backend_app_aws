const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta_segura';

function logAuthAttempt(username, success, ip) {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logFile = path.join(logDir, 'auth.log');
    
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `[${timestamp}] IP: ${ip} - User: ${username} - Status: ${status}\n`;
    
    fs.appendFileSync(logFile, logEntry);
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    if (username === 'admin' && password === 'secreto123') {
        logAuthAttempt(username, true, clientIp);
        const token = jwt.sign({ username: username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
    } else {
        logAuthAttempt(username || 'unknown', false, clientIp);
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token requerido' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

app.get('/api/dashboard', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido al Dashboard protegido por JWT',
        data: { serverTime: new Date(), user: req.user }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend ejecutándose en el puerto ${PORT}`);
});