const { DataTypes } = require('sequelize');

const sequelize = require('../config/sequelize');

const Ong_Usuario = sequelize.define('Ong_Usuario', {
  idOng_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  idOng: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tbl_Ong_Usuario',
  timestamps: false,
});

module.exports = Ong_Usuario;