const { app, request, getToken } = require('./helpers/http');

describe('Áreas', () => {
  let token;

  beforeAll(async () => {
    token = await getToken('maria@verde.com', '123456');
  });

  describe('Acesso', () => {
    it('rejeita sem token (401)', async () => {
      const res = await request(app).get('/api/areas');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/areas', () => {
    it('lista as áreas', async () => {
      const res = await request(app)
        .get('/api/areas')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.areas.length).toBeGreaterThanOrEqual(1);
    });

    it('filtra por bairro', async () => {
      const res = await request(app)
        .get('/api/areas?bairro=Cidade Tiradentes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.areas.length).toBeGreaterThan(0);
      const bairros = res.body.areas.map((a) => a.bairro);
      expect(bairros.every((b) => b === 'Cidade Tiradentes')).toBe(true);
    });

    it('filtra por statusArea', async () => {
      const res = await request(app)
        .get('/api/areas?statusArea=em tratamento')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      res.body.areas.forEach((a) => expect(a.statusArea).toBe('em tratamento'));
    });
  });

  describe('GET /api/areas/:id', () => {
    it('busca uma área existente', async () => {
      const res = await request(app)
        .get('/api/areas/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.area.idArea).toBe(1);
    });

    it('retorna 404 para área inexistente', async () => {
      const res = await request(app)
        .get('/api/areas/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/areas', () => {
    it('cria uma área na Cidade Tiradentes', async () => {
      const res = await request(app)
        .post('/api/areas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cidade: 'São Paulo',
          bairro: 'Cidade Tiradentes',
          rua: 'Rua de Teste Automatizado',
          statusArea: 'identificada',
        });

      expect(res.status).toBe(201);
      expect(res.body.area.bairro).toBe('Cidade Tiradentes');
      expect(res.body.area.idArea).toBeDefined();

      await request(app)
        .delete(`/api/areas/${res.body.area.idArea}`)
        .set('Authorization', `Bearer ${token}`);
    });
  });

  describe('PUT /api/areas/:id', () => {
    it('atualiza uma área', async () => {
      const criada = await request(app)
        .post('/api/areas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cidade: 'São Paulo',
          bairro: 'Cidade Tiradentes',
          rua: 'Rua para Atualizar',
          statusArea: 'identificada',
        });
      const id = criada.body.area.idArea;

      const res = await request(app)
        .put(`/api/areas/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statusArea: 'em tratamento' });

      expect(res.status).toBe(200);
      expect(res.body.area.statusArea).toBe('em tratamento');

      await request(app).delete(`/api/areas/${id}`).set('Authorization', `Bearer ${token}`);
    });

    it('retorna 404 ao atualizar área inexistente', async () => {
      const res = await request(app)
        .put('/api/areas/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ statusArea: 'em tratamento' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/areas/:id', () => {
    it('remove uma área criada no teste', async () => {
      const criada = await request(app)
        .post('/api/areas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cidade: 'São Paulo',
          bairro: 'Cidade Tiradentes',
          rua: 'Rua para Deletar',
          statusArea: 'identificada',
        });
      const id = criada.body.area.idArea;

      const res = await request(app)
        .delete(`/api/areas/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();

      const busca = await request(app)
        .get(`/api/areas/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(busca.status).toBe(404);
    });
  });
});