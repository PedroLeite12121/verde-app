const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging || false,
  dialectOptions: dbConfig.dialectOptions || {},
  define: {
    timestamps: false,
  },
});

module.exports = sequelize;
