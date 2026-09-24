'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Usuario', {
      idUsuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idNivel_Usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'tbl_Nivel_Usuario', key: 'idNivel_Usuario'},
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      cpf: {
        type: Sequelize.CHAR(11), 
        allowNull: true,
      },
      dataNasc: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Usuario');
  },
};
