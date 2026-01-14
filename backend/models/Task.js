const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User'); // Importăm User pentru asocieri

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'PENDING', 'COMPLETED', 'CLOSED'),
        defaultValue: 'OPEN',
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // ID-ul managerului care a creat task-ul (Cerință: Managerul creează task-ul)
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // ID-ul executantului (Cerință: Un manager poate aloca task-ul unui utilizator)
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true // Esențial pentru "lista istorică de task-uri" (ordonare după dată)
});

// Definirea relațiilor
Task.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

module.exports = Task;