require('dotenv').config();

const buildUrl = ({ database, host, port, user, pass }) =>
  `mysql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}`;

module.exports = {
  development: {
    url:
      process.env.DATABASE_URL ||
      buildUrl({
        database: process.env.DB_NAME || 'dbDadosVerde',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASSWORD || '',
      }),
    dialect: 'mysql',
    logging: console.log,
  },
  test: {
    url:
      process.env.DATABASE_URL_TEST ||
      buildUrl({
        database: 'verde_db_test',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASSWORD || '',
      }),
    dialect: 'mysql',
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
