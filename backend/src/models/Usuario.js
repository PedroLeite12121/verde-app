const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');

const Usuario = sequelize.define('Usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: { isEmail: true },
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'tbl_Usuario',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    },
  },
});

Usuario.prototype.checkSenha = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

Usuario.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.senha;
  return values;
};

module.exports = Usuario;
