// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Cheia secretă pentru token (o folosim să semnăm legitimațiile)
const SECRET_KEY = process.env.JWT_SECRET || 'cheie_secreta_proizorie';

// --- 1. ÎNREGISTRARE (REGISTER) ---
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // A. Verificăm dacă userul există deja
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Acest email este deja folosit!" });
        }

        // B. Criptăm parola (O amestecăm de 10 ori)
        const hashedPassword = await bcrypt.hash(password, 10);

        // C. API EXTERN (Cerința Proiect): Generăm un avatar automat
        // Folosim serviciul DiceBear care ne dă o poză pe baza numelui
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}+${lastName}`;

        // D. Salvăm userul în baza de date
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'EXECUTANT' // Dacă nu zice nimic, e executant
        });

        // E. Răspundem la frontend că e gata
        res.status(201).json({ 
            message: "Cont creat cu succes!", 
            user: {
                id: newUser.id,
                email: newUser.email,
                avatar: avatarUrl
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- 2. LOGARE (LOGIN) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // A. Căutăm userul după email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Userul nu există!" });
        }

        // B. Verificăm parola (comparăm ce a scris el cu ce e criptat în bază)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Parolă greșită!" });
        }

        // C. Generăm Token-ul (Legitimația de acces)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            SECRET_KEY, 
            { expiresIn: '24h' } // Expiră într-o zi
        );

        res.json({
            message: "Logare reușită!",
            token: token,
            user: {
                id: user.id,
                firstName: user.firstName,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};