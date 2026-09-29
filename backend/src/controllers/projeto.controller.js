const { Projeto, Ong } = require('../models');

const listProjetos = async (req, res) => {
  try {
    const projetos = await Projeto.findAll({
      include: [{ model: Ong, as: 'ong', attributes: ['idOng', 'nome', 'regiao'] }],
      order: [['idProjeto', 'DESC']],
    });

    return res.json({ projetos });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar projetos' });
  }
};

const getProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id, {
      include: [{ model: Ong, as: 'ong', attributes: ['idOng', 'nome', 'regiao'] }],
    });

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    return res.json({ projeto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
};

const createProjeto = async (req, res) => {
  try {
    

    const { objetivo, descricao } = req.body;
    const percentualConclusao = 0

    const ong = await Ong.findOne({
      where: {
        idUsuario: req.user.idUsuario,
        statusOng: 'aprovada',
      },
    });

    if (!ong) {
      return res.status(403).json({
        error: 'É necessário ter uma ONG aprovada para criar um projeto.',
      });
    }

    const idOng = ong.idOng

    const projeto = await Projeto.create({ idOng, objetivo, descricao, percentualConclusao });

    return res.status(201).json({ projeto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar projeto' });
  }
};

const updateProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const ong = await Ong.findOne({
      where: {
        idUsuario: req.user.idUsuario,
        statusOng: 'aprovada',
      },
    });

    if (!ong || projeto.idOng !== ong.idOng) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const { objetivo, descricao, percentualConclusao } = req.body;

    await projeto.update({
      ...(objetivo !== undefined && { objetivo }),
      ...(descricao !== undefined && { descricao }),
      ...(percentualConclusao !== undefined && { percentualConclusao }),
    });

    return res.json({ projeto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
};

const deleteProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const ong = await Ong.findOne({
      where: {
        idUsuario: req.user.idUsuario,
        statusOng: 'aprovada',
      },
    });

    if (!ong || projeto.idOng !== ong.idOng) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await projeto.destroy();

    return res.json({ message: 'Projeto removido com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover projeto' });
  }
};

module.exports = { listProjetos, getProjeto, createProjeto, updateProjeto, deleteProjeto };
