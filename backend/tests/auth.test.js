const { app, request } = require('./helpers/http');

describe('Auth', () => {
  describe('POST /api/auth/login', () => {
    it('loga com admin e retorna token + tipo admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@verde.com', senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.tipo).toBe('admin');
      expect(res.body.usuario.email).toBe('admin@verde.com');
      expect(res.body.usuario.senha).toBeUndefined();
    });

    it('loga com usuário comum e retorna tipo comum', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'maria@verde.com', senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.tipo).toBe('comum');
      expect(res.body.usuario.email).toBe('maria@verde.com');
    });

    it('rejeita senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@verde.com', senha: 'senha-errada' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('rejeita email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nao-existe@verde.com', senha: '123456' });

      expect(res.status).toBe(401);
    });

    it('rejeita body inválido (regra de validação)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'email-invalido', senha: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/register', () => {
    const email = `teste-${Date.now()}@verde.com`;

    it('cria um usuário comum', async () => {
      const res = await request(app).post('/api/auth/register').send({
        nome: 'Usuário Teste',
        email,
        senha: '123456',
        cpf: '11122233344',
        dataNasc: '1998-01-01',
      });

      expect(res.status).toBe(201);
      expect(res.body.usuario.email).toBe(email);
      expect(res.body.usuario.senha).toBeUndefined();
      expect(res.body.token).toBeDefined();
    });

    it('o novo usuário consegue fazer login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.tipo).toBe('comum');
    });

    it('rejeita email duplicado', async () => {
      const res = await request(app).post('/api/auth/register').send({
        nome: 'Outro Teste',
        email,
        senha: '123456',
      });

      expect(res.status).toBe(409);
    });

    it('rejeita cadastro sem os campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Sem Email' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});