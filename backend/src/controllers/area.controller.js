const { Area, Denuncia, Usuario } = require('../models');
const { geocodeAddress } = require('../services/geocode');

function parseRaio(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(Math.max(n, 20), 5000);
}

function parsePoligono(value) {
  if (value === undefined || value === null || value === '') return undefined;
  let arr = value;
  if (typeof value === 'string') {
    try {
      arr = JSON.parse(value);
    } catch {
      return null; // string inválida -> ignora
    }
  }
  if (!Array.isArray(arr) || arr.length < 3) return null;
  const clean = [];
  for (const p of arr) {
    if (!Array.isArray(p) || p.length < 2) return null;
    const lat = Number(p[0]);
    const lng = Number(p[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    clean.push([lat, lng]);
  }
  return JSON.stringify(clean);
}

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
    const { cidade, bairro, rua, statusArea, latitude, longitude, raio, poligono } = req.body;

    const data = { cidade, bairro, rua, statusArea };

    const raioNum = parseRaio(raio);
    if (raioNum !== undefined) data.raio = raioNum;

    const poli = parsePoligono(poligono);
    if (poli) data.poligono = poli;

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

    const body = { ...req.body };
    if ('raio' in body) {
      const r = parseRaio(body.raio);
      if (r === undefined) delete body.raio;
      else body.raio = r;
    }
    if ('poligono' in body) {
      const p = parsePoligono(body.poligono);
      // null = inválido ou vazio -> permite limpar com null/""
      if (body.poligono === null || body.poligono === '') body.poligono = null;
      else if (!p) delete body.poligono;
      else body.poligono = p;
    }

    await area.update(body);

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
