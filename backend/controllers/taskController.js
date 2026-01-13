const Task = require('../models/Task');
const Project = require('../models/Project');

// --- CREARE TASK ---
exports.createTask = async (req, res) => {
    try {
        // Avem nevoie de ID-ul proiectului ca să știm unde punem task-ul
        const { title, description, status, priority, projectId, assignedTo } = req.body;

        // Verificăm dacă proiectul există
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: "Proiectul nu a fost găsit!" });
        }

        const newTask = await Task.create({
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            projectId,
            assignedTo // ID-ul userului care va face treaba (poate fi null la început)
        });

        res.status(201).json({ message: "Task creat!", task: newTask });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- VEZI TASK-URILE UNUI PROIECT ---
exports.getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params; // Luăm ID-ul din URL

        const tasks = await Task.findAll({ where: { projectId } });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};