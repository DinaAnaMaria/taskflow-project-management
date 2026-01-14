require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize'); 
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ================= RELAȚII BAZĂ DE DATE =================
// Relație ierarhică User (Manager -> Executant)
User.hasMany(User, { as: 'subordinates', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });

// Relații Proiecte și Task-uri
User.hasMany(Project, { foreignKey: 'managerId' });
Project.belongsTo(User, { foreignKey: 'managerId' });

Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' }); 
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'executor' }); 

// ================= MIDDLEWARE AUTH =================
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acces interzis!' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalid.' });
        req.user = user;
        next();
    });
};

// ================= RUTE UTILIZATORI (ADMIN) =================

// Adminul poate adăuga orice tip de utilizator și aloca un manager unui executant
app.post('/api/admin/create-user', authenticate, async (req, res) => { 
    if(req.user.role !== 'admin') return res.status(403).json({error: 'Doar adminul poate crea utilizatori'});
    try {
        const { firstName, lastName, email, password, role, managerId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName, lastName, email, password: hashedPassword, role, managerId
        });
        res.json({ message: 'Utilizator creat cu succes', user: newUser });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ================= RUTE TASK-URI (FLUX COMPLET) =================

// 1. Managerul creează un task (Stare: OPEN)
app.post('/api/tasks', authenticate, async (req, res) => {
    if(req.user.role === 'executant') return res.status(403).json({error: 'Executanții nu pot crea task-uri'});
    try {
        const task = await Task.create({
            ...req.body,
            status: 'OPEN' // Cerință: La creare are starea OPEN
        });
        res.json(task);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2. Managerul alocă task-ul (Stare: PENDING)
app.put('/api/tasks/:id/assign', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});
    try {
        await Task.update(
            { assignedTo: req.body.assignedTo, status: 'PENDING' }, 
            { where: { id: req.params.id } }
        );
        res.json({ message: 'Task alocat, stare: PENDING' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 3. Executantul marchează ca realizat (Stare: COMPLETED)
app.put('/api/tasks/:id/complete', authenticate, async (req, res) => {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.assignedTo !== req.user.id) return res.status(403).json({error: 'Nu ești alocat pe acest task'});
    
    await task.update({ status: 'COMPLETED' });
    res.json({ message: 'Task realizat, stare: COMPLETED' });
});

// 4. Managerul închide task-ul (Stare: CLOSED)
app.put('/api/tasks/:id/close', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Doar un manager poate închide task-ul'});
    
    const task = await Task.findByPk(req.params.id);
    if(task.status !== 'COMPLETED') return res.status(400).json({error: 'Task-ul trebuie să fie COMPLETED pentru a fi închis'});
    
    await task.update({ status: 'CLOSED' });
    res.json({ message: 'Task închis definitiv, stare: CLOSED' });
});

// ================= RUTE ISTORIC ȘI CONSULTARE =================

// Un utilizator își vede istoricul propriu de task-uri
app.get('/api/my-history', authenticate, async (req, res) => {
    const tasks = await Task.findAll({
        where: { assignedTo: req.user.id },
        include: [Project],
        order: [['updatedAt', 'DESC']]
    });
    res.json(tasks);
});

// Un manager consultă istoricul unui anumit executant
app.get('/api/manager/history/:executantId', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});
    
    const tasks = await Task.findAll({
        where: { assignedTo: req.params.executantId },
        include: [Project],
        order: [['updatedAt', 'DESC']]
    });
    res.json(tasks);
});

// Vezi toți utilizatorii (util pentru formularele de alocare)
app.get('/api/users', authenticate, async (req, res) => {
    const users = await User.findAll({ attributes: ['id', 'firstName', 'lastName', 'role', 'managerId'] });
    res.json(users);
});

// ================= RUTE AUTH STANDARD =================

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Date invalide.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user.id, role: user.role, name: user.firstName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Setup Admin inițial
app.post('/api/setup-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({ firstName: "Super", lastName: "Admin", email: "admin@test.com", password: hashedPassword, role: "admin" });
        res.json({ message: "Admin creat" });
    } catch (err) { res.status(400).json({ error: "Adminul există deja." }); }
});

// START SERVER
const PORT = process.env.PORT || 8080;
sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Baza de date sincronizată cu noile cerințe.');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});