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
            isEmail: true // Validare extra pentru siguranță
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
            model: 'Users', // Se referă la aceeași tabelă
            key: 'id'
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true // Adaugă automat createdAt și updatedAt, util pentru istoric
});

// Definirea relației de subordonare (Manager has many Executanți)
//User.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
//User.hasMany(User, { as: 'subordinates', foreignKey: 'managerId' });

module.exports = User;