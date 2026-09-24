const Usuario = require('./Usuario');

const Area = require('./Area');
const Ongs = require('./Ongs');
const Projeto = require('./Projeto');
const Denuncias = require('./Denuncias');
const Nivel_Usuario = require('./Nivel_Usuario')

Nivel_Usuario.hasMany(Usuario, { foreignKey: 'idNivel_Usuario', as: 'usuarios' });
Usuario.belongsTo(Nivel_Usuario, { foreignKey: 'idNivel_Usuario', as: 'nivel' });

Usuario.hasOne(Ongs, { foreignKey: 'idUsuario', as: 'ong' });
Ongs.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Usuario.hasMany(Projeto, { foreignKey: 'idUsuario', as: 'projetos' });
Projeto.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Usuario.hasMany(Denuncias, { foreignKey: 'idUsuario', as: 'denuncias' });
Denuncias.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Area.hasMany(Denuncias, { foreignKey: 'idArea', as: 'denuncias' });
Denuncias.belongsTo(Area, { foreignKey: 'idArea', as: 'area' });

module.exports = { Usuario, Area, Ongs, Projeto, Denuncias, Nivel_Usuario };
