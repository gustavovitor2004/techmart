const API = 'http://localhost:3000';
let adminProductsMap = {};

/** Carrega todos os produtos e cria mapa [id → produto] */
async function loadAdminProducts() {
  const res = await fetch(`${API}/admin/products`);
  const prods = await res.json();
  adminProductsMap = prods.reduce((map, p) => { map[p.id] = p; return map; }, {});
  renderAdminProducts(prods);
}

/** Renderiza seção de produtos */
function renderAdminProducts(prods) {
  const div = document.getElementById('productList');
  div.innerHTML = '';
  prods.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <strong>${p.name}</strong>
      <p>${p.category} • ${p.brand}</p>
      <p>R$ ${p.price.toFixed(2)}</p>
      <button onclick="showEdit(${p.id})">Editar</button>
      <button onclick="deleteProduct(${p.id})">Excluir</button>
      <div id="edit-${p.id}" style="display:none;">
        <input id="editName-${p.id}" value="${p.name}">
        <input id="editCategory-${p.id}" value="${p.category}">
        <input id="editBrand-${p.id}" value="${p.brand}">
        <input id="editPrice-${p.id}" type="number" value="${p.price}">
        <button onclick="updateProduct(${p.id})">Salvar</button>
      </div>
    `;
    div.appendChild(card);
  });
}

function showEdit(id) {
  const e = document.getElementById(`edit-${id}`);
  e.style.display = e.style.display === 'none' ? 'block' : 'none';
}

/** Função para adicionar um novo produto via Admin */
async function addProduct() {
  const name     = document.getElementById('newName').value.trim();
  const category = document.getElementById('newCategory').value.trim();
  const brand    = document.getElementById('newBrand').value.trim();
  const price    = parseFloat(document.getElementById('newPrice').value);

  if (!name || !category || !brand || isNaN(price)) {
    return alert('Preencha todos os campos do novo produto.');
  }

  await fetch(`${API}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, brand, price })
  });

  // Limpa campos
  document.getElementById('newName').value = '';
  document.getElementById('newCategory').value = '';
  document.getElementById('newBrand').value = '';
  document.getElementById('newPrice').value = '';

  // Recarrega lista
  loadAdminProducts();
  // Depois de recarregar produtos, recarrega pedidos também
  loadAdminOrders();
}

/** Atualiza produto */
async function updateProduct(id) {
  const name     = document.getElementById(`editName-${id}`).value.trim();
  const category = document.getElementById(`editCategory-${id}`).value.trim();
  const brand    = document.getElementById(`editBrand-${id}`).value.trim();
  const price    = parseFloat(document.getElementById(`editPrice-${id}`).value);

  if (!name || !category || !brand || isNaN(price)) {
    return alert('Preencha todos os campos antes de salvar.');
  }

  await fetch(`${API}/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, brand, price })
  });

  loadAdminProducts();
}

/** Exclui produto */
async function deleteProduct(id) {
  if (!confirm('Confirma exclusão deste produto?')) return;
  await fetch(`${API}/admin/products/${id}`, { method: 'DELETE' });
  loadAdminProducts();
}

/** Carrega e renderiza pedidos com itens detalhados */
async function loadAdminOrders() {
  const res = await fetch(`${API}/admin/orders`);
  const ords = await res.json();
  const div = document.getElementById('adminOrderList');
  div.innerHTML = '';

  ords.forEach(o => {
    const card = document.createElement('div');
    card.className = 'order-card';

    // Detalha itens do pedido
    const itemsHtml = o.items.map(i => {
      const prod = adminProductsMap[i.productId];
      const name = prod ? prod.name : `Produto #${i.productId}`;
      return `<li>${name} — Qtd: ${i.quantity}</li>`;
    }).join('');

    card.innerHTML = `
      <strong>Pedido #${o.id}</strong>
      <p>Data: ${new Date(o.date).toLocaleString()}</p>
      <p>Status: 
        <select onchange="updateOrderStatus(${o.id}, this.value)">
          <option${o.status==='Processando'? ' selected':''}>Processando</option>
          <option${o.status==='Enviado'?    ' selected':''}>Enviado</option>
          <option${o.status==='Entregue'?   ' selected':''}>Entregue</option>
        </select>
      </p>
      <div>
        <strong>Itens do Pedido:</strong>
        <ul>${itemsHtml}</ul>
      </div>
    `;
    div.appendChild(card);
  });
}

/** Atualiza status de um pedido */
async function updateOrderStatus(id, status) {
  await fetch(`${API}/admin/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadAdminOrders();
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addProduct').onclick = addProduct;
  loadAdminProducts().then(loadAdminOrders);
});
