'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tbl_Area', 'raio', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 180,
    });
    await queryInterface.addColumn('tbl_Area', 'poligono', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tbl_Area', 'poligono');
    await queryInterface.removeColumn('tbl_Area', 'raio');
  },
};
