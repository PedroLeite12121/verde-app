const { Area, Denuncias, Usuario } = require('../models');
const { geocodeAddress } = require('../services/geocode');

const listAreas = async (req, res) => {
  try {
    const { cidade, bairro, statusArea } = req.query;

    const where = {};
    if (cidade) where.cidade = cidade;
    if (bairro) where.bairro = bairro;
    if (statusArea) where.statusArea = statusArea;

    const areas = await Area.findAll({ where, order: [['idArea', 'DESC']] });

    return res.json({ areas });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar áreas' });
  }
};

const getArea = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    return res.json({ area });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar área' });
  }
};

const createArea = async (req, res) => {
  try {
    const { cidade, bairro, rua, statusArea, latitude, longitude } = req.body;

    const data = { cidade, bairro, rua, statusArea };

    const hasCoords =
      Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

    if (hasCoords) {
      data.latitude = Number(latitude);
      data.longitude = Number(longitude);
    } else {
      const coords = await geocodeAddress({ rua, bairro, cidade });
      if (coords) {
        data.latitude = coords.latitude;
        data.longitude = coords.longitude;
      }
    }

    const area = await Area.create(data);

    return res.status(201).json({ area });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar área' });
  }
};

const updateArea = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    await area.update(req.body);

    return res.json({ area });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar área' });
  }
};

const deleteArea = async (req, res) => {
  try {
    const area = await Area.findByPk(req.params.id);

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    await area.destroy();

    return res.json({ message: 'Área removida com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover área' });
  }
};

module.exports = { listAreas, getArea, createArea, updateArea, deleteArea };
