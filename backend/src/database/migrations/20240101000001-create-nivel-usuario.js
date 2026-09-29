'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Nivel_Usuario', {
      idNivel_Usuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE tbl_Nivel_Usuario
      ADD CONSTRAINT chk_nivel_usuario
      CHECK (descricao IN ('comum', 'admin', 'ong'))
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Nivel_Usuario');
  },
};