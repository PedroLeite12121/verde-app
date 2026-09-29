const jwt = require('jsonwebtoken');
const { Usuario, Nivel_Usuario } = require('../models');

const adminAuthMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Nivel_Usuario,
        as: 'nivel',
        attributes: ['idNivel_Usuario', 'descricao'],
      }],
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (usuario.nivel.descricao != 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    req.user = usuario;
    next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { adminAuthMiddleware };
