const request = require('supertest');
const app = require('../server');

describe('Admin API', () => {
  let prodId;

  it('deve criar produto', async () => {
    const res = await request(app).post('/admin/products').send({ name: 'Test', category: 'X', brand: 'Y', price: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    prodId = res.body.id;
  });

  it('deve listar produtos', async () => {
    const res = await request(app).get('/admin/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve atualizar produto', async () => {
    const res = await request(app).put(`/admin/products/${prodId}`).send({ name: 'Test2', category: 'Z', brand: 'W', price: 200 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test2');
  });

  it('deve deletar produto', async () => {
    const res = await request(app).delete(`/admin/products/${prodId}`);
    expect(res.statusCode).toBe(200);
  });
});