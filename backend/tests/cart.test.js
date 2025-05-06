const request = require('supertest');
const app = require('../server');

describe('API /cart', () => {
  it('deve adicionar item e retornar carrinho', async () => {
    const res = await request(app).post('/cart').send({ productId: 1, quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve retornar items e total', async () => {
    await request(app).post('/cart').send({ productId: 2, quantity: 1 });
    const res = await request(app).get('/cart');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
  });
});