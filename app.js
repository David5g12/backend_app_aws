const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('trust proxy', true);   // IP real del cliente detrás de Apache
app.use(express.json());

// Secreto del JWT: en AWS va en variable de entorno
const SECRET_KEY = process.env.JWT_SECRET || 'clave_local_de_pruebas';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en producción');
    process.exit(1);
}

function getClientIp(req) {
    return (req.ip || '').replace('::ffff:', '');
}

function logAuthAttempt(username, success, ip) {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logFile = path.join(logDir, 'auth.log');

    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `[${timestamp}] IP: ${ip} - User: ${username} - Status: ${status}\n`;

    fs.appendFileSync(logFile, logEntry);
}

// Endpoint de salud (para probar el VPC Peering)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);

    if (username === 'admin' && password === 'secreto123') {
        logAuthAttempt(username, true, clientIp);
        const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ success: true, token });
    }

    logAuthAttempt(username || 'unknown', false, clientIp);
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
});

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend ejecutándose en el puerto ${PORT}`);
});