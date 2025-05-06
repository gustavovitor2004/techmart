const API = 'http://localhost:3000';

// carrega catálogo (e popula filtros)
async function loadProducts(filters = {}) {
  const q = new URLSearchParams(filters).toString();
  const res = await fetch(`${API}/products?${q}`);
  const prods = await res.json();
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';
  prods.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <h4>${p.name}</h4>
      <p>${p.category} • ${p.brand}</p>
      <p>R$ ${p.price.toFixed(2)}</p>
      <button onclick="addToCart(${p.id})">Adicionar</button>
    `;
    catalog.appendChild(card);
  });
  populateFilterOptions(prods);
}

// popula selects de categoria e marca
function populateFilterOptions(prods) {
  const cats = [...new Set(prods.map(p => p.category))];
  const brands = [...new Set(prods.map(p => p.brand))];
  const cf = document.getElementById('categoryFilter');
  const bf = document.getElementById('brandFilter');
  cf.innerHTML = '<option value="">Todas as Categorias</option>';
  bf.innerHTML = '<option value="">Todas as Marcas</option>';
  cats.forEach(c => cf.innerHTML += `<option>${c}</option>`);
  brands.forEach(b => bf.innerHTML += `<option>${b}</option>`);
}

// filtros
document.getElementById('applyFilters').onclick = () => {
  const f = {
    category: document.getElementById('categoryFilter').value,
    brand: document.getElementById('brandFilter').value,
    minPrice: document.getElementById('minPrice').value,
    maxPrice: document.getElementById('maxPrice').value
  };
  loadProducts(f);
};

// adiciona ao carrinho
async function addToCart(id) {
  await fetch(`${API}/cart`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ productId: id, quantity: 1 })
  });
  loadCart();
}

// carrega o carrinho com controles
async function loadCart() {
  const res = await fetch(`${API}/cart`);
  const { items, total } = await res.json();
  const div = document.getElementById('cartItems');
  div.innerHTML = '';
  items.forEach(i => {
    const c = document.createElement('div');
    c.className = 'cart-card';
    c.innerHTML = `
      <strong>${i.product.name}</strong>
      <p>
        Qtd: 
        <input type="number" value="${i.quantity}" min="1" onchange="updateCart(${i.product.id}, this.value)">
      </p>
      <button onclick="removeFromCart(${i.product.id})">Remover</button>
    `;
    div.appendChild(c);
  });
  document.getElementById('cartTotal').innerText = `Total: R$ ${total.toFixed(2)}`;
}

// atualiza quantidade no carrinho
async function updateCart(productId, quantity) {
  await fetch(`${API}/cart/update`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ productId: +productId, quantity: +quantity })
  });
  loadCart();
}

// remove item do carrinho
async function removeFromCart(productId) {
  await updateCart(productId, 0);
}

// checkout
document.getElementById('checkout').onclick = async () => {
  const res = await fetch(`${API}/payment`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}' });
  const json = await res.json();
  if (json.success) {
    alert(`Pedido #${json.orderId} criado!`);
    loadCart();
    loadOrders();
  }
};

// pedidos
async function loadOrders() {
  const res = await fetch(`${API}/orders`);
  const ords = await res.json();
  const div = document.getElementById('orderList');
  div.innerHTML = '';
  ords.forEach(o => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `<strong>Pedido #${o.id}</strong><p>Status: ${o.status}</p>`;
    div.appendChild(card);
  });
}

// avaliações
async function loadReviews() {
  const res = await fetch(`${API}/reviews`);
  const revs = await res.json();
  const div = document.getElementById('reviewList');
  div.innerHTML = '';
  revs.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `<p>Produto ${r.productId} • Nota ${r.rating}</p><p>${r.comment}</p>`;
    div.appendChild(card);
  });
}

// submissão de avaliação
document.getElementById('submitReview').onclick = async () => {
  const productId = +document.getElementById('reviewProduct').value;
  const rating    = +document.getElementById('rating').value;
  const comment   = document.getElementById('comment').value;
  if (!productId || !rating || !comment) return alert('Preencha todos os campos da avaliação.');
  await fetch(`${API}/reviews`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ productId, rating, comment })
  });
  document.getElementById('rating').value = '';
  document.getElementById('comment').value = '';
  loadReviews();
};

// populate select e recomendações
async function loadReviewSelect() {
  const res = await fetch(`${API}/products`);
  const prods = await res.json();
  const sel = document.getElementById('reviewProduct');
  sel.innerHTML = '<option value="">Selecione o produto</option>';
  prods.forEach(p => sel.innerHTML += `<option value="${p.id}">${p.name}</option>`);
}
async function loadRecs() {
  const res = await fetch(`${API}/recommendations`);
  const recs = await res.json();
  const div = document.getElementById('recList');
  div.innerHTML = '';
  recs.forEach(p => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `<strong>${p.name}</strong><p>R$ ${p.price.toFixed(2)}</p>`;
    div.appendChild(card);
  });
}

// inicialização
loadProducts();
loadCart();
loadOrders();
loadReviews();
loadReviewSelect();
loadRecs();