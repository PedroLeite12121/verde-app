const Usuario = require('./Usuario');

const Area = require('./Area');
const Ong = require('./Ong');
const Projeto = require('./Projeto');
const Denuncia = require('./Denuncia');
const Nivel_Usuario = require('./Nivel_Usuario')
const Ong_Usuario = require('./Ong_Usuario')

Nivel_Usuario.hasMany(Usuario, { foreignKey: 'idNivel_Usuario', as: 'usuarios' });
Usuario.belongsTo(Nivel_Usuario, { foreignKey: 'idNivel_Usuario', as: 'nivel' });

Usuario.hasOne(Ong, { foreignKey: 'idUsuario', as: 'ong' });
Ong.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Ong.hasMany(Projeto, { foreignKey: 'idOng', as: 'projetos' });
Projeto.belongsTo(Ong, { foreignKey: 'idOng', as: 'ong' });

Usuario.hasMany(Denuncia, { foreignKey: 'idUsuario', as: 'denuncias' });
Denuncia.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

Area.hasMany(Denuncia, { foreignKey: 'idArea', as: 'denuncias' });
Denuncia.belongsTo(Area, { foreignKey: 'idArea', as: 'area' });

Ong.belongsToMany(Usuario, { through: Ong_Usuario, foreignKey: 'idOng', otherKey: 'idUsuario', as: 'seguidores' });

Usuario.belongsToMany(Ong, { through: Ong_Usuario, foreignKey: 'idUsuario', otherKey: 'idOng', as: 'ongsSeguidas' });

Ong.hasMany(Ong_Usuario, { foreignKey: 'idOng', as: 'seguimentos'});
Ong_Usuario.belongsTo(Ong, { foreignKey: 'idOng', as: 'ong' });
Usuario.hasMany(Ong_Usuario, { foreignKey: 'idUsuario', as: 'seguimentos' });
Ong_Usuario.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

module.exports = { Usuario, Area, Ong, Projeto, Denuncia, Nivel_Usuario, Ong_Usuario };
