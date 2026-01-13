// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./sequelize');

// --- IMPORTĂM MODELELE ---
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const TaskHistory = require('./models/TaskHistory');

app.use(cors());
app.use(express.json());

// --- DEFINIM RELAȚIILE AICI ---

// 1. Ierarhie Useri
User.hasMany(User, { as: 'Subordinates', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

// 2. Relația Manager - Proiect (Cine l-a creat)
// Îi spunem "ManagedProjects" ca să nu se confunde
User.hasMany(Project, { as: 'ManagedProjects', foreignKey: 'managerId' });
Project.belongsTo(User, { as: 'ProjectManager', foreignKey: 'managerId' });

// 3. Relația Membru - Proiect (Cine lucrează la el)
// Îi spunem "MemberProjects"
Project.belongsToMany(User, { through: 'ProjectMembers', as: 'Members' });
User.belongsToMany(Project, { through: 'ProjectMembers', as: 'MemberProjects' });

// 4. Task-uri
Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedTo' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assignedTo' });

Task.hasMany(TaskHistory, { foreignKey: 'taskId' });
TaskHistory.belongsTo(Task, { foreignKey: 'taskId' });

const PORT = 8080;
app.listen(PORT, async () => {
    console.log(`Serverul a pornit pe portul ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('✅ Conexiune la baza de date reușită!');
        
        await sequelize.sync({ alter: true });
        console.log('✅ Tabelele au fost sincronizate!');
    } catch (err) {
        console.error('❌ Eroare la baza de date:', err);
    }
});