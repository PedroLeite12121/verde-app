const { app, request, getToken } = require('./helpers/http');
const { Ongs } = require('../src/models');

describe('ONGs', () => {
  let token;
  let createdId;

  beforeAll(async () => {
    token = await getToken('maria@verde.com', '123456');
  });

  afterAll(async () => {
    if (createdId) {
      await Ongs.destroy({ where: { idOngs: createdId } });
    }
  });

  describe('GET /api/ongs', () => {
    it('rejeita sem token (401)', async () => {
      const res = await request(app).get('/api/ongs');
      expect(res.status).toBe(401);
    });

    it('lista as ONGs', async () => {
      const res = await request(app)
        .get('/api/ongs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ongs.length).toBeGreaterThanOrEqual(1);
    });

    it('filtra por região Cidade Tiradentes', async () => {
      const res = await request(app)
        .get('/api/ongs?regiao=Cidade Tiradentes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ongs.length).toBeGreaterThanOrEqual(1);
      res.body.ongs.forEach((ong) => expect(ong.regiao).toBe('Cidade Tiradentes'));
    });
  });

  describe('GET /api/ongs/:id', () => {
    it('busca uma ONG pelo id', async () => {
      const res = await request(app)
        .get('/api/ongs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ong.idOngs).toBe(1);
    });

    it('retorna 404 para ONG inexistente', async () => {
      const res = await request(app)
        .get('/api/ongs/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/ongs', () => {
    it('cria uma ONG na região Cidade Tiradentes', async () => {
      const res = await request(app)
        .post('/api/ongs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          regiao: 'Cidade Tiradentes',
          cnpj: '99999999000199',
          telefone: '(11) 98888-7777',
          descricao: 'ONG criada em teste automatizado',
        });

      expect(res.status).toBe(201);
      expect(res.body.ong.regiao).toBe('Cidade Tiradentes');
      expect(res.body.ong.idOngs).toBeDefined();
      createdId = res.body.ong.idOngs;
    });
  });
});