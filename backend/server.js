require('dotenv').config(); // <--- OBLIGATORIU: Prima linie!
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

// ================= CONFIGURARE EMAIL (Securizată) =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // <--- Citește din .env
        pass: process.env.EMAIL_PASS  // <--- Citește din .env
    }
});

// Stocare temporară token-uri resetare
const resetTokens = {}; 

// ================= RELAȚII BAZĂ DE DATE =================
User.hasMany(Project, { foreignKey: 'managerId' });
Project.belongsTo(User, { foreignKey: 'managerId' });
Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
User.hasMany(Task, { foreignKey: 'assignedTo' }); 
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'executor' }); 


// ================= MIDDLEWARE (Securizat) =================
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acces interzis!' });

    // Folosim cheia secretă din .env
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalid.' });
        req.user = user;
        next();
    });
};

// ================= RUTE AUTH =================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email existent!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ firstName, lastName, email, password: hashedPassword, role: 'manager' });

        res.json({ message: 'Cont creat!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Email inexistent.' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Parolă greșită.' });

        // Generăm token folosind cheia din .env
        const token = jwt.sign(
            { id: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user.id, role: user.role, name: user.firstName } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- FORGOT PASSWORD ---
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Email-ul nu există.' });

        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        resetTokens[token] = user.id;

        // URL Local (modifici doar când urci pe net)
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        const mailOptions = {
            from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Resetare Parolă',
            html: `<p>Click aici pentru resetare: <a href="${resetLink}">Resetare Parolă</a></p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email trimis!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Eroare trimitere email.' });
    }
});

// --- RESET PASSWORD ---
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const userId = resetTokens[token];
        if (!userId) return res.status(400).json({ error: 'Link invalid.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id: userId } });
        delete resetTokens[token];

        res.json({ message: 'Parolă schimbată!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= RUTE STANDARD (Prescurtate pentru claritate - sunt aceleași) =================
// Setup Admin
app.post('/api/setup-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({ firstName: "Super", lastName: "Admin", email: "admin@test.com", password: hashedPassword, role: "admin" });
        res.json({ message: "Admin creat" });
    } catch (err) { res.status(400).json({ error: "Adminul există deja." }); }
});

app.get('/api/users', authenticate, async (req, res) => { const users = await User.findAll(); res.json(users); });
app.post('/api/admin/create-user', authenticate, async (req, res) => { 
    if(req.user.role!=='admin') return res.status(403).json({error:'Fără drepturi'});
    const {firstName,lastName,email,password,role} = req.body;
    const h = await bcrypt.hash(password,10);
    await User.create({firstName,lastName,email,password:h,role});
    res.json({message:'User creat'});
});
app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
    if(req.user.role!=='admin') return res.status(403).json({error:'Fără drepturi'});
    await Task.update({assignedTo:null, status:'OPEN'}, {where:{assignedTo:req.params.id}});
    await User.destroy({where:{id:req.params.id}});
    res.json({message:'User șters'});
});

app.get('/api/projects', authenticate, async (req, res) => { const projects = await Project.findAll({include: Task}); res.json(projects); });
app.post('/api/projects', authenticate, async (req, res) => { 
    if(req.user.role==='executant') return res.status(403).json({error:'Fără drepturi'});
    const p = await Project.create({...req.body, managerId:req.user.id}); res.json(p);
});
app.delete('/api/projects/:id', authenticate, async (req, res) => {
    if(req.user.role==='executant') return res.status(403).json({error:'Fără drepturi'});
    await Task.destroy({where:{projectId:req.params.id}});
    await Project.destroy({where:{id:req.params.id}});
    res.json({message:'Proiect șters'});
});

app.get('/api/my-tasks', authenticate, async (req, res) => {
    const tasks = await Task.findAll({where:{assignedTo:req.user.id}, include:[{model:Project, attributes:['name']}], order:[['updatedAt','DESC']]});
    res.json(tasks);
});
app.get('/api/tasks/project/:projectId', authenticate, async (req, res) => {
    const tasks = await Task.findAll({where:{projectId:req.params.projectId}, include:[{model:User, as:'executor', attributes:['firstName','lastName']}]});
    res.json(tasks);
});
app.post('/api/tasks', authenticate, async (req, res) => {
    if(req.user.role==='executant') return res.status(403).json({error:'Fără drepturi'});
    const t = await Task.create({...req.body, status:'OPEN'}); res.json(t);
});
app.put('/api/tasks/:id/assign', authenticate, async (req, res) => { await Task.update({assignedTo:req.body.assignedTo, status:'PENDING'}, {where:{id:req.params.id}}); res.json({message:'Alocat'}); });
app.put('/api/tasks/:id/complete', authenticate, async (req, res) => { await Task.update({status:'COMPLETED'}, {where:{id:req.params.id}}); res.json({message:'Finalizat'}); });
app.put('/api/tasks/:id/close', authenticate, async (req, res) => { await Task.update({status:'CLOSED'}, {where:{id:req.params.id}}); res.json({message:'Închis'}); });

// START SERVER (Folosind PORT din .env)
const PORT = process.env.PORT || 8080;
sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Baza de date sincronizată.');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});