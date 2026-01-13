const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active'
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Project;