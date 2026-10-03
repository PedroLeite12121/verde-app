const { app, request, getToken } = require('./helpers/http');
const { Denuncia } = require('../src/models');

describe('Denúncias', () => {
  let token;
  let denunciaId;
  let deleteDenunciaId;

  beforeAll(async () => {
    token = await getToken('joao@verde.com', '123456');
  });

  afterAll(async () => {
    if (denunciaId) {
      await Denuncia.destroy({ where: { idDenuncia: denunciaId } });
    }

    if (deleteDenunciaId) {
      await Denuncia.destroy({ where: { idDenuncia: deleteDenunciaId } });
    }
  });

  describe('GET /api/denuncias', () => {
    it('rejeita sem token (401)', async () => {
      const res = await request(app).get('/api/denuncias');
      expect(res.status).toBe(401);
    });

    it('lista as denúncias', async () => {
      const res = await request(app)
        .get('/api/denuncias')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncias.length).toBeGreaterThanOrEqual(1);
    });

    it('filtra por statusDenuncia', async () => {
      const res = await request(app)
        .get('/api/denuncias?statusDenuncia=aberta')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncias.length).toBeGreaterThan(0);
      res.body.denuncias.forEach((d) => expect(d.statusDenuncia).toBe('aberta'));
    });

    it('filtra por idArea', async () => {
      const res = await request(app)
        .get('/api/denuncias?idArea=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncias.length).toBeGreaterThan(0);
      res.body.denuncias.forEach((d) => expect(d.idArea).toBe(1));
    });
  });

  describe('GET /api/denuncias/:id', () => {
    it('busca uma denúncia existente', async () => {
      const res = await request(app)
        .get('/api/denuncias/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncia.idDenuncia).toBe(1);
    });

    it('retorna 404 para denúncia inexistente', async () => {
      const res = await request(app)
        .get('/api/denuncias/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/denuncias', () => {
    it('cria uma denúncia em área existente', async () => {
      const res = await request(app)
        .post('/api/denuncias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          idArea: 1,
          titulo: 'Denúncia de teste',
          descricao: 'Área degradada próxima à Estrada do Iguatemi',
        });

      expect(res.status).toBe(201);
      denunciaId = res.body.denuncia.idDenuncia;

      expect(res.body.denuncia.titulo).toBe('Denúncia de teste');
      expect(res.body.denuncia.statusDenuncia).toBe('aberta');
      expect(res.body.denuncia.idDenuncia).toBeDefined();
      
    });

    it('retorna 404 ao criar denúncia em área inexistente', async () => {
      const res = await request(app)
        .post('/api/denuncias')
        .set('Authorization', `Bearer ${token}`)
        .send({ idArea: 999999, titulo: 'Inexistente', descricao: 'x' });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/denuncias/:id', () => {
    it('atualiza o status da denúncia', async () => {
      expect(denunciaId).toBeDefined();

      const res = await request(app)
        .put(`/api/denuncias/${denunciaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statusDenuncia: 'em tratamento' });

      expect(res.status).toBe(200);
      expect(res.body.denuncia.statusDenuncia).toBe('em tratamento');
    });
  });

  describe('DELETE /api/denuncias/:id', () => {
    it('remove uma denúncia existente', async () => {
      const criada = await request(app)
        .post('/api/denuncias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          idArea: 1,
          titulo: 'Denúncia para exclusão',
          descricao: 'Teste da rota de exclusão',
        });

      expect(criada.status).toBe(201);
      deleteDenunciaId = criada.body.denuncia.idDenuncia;
      expect(deleteDenunciaId).toBeDefined();

      const res = await request(app)
        .delete(`/api/denuncias/${deleteDenunciaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Denúncia removida com sucesso');

      const busca = await request(app)
        .get(`/api/denuncias/${deleteDenunciaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(busca.status).toBe(404);
    });
  });
});