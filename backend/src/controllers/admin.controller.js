const { Usuario, Area, Ong, Projeto, Denuncia, Nivel_Usuario } = require('../models');
const sequelize = require('../config/sequelize');

const dashboardStats = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Usuario.count({ where: {idNivel_Usuario: 3} });
    const totalComuns = await Usuario.count({ where: {idNivel_Usuario: 1} });
    const totalAreas = await Area.count();
    const totalONGs = await Ong.count();
    const totalProjetos = await Projeto.count();
    const totalDenuncias = await Denuncia.count();
    const denunciasAbertas = await Denuncia.count({ where: { statusDenuncia: 'aberta' } });

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
      include: [{ model: Nivel_Usuario, as: 'nivel', attributes: ['idNivel_Usuario', 'descricao'] }]
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
    const ongs = await Ong.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome', 'email'] }],
    });
    return res.json({ ongs });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar ONGs' });
  }
};

const listDenuncias = async (req, res) => {
  try {
    const denuncias = await Denuncia.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome'] },
        { model: Area, as: 'area', attributes: ['idArea', 'cidade', 'bairro', 'rua', 'latitude', 'longitude', 'raio', 'poligono', 'statusArea'] },
      ],
      order: [['idDenuncia', 'DESC']],
    });
    return res.json({ denuncias });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar denúncias' });
  }
};

const listProjetos = async (req, res) => {
  try{ 
    const projetos = await Projeto.findAll({
      include: [{ model: Ong, as: 'ong', attributes: ['idOng', 'nome', 'regiao'] }],
      order: [['idProjeto', 'DESC']],
    });
    return res.json({projetos})
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar projetos' });
  }
}

const approveONG = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const ong = await Ong.findByPk(req.params.id, { transaction: t });
    if (!ong) {
      await t.rollback();

      return res.status(404).json({ error: 'ONG não encontrada' });
    }

    await ong.update({ statusOng: 'aprovada' }, { transaction: t });
    await Usuario.update(
      { idNivel_Usuario: 2 },
      { where: { idUsuario: ong.idUsuario }, transaction: t }
    );

    await t.commit();

    return res.json({ ong });
  } catch (err) {
    await t.rollback();

    console.error(err);
    return res.status(500).json({ error: 'Erro ao aprovar ONG' });
  }
};

const rejectONG = async (req, res) => {
  try {
    const ong = await Ong.findByPk(req.params.id);
    if (!ong) return res.status(404).json({ error: 'ONG não encontrada' });

    if (ong.statusOng !== 'pendente') {
      return res.status(409).json({
        error: 'Apenas solicitações pendentes podem ser reprovadas.',
      });
    }

    await Ong.destroy({where: {idOng: req.params.id}})

    return res.json({ ong });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao reprovar ONG' });
  }
};

module.exports = { dashboardStats, listUsuarios, listAreas, listONGs, listDenuncias, listProjetos, approveONG, rejectONG };
