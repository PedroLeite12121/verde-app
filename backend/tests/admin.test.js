const { app, request, getToken } = require('./helpers/http');
const { Ong, Usuario } = require('../src/models')
describe('Admin', () => {
  let adminToken;
  const testEmails = [];
  const testOngIds = [];

  beforeAll(async () => {
    adminToken = await getToken('admin@verde.com', '123456');
  });
  afterAll(async () => {
    for (const idOng of testOngIds) {
      await Ong.destroy({ where: { idOng } });
    }
    for (const email of testEmails) {
      await Usuario.destroy({ where: { email } });
    }
  });
  async function createPendingOng(email, cnpj) {
    const registration = await request(app).post('/api/auth/register').send({
      nome: 'Usuário de teste ONG',
      email,
      senha: '123456',
      cpf: null,
      dataNasc: null,
    });

    expect(registration.status).toBe(201);
    testEmails.push(email);

    const response = await request(app)
      .post('/api/ongs')
      .set('Authorization', `Bearer ${registration.body.token}`)
      .send({
        nome: 'ONG de teste administrativo',
        regiao: 'Cidade Tiradentes',
        cnpj,
        telefone: '11988887777',
        descricao: 'ONG para teste administrativo',
      });

    expect(response.status).toBe(201);
    testOngIds.push(response.body.ong.idOng);

    return { idOng: response.body.ong.idOng, token: registration.body.token };
  }

  describe('Acesso', () => {
    it('rejeita acesso sem token (401)', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('rejeita acesso de usuário comum (403)', async () => {
      const comumToken = await getToken('maria@verde.com', '123456');
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${comumToken}`);

      expect(res.status).toBe(403);
    });

    it('aceita acesso de admin (200)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
  describe('GET /api/admin/dashboard', () => {
    it('retorna estatísticas gerais', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { stats } = res.body;
      expect(stats.totalUsuarios).toBeGreaterThanOrEqual(3);
      expect(stats.totalAdmins).toBeGreaterThanOrEqual(1);
      expect(stats.totalComuns).toBeGreaterThanOrEqual(1);
      expect(stats.totalAreas).toBeGreaterThanOrEqual(1);
      expect(stats.totalONGs).toBeGreaterThanOrEqual(1);
      expect(stats.totalProjetos).toBeGreaterThanOrEqual(1);
      expect(stats.totalDenuncias).toBeGreaterThanOrEqual(1);
      expect(stats.denunciasAbertas).toBeGreaterThanOrEqual(0);
    });
  });

   describe('GET /api/admin/usuarios', () => {
    it('lista todos os usuários', async () => {
      const res = await request(app)
        .get('/api/admin/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.usuarios)).toBe(true);
      expect(res.body.usuarios.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('GET /api/admin/areas', () => {
    it('lista áreas com seus identificadores', async () => {
      const res = await request(app)
        .get('/api/admin/areas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.areas)).toBe(true);
      expect(res.body.areas.length).toBeGreaterThan(0);

      res.body.areas.forEach((area) => {
        expect(area).toHaveProperty('idArea');
      });
    });
  });

  describe('GET /api/admin/ongs', () => {
    it('lista todas as ONGs', async () => {
      const res = await request(app)
        .get('/api/admin/ongs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.ongs)).toBe(true);
      expect(res.body.ongs.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/admin/projetos', () => {
    it('lista todos os projetos com os dados da ONG', async () => {
      const res = await request(app)
        .get('/api/admin/projetos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.projetos)).toBe(true);
      expect(res.body.projetos.length).toBeGreaterThan(0);

      res.body.projetos.forEach((projeto) => {
        expect(projeto).toHaveProperty('idProjeto');
        expect(projeto).toHaveProperty('ong');
      });
    });
  });

  describe('GET /api/admin/denuncias', () => {
    it('lista todas as denúncias', async () => {
      const res = await request(app)
        .get('/api/admin/denuncias')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.denuncias)).toBe(true);
    });
  });

  describe('PUT /api/admin/ong/:id/approve', () => {
    it('aprova uma ONG pendente', async () => {
      const email = `admin-aprova-${Date.now()}@verde.com`;
      const pending = await createPendingOng(email, '80923561000100');

      const res = await request(app)
        .put(`/api/admin/ong/${pending.idOng}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ong.statusOng).toBe('aprovada');
    });
  });

  describe('DELETE /api/admin/ong/:id/approve', () => {
    it('rejeita e remove uma ONG pendente', async () => {
      const email = `admin-rejeita-${Date.now()}@verde.com`;
      const pending = await createPendingOng(email, '36218179000103');

      const res = await request(app)
        .delete(`/api/admin/ong/${pending.idOng}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ONG rejeitada e deletada com sucesso');

      const lookup = await request(app)
        .get(`/api/ongs/${pending.idOng}`)
        .set('Authorization', `Bearer ${pending.token}`);

      expect(lookup.status).toBe(404);
    });
  });
});