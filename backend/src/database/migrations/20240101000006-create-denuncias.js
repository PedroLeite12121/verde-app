'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Denuncias', {
      idDenuncias: {
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
      idArea: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_Area', key: 'idArea' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(35),
        allowNull: false,
      },
      dataDenuncia: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      statusDenuncia: {
        type: Sequelize.STRING(20),
        defaultValue: 'aberta',
      },
      descricao: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      foto: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Denuncias');
  },
};
