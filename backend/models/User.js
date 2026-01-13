const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false // Nu are voie să fie gol
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Nu pot exista doi useri cu același email
        validate: {
            isEmail: true // Verifică automat dacă e format de email
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'MANAGER', 'EXECUTANT'),
        defaultValue: 'EXECUTANT'
    }
}, {
    tableName: 'Users' // Numele tabelului în MySQL
});

module.exports = User;