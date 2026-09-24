'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Projeto', {
      id_Projeto: {
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
      objetivo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      percentualConclusao: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Projeto');
  },
};
