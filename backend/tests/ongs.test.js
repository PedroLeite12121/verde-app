const { app, request, getToken } = require('./helpers/http');
const { Ong, Usuario } = require('../src/models');

describe('ONGs', () => {
  let token;
  let createdId;
  let testEmail;
  let outroToken;
  let adminToken;

  beforeAll(async () => {
    adminToken = await getToken('admin@verde.com', '123456');

    testEmail = `ongs-teste-${Date.now()}@verde.com`;

    const res = await request(app).post('/api/auth/register').send({
      nome: 'Usuário Teste ONG',
      email: testEmail,
      senha: '123456',
      cpf: null,
      dataNasc: null,
    });

    outroToken = await getToken('joao@verde.com', '123456');

    expect(res.status).toBe(201);
    token = res.body.token;
  });

  afterAll(async () => {
    if (createdId) {
      await Ong.destroy({ where: { idOng: createdId } });
    }
    if (testEmail) {
      await Usuario.destroy({ where: { email: testEmail } });
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
      expect(res.body.ong.idOng).toBe(1);
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
          nome: 'ONG da Cidade Tiradentes',
          regiao: 'Cidade Tiradentes',
          cnpj: '80923561000100',
          telefone: '11988887777',
          descricao: 'ONG criada em teste automatizado',
        });

      expect(res.status).toBe(201);
      expect(res.body.ong.regiao).toBe('Cidade Tiradentes');
      expect(res.body.ong.idOng).toBeDefined();
      createdId = res.body.ong.idOng;

    });
  });

  describe('PUT /api/ongs/:id', () => {
    it('permite ao dono atualizar a própria ONG', async () => {
      const res = await request(app)
        .put(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ descricao: 'Descrição atualizada pelo teste' });

      expect(res.status).toBe(200);
      expect(res.body.ong.descricao).toBe('Descrição atualizada pelo teste');
    });
    it('impede outro usuário de atualizar a ONG', async () => {
      const res = await request(app)
        .put(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${outroToken}`)
        .send({ descricao: 'Alteração não autorizada' });

      expect(res.status).toBe(403);
    });
    it('permite que um administrador atualize a ONG', async () => {
      const res = await request(app)
        .put(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ descricao: 'Atualizada pelo administrador' });

      expect(res.status).toBe(200);
      expect(res.body.ong.descricao).toBe('Atualizada pelo administrador');
    });
  });
  describe('DELETE /api/ongs/:id', () => {
    it('impede outro usuário de deletar a ONG', async () => {
      const res = await request(app)
        .delete(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${outroToken}`);

      expect(res.status).toBe(403);
    });

    it('permite ao dono deletar a própria ONG', async () => {
      const res = await request(app)
        .delete(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ONG removida com sucesso');

      const busca = await request(app)
        .get(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(busca.status).toBe(404);
      createdId = null;
    });

    it('permite que um administrador delete uma ONG', async () => {
      const criada = await request(app)
        .post('/api/ongs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'ONG para teste de exclusão admin',
          regiao: 'Cidade Tiradentes',
          cnpj: '80923561000100',
          telefone: '11988887777',
          descricao: 'ONG criada para testar exclusão por administrador',
        });

      expect(criada.status).toBe(201);
      createdId = criada.body.ong.idOng;

      const res = await request(app)
        .delete(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ONG removida com sucesso');

      const busca = await request(app)
        .get(`/api/ongs/${createdId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(busca.status).toBe(404);
      createdId = null;
    });
  });
  describe('GET /api/ongs/following', () => {
    it('lista as ONGs seguidas pelo usuário', async () => {
      const path = '/api/ongs/1/follow';
      let followed = false;

      try {
        const follow = await request(app)
          .post(path)
          .set('Authorization', `Bearer ${token}`);

        followed = follow.status === 201;
        expect(follow.status).toBe(201);

        const res = await request(app)
          .get('/api/ongs/following')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.ongs)).toBe(true);
        expect(res.body.ongs.some((ong) => String(ong.idOng) === '1')).toBe(true);
      } finally {
        if (followed) {
          await request(app)
            .delete(path)
            .set('Authorization', `Bearer ${token}`);
        }
      }
    });
  });

  describe('POST /api/ongs/:id/follow', () => {
    it('segue uma ONG aprovada e rejeita uma tentativa duplicada', async () => {
      const path = '/api/ongs/1/follow';
      let followed = false;

      try {
        const res = await request(app)
          .post(path)
          .set('Authorization', `Bearer ${token}`);

        followed = res.status === 201;
        expect(res.status).toBe(201);
        expect(String(res.body.following.idOng)).toBe('1');

        const duplicate = await request(app)
          .post(path)
          .set('Authorization', `Bearer ${token}`);

        expect(duplicate.status).toBe(409);
      } finally {
        if (followed) {
          await request(app)
            .delete(path)
            .set('Authorization', `Bearer ${token}`);
        }
      }
    });
  });

  describe('DELETE /api/ongs/:id/follow', () => {
    it('deixa de seguir uma ONG e rejeita uma remoção duplicada', async () => {
      const path = '/api/ongs/1/follow';

      const follow = await request(app)
        .post(path)
        .set('Authorization', `Bearer ${token}`);

      expect(follow.status).toBe(201);

      const unfollow = await request(app)
        .delete(path)
        .set('Authorization', `Bearer ${token}`);

      expect(unfollow.status).toBe(200);

      const repeatUnfollow = await request(app)
        .delete(path)
        .set('Authorization', `Bearer ${token}`);

      expect(repeatUnfollow.status).toBe(409);
    });
  });
});