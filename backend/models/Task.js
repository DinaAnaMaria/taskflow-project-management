const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 

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
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Task;