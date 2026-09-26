const { Ong, Usuario, Ong_Usuario } = require('../models');
const { Op } = require('sequelize');

const validDDDs = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
]);

function isValidPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (![10, 11].includes(digits.length) || !validDDDs.has(digits.slice(0, 2))) {
    return false;
  }

  const subscriber = digits.slice(2);

  return digits.length === 11
    ? subscriber.startsWith('9')
    : /^[2-5]/.test(subscriber);
}

function isValidCNPJ(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (base, weights) => {
    const sum = base
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(
    digits.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  const secondDigit = calculateDigit(
    digits.slice(0, 12) + firstDigit,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}
const listONGs = async (req, res) => {
  try {
    const { regiao, statusOng } = req.query;

    const where = {};
    if (regiao) where.regiao = regiao;
    if (statusOng) where.statusOng = statusOng;
    
    const ongs = await Ong.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome', 'email'] }],
      order: [['idOng', 'DESC']],
    });

    return res.json({ ongs });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar ONGs' });
  }
};

const getONG = async (req, res) => {
  try {
    const ong = await Ong.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome', 'email'] }],
    });

    if (!ong) {
      return res.status(404).json({ error: 'ONG não encontrada' });
    }

    return res.json({ ong });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar ONG' });
  }
};

const createONG = async (req, res) => {
  try {
    const { nome,regiao, cnpj, telefone, descricao } = req.body;
    const idUsuario = req.user.idUsuario
    const statusOng = 'pendente'

    if (req.user.tipo === 'admin') {
      return res.status(403).json({
        error: 'Administradores não podem cadastrar ONGs.',
      });
    }

    const existing = await Ong.findOne({
      where: {
        idUsuario: req.user.idUsuario,
        statusOng: { [Op.in]: ['pendente', 'aprovada'] },
      },
    });
    
    if (existing) {
      return res.status(409).json({ error: 'ONG já inserida no sistema' });
    }

    const cnpjDigits = cnpj.replace(/\D/g, '');
    const telefoneDigits = telefone.replace(/\D/g, '');

    if (!isValidCNPJ(cnpjDigits)) { return res.status(400).json({ error: 'CNPJ inválido.' }) }

    if (!isValidPhone(telefoneDigits)) { return res.status(400).json({ error: 'Telefone inválido.' }) }

    const ong = await Ong.create({ idUsuario, nome, regiao, cnpj, telefone, descricao, statusOng });

    return res.status(201).json({ ong });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar ONG' });
  }
};

const followONG = async (req, res) => {
  try {
    const { id } = req.params;

    const ong = await Ong.findByPk(id);

    if (!ong) {
      return res.status(404).json({ error: 'ONG não encontrada' });
    }

    if (ong.statusOng !== 'aprovada') {
      return res.status(400).json({
        error: 'Só é possível seguir ONGs aprovadas',
      });
    }

    const existing = await Ong_Usuario.findOne({
      where: {
        idOng: id,
        idUsuario: req.user.idUsuario,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Você já segue esta ONG',
      });
    }

    const following = await Ong_Usuario.create({
      idOng: id,
      idUsuario: req.user.idUsuario,
    });

    return res.status(201).json({ following });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao seguir ONG' });
  }
};

const unfollowONG = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Ong_Usuario.destroy({
      where: {
        idOng: id,
        idUsuario: req.user.idUsuario,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        error: 'Você não segue esta ONG',
      });
    }

    return res.json({ message: 'Você deixou de seguir a ONG' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao deixar de seguir ONG' });
  }
};

const listFollowingONGs = async (req, res) => {
  try {
    const following = await Ong_Usuario.findAll({
      where: {
        idUsuario: req.user.idUsuario,
      },
      include: [{model: Ong, as: 'ong', where: { statusOng: 'aprovada',},
          include: [
            {model: Usuario, as: 'usuario', attributes: ['idUsuario', 'nome', 'email']},
          ],
        }],
      order: [['idOng_Usuario', 'DESC']],
    });

    return res.json({
      ongs: following.map((item) => item.ong),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: 'Erro ao listar ONGs seguidas'});
  }
};

module.exports = { listONGs, getONG, createONG, followONG, unfollowONG, listFollowingONGs };
