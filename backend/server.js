const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: 'Smartphone X', category: 'Smartphones', brand: 'BrandA', price: 1999 },
  { id: 2, name: 'Laptop Pro', category: 'Notebooks', brand: 'BrandB', price: 3999 },
  { id: 3, name: 'Headset Wireless', category: 'Acessórios', brand: 'BrandC', price: 299 },
  { id: 4, name: 'Smartwatch Z', category: 'Wearables', brand: 'BrandD', price: 999 },
  { id: 5, name: 'Tablet S', category: 'Tablets', brand: 'BrandE', price: 2499 },
  { id: 6, name: 'Camera HD', category: 'Câmeras', brand: 'BrandF', price: 1599 },
  { id: 7, name: 'Mouse Gamer', category: 'Acessórios', brand: 'BrandG', price: 199 },
  { id: 8, name: 'Teclado Mecânico', category: 'Acessórios', brand: 'BrandH', price: 399 },
  { id: 9, name: 'Monitor 4K', category: 'Monitores', brand: 'BrandI', price: 2999 },
  { id: 10, name: 'SSD 1TB', category: 'Componentes', brand: 'BrandJ', price: 799 }
];

let cart = [];
let orders = [];
let reviews = [];

// 1. Catálogo de Produtos
app.get('/products', (req, res) => {
  const { category, brand, minPrice, maxPrice } = req.query;
  const result = products.filter(p => {
    if (category && p.category !== category) return false;
    if (brand && p.brand !== brand) return false;
    if (minPrice && p.price < +minPrice) return false;
    if (maxPrice && p.price > +maxPrice) return false;
    return true;
  });
  res.json(result);
});

// 2. Gestão de Carrinho
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const item = cart.find(i => i.productId === productId);
  if (item) item.quantity += quantity;
  else cart.push({ productId, quantity });
  res.json(cart);
});
app.get('/cart', (req, res) => {
  const items = cart.map(i => {
    const p = products.find(x => x.id === i.productId);
    return { product: p, quantity: i.quantity };
  });
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  res.json({ items, total });
});
app.post('/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  cart = cart.filter(i => i.productId !== productId);
  if (quantity > 0) cart.push({ productId, quantity });
  res.json(cart);
});

// 3. Processo de Pagamento (simulado)
app.post('/payment', (req, res) => {
  const success = true;
  if (success) {
    const order = { id: orders.length + 1, items: [...cart], date: new Date(), status: 'Processando' };
    orders.push(order);
    cart = [];
    return res.json({ success: true, orderId: order.id });
  }
  res.status(400).json({ success: false });
});

// 4. Gestão de Pedidos
app.get('/orders', (req, res) => res.json(orders));
app.get('/orders/:id', (req, res) => {
  const o = orders.find(x => x.id === +req.params.id);
  res.json(o || {});
});

// 5. Avaliações e Comentários
app.post('/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;
  reviews.push({ productId, rating, comment });
  res.json({ success: true });
});
app.get('/reviews', (req, res) => res.json(reviews));

// 6. Sistema de Recomendação
app.get('/recommendations', (req, res) => {
  const rec = [];
  while (rec.length < 3 && rec.length < products.length) {
    const p = products[Math.floor(Math.random() * products.length)];
    if (!rec.includes(p)) rec.push(p);
  }
  res.json(rec);
});

// 7. Painel Administrativo - APIs
app.get('/admin/products', (req, res) => res.json(products));
app.post('/admin/products', (req, res) => {
  const p = req.body; p.id = products.length + 1;
  products.push(p);
  res.json(p);
});
app.put('/admin/products/:id', (req, res) => {
  const idx = products.findIndex(x => x.id === +req.params.id);
  if (idx >= 0) {
    products[idx] = { id: +req.params.id, ...req.body };
    return res.json(products[idx]);
  }
  res.status(404).json({ error: 'Produto não encontrado' });
});
app.delete('/admin/products/:id', (req, res) => {
  products = products.filter(x => x.id !== +req.params.id);
  res.json({ success: true });
});
app.get('/admin/orders', (req, res) => res.json(orders));
app.put('/admin/orders/:id', (req, res) => {
  const o = orders.find(x => x.id === +req.params.id);
  if (o) {
    o.status = req.body.status || o.status;
    return res.json(o);
  }
  res.status(404).json({ error: 'Pedido não encontrado' });
});

// Inicia servidor somente quando executado diretamente
if (require.main === module) {
  const port = 3000;
  app.listen(port, () => console.log(`Backend rodando em http://localhost:${port}`));
}

module.exports = app;