require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize'); 
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ================= RELAȚII BAZĂ DE DATE =================
User.hasMany(User, { as: 'subordinates', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });

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

// ================= RUTE PROIECTE (Lipseau și sunt necesare) =================
app.get('/api/projects', authenticate, async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{ model: Task }]
        });
        res.json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', authenticate, async (req, res) => {
    if (req.user.role === 'executant') return res.status(403).json({ error: 'Fără drepturi' });
    try {
        const project = await Project.create({ ...req.body, managerId: req.user.id });
        res.json(project);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ================= RUTE TASK-URI (FLUX COMPLET) =================

// 1. Managerul creează un task (Stare: OPEN)
app.post('/api/tasks', authenticate, async (req, res) => {
    if(req.user.role === 'executant') return res.status(403).json({error: 'Executanții nu pot crea task-uri'});
    try {
        const task = await Task.create({ ...req.body, status: 'OPEN' });
        res.json(task);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2. Managerul alocă task-ul (Stare: PENDING)
app.put('/api/tasks/:id/assign', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});
    try {
        const { assignedTo } = req.body;
        
        // Validare: Managerul poate aloca doar subordonaților lui
        if (req.user.role === 'manager') {
            const targetUser = await User.findByPk(assignedTo);
            if (!targetUser || targetUser.managerId !== req.user.id) {
                return res.status(403).json({ error: 'Poți aloca task-uri doar subordonaților tăi directi!' });
            }
        }

        await Task.update(
            { assignedTo, status: 'PENDING' }, 
            { where: { id: req.params.id } }
        );
        res.json({ message: 'Task alocat, stare: PENDING' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 3. Executantul marchează ca realizat (Stare: COMPLETED)
app.put('/api/tasks/:id/complete', authenticate, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task || task.assignedTo !== req.user.id) return res.status(403).json({error: 'Nu ești alocat pe acest task'});
        
        await task.update({ status: 'COMPLETED' });
        res.json({ message: 'Task realizat, stare: COMPLETED' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 4. Managerul închide task-ul (Stare: CLOSED)
app.put('/api/tasks/:id/close', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Doar un manager poate închide task-ul'});
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task negăsit' });
        if(task.status !== 'COMPLETED') return res.status(400).json({error: 'Task-ul trebuie să fie COMPLETED pentru a fi închis'});
        
        await task.update({ status: 'CLOSED' });
        res.json({ message: 'Task închis definitiv, stare: CLOSED' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ================= RUTE ISTORIC ȘI CONSULTARE =================

app.get('/api/my-tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { assignedTo: req.user.id },
            include: [{ model: Project }]
        });
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/my-history', authenticate, async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { assignedTo: req.user.id },
            include: [{ model: Project }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', authenticate, async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: ['id', 'firstName', 'lastName', 'role', 'managerId'] 
        });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
        
        res.json({ 
            token, 
            user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName } 
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Adminul poate adăuga utilizatori
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

// START SERVER
const PORT = process.env.PORT || 8080;
sequelize.sync({ force: true }).then(() => {
    console.log('✅ Server sincronizat cu Render și CleverCloud.');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});