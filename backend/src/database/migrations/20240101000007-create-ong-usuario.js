'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Ong_Usuario', {
      idOng_Usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      idOng: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_Ong', key: 'idOng' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_Usuario', key: 'idUsuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    });
    await queryInterface.addConstraint('tbl_Ong_Usuario', {
      fields: ['idOng', 'idUsuario'],
      type: 'unique',
      name: 'uq_ong_usuario',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Ong_Usuario');
  },
};