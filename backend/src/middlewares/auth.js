const jwt = require('jsonwebtoken');
const { Usuario, Nivel_Usuario } = require('../models');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const nivel = await Nivel_Usuario.findByPk(usuario.idNivel_Usuario);
    if (!nivel) {
      return res.status(403).json({ error: 'Nível de usuário não encontrado' });
    }

    req.user = usuario
    req.user.tipo = nivel.descricao 

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { authMiddleware };
