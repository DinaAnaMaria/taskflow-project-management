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



// ================= RELAȚII BAZĂ DE DATE (VERSIUNEA FINALĂ FĂRĂ ERORI) =================

// 1. Relația ierarhică (Manager -> Subordonați)

User.hasMany(User, { as: 'subordinates', foreignKey: 'managerId' });

User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });



// 2. Relația Proiecte (Manager -> Proiecte)

User.hasMany(Project, { foreignKey: 'managerId' });

Project.belongsTo(User, { foreignKey: 'managerId' });



// 3. Relația Task-uri (Proiect -> Task-uri)

Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });

Task.belongsTo(Project, { foreignKey: 'projectId' });



// 4. Relația Execuție (Task -> Executant)

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



// ================= RUTA SETUP ADMIN (FIX) =================

// Folosim GET pentru a putea fi accesată direct din browser

app.get('/api/setup-admin', async (req, res) => {

    try {

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const [admin, created] = await User.findOrCreate({

            where: { email: "admin@test.com" },

            defaults: {

                firstName: "Super",

                lastName: "Admin",

                password: hashedPassword,

                role: "admin"

            }

        });



        if (created) {

            res.json({ message: "Admin creat cu succes! User: admin@test.com, Parola: admin123" });

        } else {

            res.json({ message: "Adminul exista deja in baza de date." });

        }

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});



// ================= RUTE PROIECTE =================

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



// ================= RUTE TASK-URI =================



app.post('/api/tasks', authenticate, async (req, res) => {
    // Verificăm dacă cel care face cererea este executant (ei nu au voie să creeze)
    if(req.user.role === 'executant') return res.status(403).json({error: 'Executanții nu pot crea task-uri'});
    
    try {
        // Luăm datele trimise din frontend (title, description, projectId)
        // Și adăugăm automat creatorId din token-ul managerului logat
        const task = await Task.create({ 
            title: req.body.title,
            description: req.body.description,
            projectId: req.body.projectId,
            creatorId: req.user.id, // ACESTA ESTE REZOLVAREA PENTRU EROARE
            status: 'OPEN' 
        });
        res.json(task);
    } catch (err) { 
        res.status(400).json({ error: err.message }); 
    }
});



app.put('/api/tasks/:id/assign', authenticate, async (req, res) => {

    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});

    try {

        const { assignedTo } = req.body;

        if (req.user.role === 'manager') {

            const targetUser = await User.findByPk(assignedTo);

            if (!targetUser || targetUser.managerId !== req.user.id) {

                return res.status(403).json({ error: 'Poți aloca task-uri doar subordonaților tăi!' });

            }

        }

        await Task.update(

            { assignedTo, status: 'PENDING' },

            { where: { id: req.params.id } }

        );

        res.json({ message: 'Task alocat, stare: PENDING' });

    } catch (err) { res.status(400).json({ error: err.message }); }

});



app.put('/api/tasks/:id/complete', authenticate, async (req, res) => {

    try {

        const task = await Task.findByPk(req.params.id);

        if (!task || task.assignedTo !== req.user.id) return res.status(403).json({error: 'Nu ești alocat pe acest task'});

        await task.update({ status: 'COMPLETED' });

        res.json({ message: 'Task realizat, stare: COMPLETED' });

    } catch (err) { res.status(400).json({ error: err.message }); }

});



app.put('/api/tasks/:id/close', authenticate, async (req, res) => {

    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});

    try {

        const task = await Task.findByPk(req.params.id);

        if (!task) return res.status(404).json({ error: 'Task negăsit' });

        if(task.status !== 'COMPLETED') return res.status(400).json({error: 'Task-ul trebuie să fie COMPLETED'});

        await task.update({ status: 'CLOSED' });

        res.json({ message: 'Task închis definitiv, stare: CLOSED' });

    } catch (err) { res.status(400).json({ error: err.message }); }

});



// ================= RUTE CONSULTARE =================



app.get('/api/users', authenticate, async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: ['id', 'firstName', 'lastName', 'role', 'managerId']

        });

        res.json(users);

    } catch (err) { res.status(500).json({ error: err.message }); }

});



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



app.post('/api/admin/create-user', authenticate, async (req, res) => {

    if(req.user.role !== 'admin') return res.status(403).json({error: 'Doar adminul poate crea utilizatori'});

    try {

        const { firstName, lastName, email, password, role, managerId } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword, role, managerId });

        res.json({ message: 'Utilizator creat cu succes', user: newUser });

    } catch (err) { res.status(400).json({ error: err.message }); }

});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    if(req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({error: 'Fără drepturi'});
    try {
        await Task.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Task șters cu succes' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// START SERVER

const PORT = process.env.PORT || 8080;

// Folosim alter: true pentru a nu sterge datele la fiecare restart

sequelize.sync({ alter: true }).then(() => {

    console.log('✅ Baza de date sincronizata.');

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

});

