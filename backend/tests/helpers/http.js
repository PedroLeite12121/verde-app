const request = require('supertest');
const { app } = require('../../src/app');

async function getToken(email, senha) {
  const res = await request(app).post('/api/auth/login').send({ email, senha });
  if (res.status !== 200) {
    throw new Error(`Login falhou para ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

module.exports = { app, request, getToken };