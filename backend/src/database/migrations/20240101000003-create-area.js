'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Area', {
      idArea: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cidade: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      bairro: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      rua: {
        type: Sequelize.STRING(35),
        allowNull: false,
      },
      statusArea: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'identificada',
      },
      latitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      raio: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 180
      },
      poligono: {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE tbl_Area
      ADD CONSTRAINT chk_status_area
      CHECK (statusArea IN ('identificada', 'em tratamento', 'reflorestada'))
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Area');
  },
};
