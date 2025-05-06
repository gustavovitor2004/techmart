const request = require('supertest');
const app = require('../server');

describe('API /reviews', () => {
  it('deve postar e retornar reviews', async () => {
    await request(app).post('/reviews').send({ productId: 1, rating: 5, comment: 'Ótimo!' });
    const res = await request(app).get('/reviews');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(r => r.comment === 'Ótimo!')).toBe(true);
  });
});