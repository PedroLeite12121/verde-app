const { Usuario, Admin, UsuarioComum, Area, Ongs, Projeto, Denuncias } = require('../models');

const dashboardStats = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Admin.count();
    const totalComuns = await UsuarioComum.count();
    const totalAreas = await Area.count();
    const totalONGs = await Ongs.count();
    const totalProjetos = await Projeto.count();
    const totalDenuncias = await Denuncias.count();
    const denunciasAbertas = await Denuncias.count({ where: { statusDenuncia: 'aberta' } });

    return res.json({
      stats: {
        totalUsuarios,
        totalAdmins,
        totalComuns,
        totalAreas,
        totalONGs,
        totalProjetos,
        totalDenuncias,
        denunciasAbertas,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

const listUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { model: Admin, as: 'admin' },
        { model: UsuarioComum, as: 'comum' },
      ],
    });

    return res.json({ usuarios });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

const listAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({ order: [['idArea', 'DESC']] });
    return res.json({ areas });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar áreas' });
  }
};

const listONGs = async (req, res) => {
  try {
    const ongs = await Ongs.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome', 'email'] }],
    });
    return res.json({ ongs });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar ONGs' });
  }
};

const listDenuncias = async (req, res) => {
  try {
    const denuncias = await Denuncias.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome'] },
        { model: Area, as: 'area', attributes: ['idArea', 'cidade', 'bairro', 'rua', 'latitude', 'longitude', 'raio', 'poligono', 'statusArea'] },
      ],
      order: [['idDenuncias', 'DESC']],
    });
    return res.json({ denuncias });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar denúncias' });
  }
};

module.exports = { dashboardStats, listUsuarios, listAreas, listONGs, listDenuncias };
