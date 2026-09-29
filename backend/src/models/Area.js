const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Area = sequelize.define('Area', {
  idArea: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cidade: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  bairro: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  rua: {
    type: DataTypes.STRING(35),
    allowNull: false,
  },
  statusArea: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'identificada',
    validate: {
      isIn: [['identificada', 'em tratamento', 'reflorestada']],
    },
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  raio: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 180,
    comment: 'Raio de demarcação da área em metros (desenhado como círculo no mapa)',
  },
  poligono: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Polígono irregular em JSON: [[lat,lng],[lat,lng],...]',
  },
}, {
  tableName: 'tbl_Area',
  timestamps: false,
});

module.exports = Area;
