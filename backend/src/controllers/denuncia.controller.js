const { Denuncia, Area, Usuario } = require('../models');

const listDenuncias = async (req, res) => {
  try {
    const { idArea, statusDenuncia } = req.query;

    const where = {};
    if (idArea) where.idArea = idArea;
    if (statusDenuncia) where.statusDenuncia = statusDenuncia;

    const denuncias = await Denuncia.findAll({
      where,
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

const getDenuncia = async (req, res) => {
  try {
    const denuncia = await Denuncia.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome'] },
        { model: Area, as: 'area' },
      ],
    });

    if (!denuncia) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }

    return res.json({ denuncia });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar denúncia' });
  }
};

const createDenuncia = async (req, res) => {
  try {
    const { idArea, titulo, descricao, foto } = req.body;
    const idUsuario = req.user.idUsuario
    const dataDenuncia = new Date()
    const statusDenuncia = 'aberta'

    const area = await Area.findByPk(idArea);
    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    const denuncia = await Denuncia.create({ idUsuario, idArea, titulo, dataDenuncia, statusDenuncia, descricao, foto });

    return res.status(201).json({ denuncia });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar denúncia' });
  }
};

const updateDenuncia = async (req, res) => {
  try {
    const denuncia = await Denuncia.findByPk(req.params.id);

    if (!denuncia) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }

    await denuncia.update(req.body);

    return res.json({ denuncia });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar denúncia' });
  }
};

module.exports = { listDenuncias, getDenuncia, createDenuncia, updateDenuncia };
