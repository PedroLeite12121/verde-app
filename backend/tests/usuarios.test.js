const { app, request, getToken } = require('./helpers/http');

describe('Usuários', () => {
  let comumToken;

  beforeAll(async () => {
    comumToken = await getToken('maria@verde.com', '123456');
  });

  describe('GET /api/usuarios/profile', () => {
    it('rejeita sem token (401)', async () => {
      const res = await request(app).get('/api/usuarios/profile');
      expect(res.status).toBe(401);
    });

    it('retorna perfil com token válido', async () => {
      const res = await request(app)
        .get('/api/usuarios/profile')
        .set('Authorization', `Bearer ${comumToken}`);

      expect(res.status).toBe(200);
      expect(res.body.usuario.email).toBe('maria@verde.com');
      expect(res.body.usuario.senha).toBeUndefined();
    });
  });

  describe('PUT /api/usuarios/profile', () => {
    it('atualiza o nome do usuário', async () => {
      const res = await request(app)
        .put('/api/usuarios/profile')
        .set('Authorization', `Bearer ${comumToken}`)
        .send({ nome: 'Maria Silva Teste' });

      expect(res.status).toBe(200);
      expect(res.body.usuario.nome).toBe('Maria Silva Teste');

      await request(app)
        .put('/api/usuarios/profile')
        .set('Authorization', `Bearer ${comumToken}`)
        .send({ nome: 'Maria Silva' });
    });

    it('rejeita sem token (401)', async () => {
      const res = await request(app).put('/api/usuarios/profile').send({ nome: 'X' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/usuarios/profile', () => {
    it('deleta a própria conta', async () => {
      const email = `deletar-${Date.now()}@verde.com`;
      const reg = await request(app).post('/api/auth/register').send({
        nome: 'Deletar Teste',
        email,
        senha: '123456',
      });
      const token = reg.body.token;

      const res = await request(app)
        .delete('/api/usuarios/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email, senha: '123456' });
      expect(login.status).toBe(401);
    });
  });
});