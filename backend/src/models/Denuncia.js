const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Denuncia = sequelize.define('Denuncia', {
  idDenuncia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idArea: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(35),
    allowNull: false,
  },
  dataDenuncia: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  statusDenuncia: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'aberta',
    validate: {
      isIn: [['aberta', 'em tratamento', 'resolvido']],
    },
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  foto: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'tbl_Denuncia',
  timestamps: false,
});

module.exports = Denuncia;
