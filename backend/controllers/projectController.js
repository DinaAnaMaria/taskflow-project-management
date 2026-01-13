const Project = require('../models/Project');

// --- CREARE PROIECT ---
exports.createProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        
        // "req.user.id" vine de la Middleware (Paznicul)
        // El ne spune cine este userul care a trimis cererea
        const newProject = await Project.create({
            name,
            description,
            status,
            managerId: req.user.id 
        });

        res.status(201).json({ message: "Proiect creat!", project: newProject });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- VEZI PROIECTELE MELE ---
exports.getMyProjects = async (req, res) => {
    try {
        // Căutăm în tabelă doar proiectele create de acest user
        const projects = await Project.findAll({ where: { managerId: req.user.id } });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};