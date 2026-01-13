const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        defaultValue: 'ACTIVE'
    }
}, {
    tableName: 'Projects'
});

module.exports = Project;