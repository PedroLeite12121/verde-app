const jwt = require('jsonwebtoken');
const { Usuario, Nivel_Usuario } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const isValidCPF = (value) => {
  const cpf = String(value ?? '').replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (digits, weight) => {
    const sum = digits
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return cpf.endsWith(`${firstDigit}${secondDigit}`);
};

const isValidBirthDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900) {
    return false
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  const today = new Date().toISOString().slice(0, 10);

  return isRealDate && value <= today;
};

const register = async (req, res) => {
  try {
    const { nome, email, senha, cpf, dataNasc } = req.body;
    const idNivel_Usuario = 1
    const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : '';
    const birthDate = dataNasc ? String(dataNasc).trim() : '';

    if (cpfDigits && !isValidCPF(cpfDigits)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    if (birthDate && !isValidBirthDate(birthDate)) {
      return res.status(400).json({
        error: 'Data de nascimento inválida. Use o formato AAAA-MM-DD e informe uma data real.',
      });
    }

    const existing = await Usuario.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const usuario = await Usuario.create({ idNivel_Usuario, nome, email, senha, cpf: cpfDigits, dataNasc: birthDate });

    const token = generateToken(usuario.idUsuario);

    return res.status(201).json({ usuario, token, tipo: 'comum' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Nivel_Usuario, as: 'nivel', attributes: ['descricao'] }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await usuario.checkSenha(senha);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const tipo = usuario.nivel.descricao

    const token = generateToken(usuario.idUsuario);

    return res.json({ usuario, tipo, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

module.exports = { register, login };
