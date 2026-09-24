'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Ongs', {
      idOngs: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_Usuario', key: 'idUsuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      regiao: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.CHAR(14),
        allowNull: false,
      },
      telefone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      descricao: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Ongs');
  },
};
