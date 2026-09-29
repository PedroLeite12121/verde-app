const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Projeto = sequelize.define('Projeto', {
  idProjeto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idOng: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  objetivo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  percentualConclusao: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  tableName: 'tbl_Projeto',
  timestamps: false,
});

module.exports = Projeto;
