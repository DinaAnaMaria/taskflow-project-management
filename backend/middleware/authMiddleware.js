const jwt = require('jsonwebtoken');

// Folosim aceeași cheie secretă ca la login
const SECRET_KEY = process.env.JWT_SECRET || 'cheie_secreta_proizorie';

const verifyToken = (req, res, next) => {
    // 1. Căutăm biletul (Token-ul) în antetul cererii
    const authHeader = req.headers['authorization'];
    
    // De obicei vine sub forma "Bearer kjdshfksd...", luăm doar partea a doua
    const token = authHeader && authHeader.split(' ')[1]; 

    // Dacă nu are bilet deloc
    if (!token) {
        return res.status(403).json({ error: "Nu ai acces! Token lipsă." });
    }

    // 2. Verificăm dacă biletul e valid (semnătura e corectă și nu a expirat)
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token invalid sau expirat!" });
        }
        
        // 3. Dacă e bun, lăsăm userul să treacă și îi salvăm datele
        req.user = user; 
        next(); // "Poți trece mai departe!"
    });
};

module.exports = verifyToken;