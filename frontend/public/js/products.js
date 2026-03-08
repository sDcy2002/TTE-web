let products = [];
let categories = [];
let quantities = {};
let currentPage = 1;
const itemsPerPage = 12;
let filteredProducts = []; 

function getCategoryParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category');
}

function setCategoryParam(id) {
  const url = new URL(window.location);
  if (id) url.searchParams.set('category', id);
  else url.searchParams.delete('category');
  window.history.pushState({}, '', url);
  document.getElementById('search-input').value = '';
}

async function fetchData() {
  try {
    const [resProducts, resCategories] = await Promise.all([
      fetch('http://localhost:5000/api/products').then(r => r.json()),
      fetch('http://localhost:5000/api/categories').then(r => r.json())
    ]);
    products = resProducts;
    categories = resCategories;

    products.forEach(p => { quantities[p.id] = 1; });
    renderCategories();
    applyFilters();
  } catch (err) {
    console.error('Error fetching data', err);
  }
}

function renderCategories() {
  const container = document.getElementById('category-menu');
  container.innerHTML = ''; 
  const currentCat = getCategoryParam();

  const allBtn = document.createElement('button');
  allBtn.textContent = '🌟 สินค้าทั้งหมด';
  allBtn.className = 'category-btn';
  allBtn.style.backgroundColor = !currentCat ? '#1a499b' : '#fff';
  allBtn.style.color = !currentCat ? '#fff' : '#555';
  allBtn.onclick = () => {
    currentPage = 1;
    setCategoryParam(null);
    renderCategories();
    applyFilters();
  };
  container.appendChild(allBtn);

  categories.forEach(cat => {
    const isActive = parseInt(currentCat) === cat.id;
    const btn = document.createElement('button');
    btn.textContent = `📌 ${cat.categoryname || cat.categoryName}`;
    btn.className = 'category-btn';
    btn.style.backgroundColor = isActive ? '#1a499b' : '#fff';
    btn.style.color = isActive ? '#fff' : '#555';
    btn.onclick = () => {
      currentPage = 1;
      setCategoryParam(cat.id);
      renderCategories();
      applyFilters();
    };
    container.appendChild(btn);
  });
}

function applyFilters() {
  const currentCat = getCategoryParam();
  const searchInput = document.getElementById('search-input');
  const keyword = searchInput ? searchInput.value.toLowerCase() : '';

  filteredProducts = products.filter(product => {
    const matchCat = currentCat ? parseInt(product.categoryid) === parseInt(currentCat) : true;
    const matchName = (product.productname || product.productName || '').toLowerCase().includes(keyword);
    const productCat = categories.find(c => parseInt(c.id) === parseInt(product.categoryid));
    const matchCatName = productCat && (productCat.categoryname || productCat.categoryName || '').toLowerCase().includes(keyword);
    return matchCat && (matchName || matchCatName);
  });

  let title = "สินค้าทั้งหมด";
  if (currentCat) {
    const active = categories.find(c => parseInt(c.id) === parseInt(currentCat));
    if (active) title = active.categoryname || active.categoryName;
  }
  document.getElementById('page-title').textContent = title;

  renderGrid();
  renderPagination();
}

function handleQtyChange(id, val, max) {
  let num = parseInt(val) || 1;
  if (num > max) num = max;
  if (num < 1) num = 1;
  quantities[id] = num;
  const input = document.getElementById(`qty-${id}`);
  if (input) input.value = num;
}

function addToCart(product) {
  const stock = product.stockquantity || 0;
  if (stock === 0) { alert('ขออภัย สินค้านี้หมดชั่วคราวครับ'); return; }
  const selectedQty = quantities[product.id] || 1;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const idx = cart.findIndex(i => i.id === product.id);
  const currentCartQty = idx >= 0 ? cart[idx].qty : 0;
  
  if (currentCartQty + selectedQty > stock) {
    alert(`คุณมีสินค้านี้ในตะกร้าแล้ว ${currentCartQty} ชิ้น สั่งเพิ่มได้อีกแค่ ${stock - currentCartQty} ชิ้นครับ`);
    return;
  }
  
  if (idx >= 0) { 
    cart[idx].qty += selectedQty; 
    cart[idx].imageUrl = product.imageurl || product.imageUrl; 
  } else { 
    cart.push({ id: product.id, productName: product.productname || product.productName, price: Number(product.price), qty: selectedQty, imageUrl: product.imageurl || product.imageUrl }); 
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  alert(`เพิ่ม "${product.productname || product.productName}" จำนวน ${selectedQty} ชิ้น ลงในตะกร้าแล้ว!`);
}

function renderGrid() {
  const container = document.getElementById('product-grid');
  container.innerHTML = '';

  if (filteredProducts.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:50px; background-color:#f9f9f9; border-radius:15px; grid-column: 1 / -1;"><p style="color:#999; font-size:18px;">ไม่พบสินค้าที่ค้นหา</p></div>';
    return;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  currentItems.forEach(product => {
    const stock = product.stockquantity || 0;
    const isOutOfStock = stock === 0;
    const fileName = product.imageurl || product.imageUrl;
    const fullImg = fileName ? `http://localhost:5000/uploads/${fileName}` : 'https://via.placeholder.com/150?text=No+Image';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.style = `border:1px solid #eee; padding:15px; border-radius:15px; text-align:center; background-color:#fff; opacity:${isOutOfStock?0.6:1}; box-shadow:0 5px 15px rgba(0,0,0,0.03); display:flex; flex-direction:column;`;

    card.innerHTML = `
      <img src="${fullImg}" class="product-image" style="width:100%; height:160px; object-fit:contain; border-radius:10px; margin-bottom:15px;">
      <h3 class="product-title" style="margin:10px 0; font-size:16px; color:#333; flex:1;">${product.productname || product.productName}</h3>
      <p class="product-price" style="color:#1a499b; font-weight:bold; font-size:1.2rem; margin:5px 0;">฿${product.price}</p>
      <p style="margin:10px 0; color:${isOutOfStock?'#e31e24':'#666'}; font-size:13px; background-color:#f9f9f9; padding:5px; border-radius:5px;">
        ${isOutOfStock ? 'สินค้าหมดชั่วคราว' : `สต๊อกคงเหลือ: ${stock} ชิ้น`}
      </p>
    `;

    const actionDiv = document.createElement('div');
    actionDiv.className = 'action-container';
    actionDiv.style = 'display:flex; gap:8px; margin-top:10px;';

    const input = document.createElement('input');
    input.type = 'number'; input.min = 1; input.max = stock; input.disabled = isOutOfStock;
    input.id = `qty-${product.id}`; input.value = quantities[product.id] || 1;
    input.className = 'qty-input';
    input.style = 'width:50px; padding:8px; border-radius:8px; border:1px solid #ccc; text-align:center; font-size:14px; outline:none;';
    input.onchange = (e) => handleQtyChange(product.id, e.target.value, stock);

    const btn = document.createElement('button');
    btn.textContent = 'ใส่ตะกร้า'; btn.disabled = isOutOfStock;
    btn.className = `add-cart-btn ${isOutOfStock ? '' : 'bg-gradient'}`;
    btn.style = `flex:1; background-color:${isOutOfStock?'#ccc':'transparent'}; color:white; border:none; padding:8px; border-radius:8px; cursor:${isOutOfStock?'not-allowed':'pointer'}; font-size:14px; font-weight:500;`;
    btn.onclick = () => addToCart(product);

    actionDiv.appendChild(input); actionDiv.appendChild(btn);
    card.appendChild(actionDiv);
    container.appendChild(card);
  });
}

function renderPagination() {
  const container = document.getElementById('pagination-controls');
  container.innerHTML = '';
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (totalPages <= 1) return;

  const wrap = document.createElement('div');
  wrap.style = 'display:flex; justify-content:flex-end; align-items:center; gap:8px;';

  const prev = document.createElement('button');
  prev.innerHTML = '&laquo; ก่อนหน้า'; prev.disabled = currentPage === 1;
  prev.style = `padding:8px 15px; border-radius:8px; border:1px solid #ddd; background-color:#fff; cursor:${currentPage===1?'not-allowed':'pointer'}; color:${currentPage===1?'#ccc':'#555'}; font-weight:500;`;
  prev.onclick = () => { currentPage = Math.max(currentPage - 1, 1); applyFilters(); window.scrollTo({top:0, behavior:'smooth'}); };
  wrap.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style = `padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold; border:none; background-color:${currentPage===i?'#1a499b':'#f0f0f0'}; color:${currentPage===i?'#fff':'#555'};`;
    btn.onclick = () => { currentPage = i; applyFilters(); window.scrollTo({top:0, behavior:'smooth'}); };
    wrap.appendChild(btn);
  }

  const next = document.createElement('button');
  next.innerHTML = 'ถัดไป &raquo;'; next.disabled = currentPage === totalPages;
  next.style = `padding:8px 15px; border-radius:8px; border:1px solid #ddd; background-color:#fff; cursor:${currentPage===totalPages?'not-allowed':'pointer'}; color:${currentPage===totalPages?'#ccc':'#555'}; font-weight:500;`;
  next.onclick = () => { currentPage = Math.min(currentPage + 1, totalPages); applyFilters(); window.scrollTo({top:0, behavior:'smooth'}); };
  wrap.appendChild(next);

  container.appendChild(wrap);
}

window.addEventListener('DOMContentLoaded', () => {
  fetchData();
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => { currentPage = 1; applyFilters(); });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { if(searchInput) searchInput.value = ''; currentPage = 1; applyFilters(); });
  }
});