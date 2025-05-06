const request = require('supertest');
const app     = require('../server');

describe('API /products', () => {
  it('deve retornar lista de produtos', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});