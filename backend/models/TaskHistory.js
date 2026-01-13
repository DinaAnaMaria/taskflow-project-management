const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const TaskHistory = sequelize.define('TaskHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    action: {
        type: DataTypes.STRING, // Ex: "STATUS_CHANGED", "ASSIGNED"
        allowNull: false
    },
    details: {
        type: DataTypes.STRING // Ex: "Stare schimbata din OPEN in PENDING"
    }
}, {
    tableName: 'TaskHistories'
});

module.exports = TaskHistory;
