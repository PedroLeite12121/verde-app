const { app, request, getToken } = require('./helpers/http');

describe('Admin', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await getToken('admin@verde.com', '123456');
  });

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
      expect(stats.totalComuns).toBeGreaterThanOrEqual(2);
      expect(stats.totalAreas).toBeGreaterThanOrEqual(1);
      expect(stats.totalONGs).toBeGreaterThanOrEqual(1);
      expect(stats.totalProjetos).toBeGreaterThanOrEqual(1);
      expect(stats.totalDenuncias).toBeGreaterThanOrEqual(1);
      expect(stats.denunciasAbertas).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Listagens de admin', () => {
    it('lista todos os usuários', async () => {
      const res = await request(app)
        .get('/api/admin/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.usuarios)).toBe(true);
      expect(res.body.usuarios.length).toBeGreaterThanOrEqual(3);
    });

    it('lista todas as áreas', async () => {
      const res = await request(app)
        .get('/api/admin/areas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.areas)).toBe(true);
    });

    it('lista todas as ONGs', async () => {
      const res = await request(app)
        .get('/api/admin/ongs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.ongs)).toBe(true);
    });

    it('lista todas as denúncias', async () => {
      const res = await request(app)
        .get('/api/admin/denuncias')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.denuncias)).toBe(true);
    });

    it('todas as áreas listadas são da Cidade Tiradentes', async () => {
      const res = await request(app)
        .get('/api/admin/areas')
        .set('Authorization', `Bearer ${adminToken}`);

      const bairros = res.body.areas.map((a) => a.bairro);
      expect(bairros.every((b) => b === 'Cidade Tiradentes')).toBe(true);
    });
  });
});