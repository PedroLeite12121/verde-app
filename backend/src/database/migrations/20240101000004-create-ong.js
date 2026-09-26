'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_Ong', {
      idOng: {
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
      nome: {
        type: Sequelize.STRING(50),
        allowNull: false,
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
      statusOng: {
        type: Sequelize.STRING(50),
        defaultValue: 'pendente',
        allowNull: true,        
      }
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE tbl_Ong
      ADD CONSTRAINT chk_status_ong
      CHECK (statusOng IN ('pendente', 'aprovada'))
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_Ong');
  },
};
