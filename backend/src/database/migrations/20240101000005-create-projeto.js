'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Projeto', {
      idProjeto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idOng: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_Ong', key: 'idOng' },
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
