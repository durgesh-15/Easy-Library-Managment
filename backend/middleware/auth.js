const jwt = require('jsonwebtoken');
const cred = require('../utilities/credentials');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token)
        return res.status(401).send({ message: 'Access token required' });

    jwt.verify(token, cred.jwtSecret, (err, decoded) => {
        if (err)
            return res.status(403).send({ message: 'Invalid or expired token' });

        req.user = decoded;
        next();
    });
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role))
            return res.status(403).send({ message: 'Insufficient permissions' });

        next();
    };
}

module.exports = { verifyToken, requireRole };
