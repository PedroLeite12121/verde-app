'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tbl_Area', 'latitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('tbl_Area', 'longitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tbl_Area', 'longitude');
    await queryInterface.removeColumn('tbl_Area', 'latitude');
  },
};
