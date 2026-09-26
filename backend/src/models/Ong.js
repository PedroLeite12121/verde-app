const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Ong = sequelize.define('Ong', {
  idOng: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  regiao: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.CHAR(14),
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  statusOng: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pendente',
    validate: {
      isIn: [['pendente', 'aprovada']],
    },
  },
}, {
  tableName: 'tbl_Ong',
  timestamps: false,
});

module.exports = Ong;
