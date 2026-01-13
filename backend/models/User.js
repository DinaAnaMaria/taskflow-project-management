const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); 

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'executant'),
        defaultValue: 'executant',
        allowNull: false
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING
    }
});

module.exports = User;