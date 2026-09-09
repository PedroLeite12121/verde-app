const { app, request, getToken } = require('./helpers/http');
const { Projeto } = require('../src/models');

describe('Projetos', () => {
  const email = `dona-projeto-${Date.now()}@verde.com`;
  let donoToken;
  let outroToken;
  let projetoId;

  beforeAll(async () => {
    donoToken = await getToken('maria@verde.com', '123456');
    outroToken = await getToken('joao@verde.com', '123456');

    const criado = await request(app)
      .post('/api/projetos')
      .set('Authorization', `Bearer ${donoToken}`)
      .send({ objetivo: 'Projeto de teste', descricao: 'Descrição do projeto de teste' });
    projetoId = criado.body.projeto.id_Projeto;
  });

  afterAll(async () => {
    if (projetoId) {
      await Projeto.destroy({ where: { id_Projeto: projetoId } });
    }
  });

  describe('GET /api/projetos', () => {
    it('rejeita sem token (401)', async () => {
      const res = await request(app).get('/api/projetos');
      expect(res.status).toBe(401);
    });

    it('lista apenas os projetos do usuário logado', async () => {
      const res = await request(app)
        .get('/api/projetos')
        .set('Authorization', `Bearer ${donoToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.projetos)).toBe(true);
      res.body.projetos.forEach((p) => expect(p.idUsuario).toBe(2));
    });
  });

  describe('GET /api/projetos/:id', () => {
    it('busca um projeto', async () => {
      const res = await request(app)
        .get(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${donoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projeto.id_Projeto).toBe(projetoId);
    });

    it('retorna 404 para projeto inexistente', async () => {
      const res = await request(app)
        .get('/api/projetos/999999')
        .set('Authorization', `Bearer ${donoToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/projetos', () => {
    it('cria um projeto com percentual 0', async () => {
      const res = await request(app)
        .post('/api/projetos')
        .set('Authorization', `Bearer ${donoToken}`)
        .send({ objetivo: 'Plantio em área da Cidade Tiradentes', descricao: 'Novo mutirão' });

      expect(res.status).toBe(201);
      expect(res.body.projeto.percentualConclusao).toBe(0);

      await Projeto.destroy({ where: { id_Projeto: res.body.projeto.id_Projeto } });
    });
  });

  describe('PUT /api/projetos/:id', () => {
    it('o dono atualiza o próprio projeto', async () => {
      const res = await request(app)
        .put(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${donoToken}`)
        .send({ percentualConclusao: 45 });

      expect(res.status).toBe(200);
      expect(res.body.projeto.percentualConclusao).toBe(45);
    });

    it('outro usuário não pode atualizar (403)', async () => {
      const res = await request(app)
        .put(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${outroToken}`)
        .send({ percentualConclusao: 99 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projetos/:id', () => {
    it('outro usuário não pode deletar (403)', async () => {
      const res = await request(app)
        .delete(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${outroToken}`);

      expect(res.status).toBe(403);
    });

    it('o dono deleta o próprio projeto', async () => {
      const res = await request(app)
        .delete(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${donoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();

      const busca = await request(app)
        .get(`/api/projetos/${projetoId}`)
        .set('Authorization', `Bearer ${donoToken}`);
      expect(busca.status).toBe(404);
    });
  });
});