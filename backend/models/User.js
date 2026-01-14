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
        unique: true,
        validate: {
            isEmail: true
        }
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
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true 
});

// Dacă vrei să activezi relațiile, folosește-le așa (asigură-te că sunt definite după model):
// User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
// User.hasMany(User, { as: 'subordinates', foreignKey: 'managerId' });

module.exports = User;