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
    defaultValue: 'identificada',
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
}, {
  tableName: 'tbl_Area',
  timestamps: false,
});

module.exports = Area;
