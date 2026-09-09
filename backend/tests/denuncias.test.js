const { app, request, getToken } = require('./helpers/http');
const { Denuncias } = require('../src/models');

describe('Denúncias', () => {
  let token;
  let denunciaId;

  beforeAll(async () => {
    token = await getToken('joao@verde.com', '123456');
  });

  afterAll(async () => {
    if (denunciaId) {
      await Denuncias.destroy({ where: { idDenuncias: denunciaId } });
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
      res.body.denuncias.forEach((d) => expect(d.statusDenuncia).toBe('aberta'));
    });

    it('filtra por idArea', async () => {
      const res = await request(app)
        .get('/api/denuncias?idArea=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      res.body.denuncias.forEach((d) => expect(d.idArea).toBe(1));
    });
  });

  describe('GET /api/denuncias/:id', () => {
    it('busca uma denúncia existente', async () => {
      const res = await request(app)
        .get('/api/denuncias/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.denuncia.idDenuncias).toBe(1);
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
      expect(res.body.denuncia.titulo).toBe('Denúncia de teste');
      expect(res.body.denuncia.statusDenuncia).toBe('aberta');
      expect(res.body.denuncia.idDenuncias).toBeDefined();
      denunciaId = res.body.denuncia.idDenuncias;
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
      const id = denunciaId || 1;
      const res = await request(app)
        .put(`/api/denuncias/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statusDenuncia: 'em tratamento' });

      expect(res.status).toBe(200);
      expect(res.body.denuncia.statusDenuncia).toBe('em tratamento');
    });
  });
});