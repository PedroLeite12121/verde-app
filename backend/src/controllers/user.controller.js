const { Usuario, Nivel_Usuario } = require('../models');

const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.idUsuario, {
      include: [{ model: Nivel_Usuario, as: 'nivel', attributes: ['idNivel_Usuario', 'descricao'] }],
    });

    return res.json({ usuario });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nome, email } = req.body;
    const updates = {};
    if (nome) updates.nome = nome;
    if (email) updates.email = email;

    await Usuario.update(updates, { where: { idUsuario: req.user.idUsuario } });

    const usuario = await Usuario.findByPk(req.user.idUsuario);

    return res.json({ usuario });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await Usuario.destroy({ where: { idUsuario: req.user.idUsuario } });
    return res.json({ message: 'Conta removida com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover conta' });
  }
};

module.exports = { getProfile, updateProfile, deleteAccount };
