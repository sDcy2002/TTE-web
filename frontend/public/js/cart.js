let cartItems = [];
let isModalOpen = false;
let isCheckoutSuccess = false;
let shippingAddress = '';
let receiptData = { orderId: 'รอดำเนินการ...', username: '', total: 0, items: [] };

function loadCart() {
  cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-content');
  container.innerHTML = '';
  if (cartItems.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px; background-color:#f9f9f9; border-radius:15px;">
        <p style="color:#999; font-size:18px; margin-bottom:20px;">ไม่มีสินค้าในตะกร้า</p>
        <button id="continue-shopping" class="bg-gradient" style="border:none; padding:10px 25px; border-radius:50px; cursor:pointer; font-size:16px; color:#fff;">ไปเลือกช้อปเลย</button>
      </div>
    `;
    document.getElementById('continue-shopping').addEventListener('click', () => { location.href = '/products'; });
    return;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '15px';

  let localTotal = 0;
  cartItems.forEach(item => {
    localTotal += item.price * item.qty;
    const fullImageUrl = item.imageUrl ? `http://localhost:5000/uploads/${item.imageUrl}` : 'https://via.placeholder.com/150?text=No+Image';
    const itemDiv = document.createElement('div');
    itemDiv.style = 'display:flex; justify-content:space-between; align-items:center; padding:15px 20px; background-color:#fff; border-radius:15px; border:1px solid #eee; box-shadow:0 2px 8px rgba(0,0,0,0.02);';
    itemDiv.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px; flex:1;">
        <img src="${fullImageUrl}" alt="${item.productName}" style="width:60px; height:60px; object-fit:contain; border-radius:8px; border:1px solid #f0f0f0; padding:2px;">
        <div>
          <h3 style="margin:0 0 5px 0; color:#333; font-size:16px;">${item.productName}</h3>
          <p style="margin:0; color:#666; font-size:14px;">ราคาชิ้นละ: ฿${item.price}</p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin-right:30px; border:1px solid #ddd; border-radius:8px; padding:5px;">
        <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:transparent; color:#333; border:none; width:30px; height:30px; cursor:pointer; font-size:18px;">-</button>
        <span style="font-size:16px; width:30px; text-align:center; font-weight:500;">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:transparent; color:#333; border:none; width:30px; height:30px; cursor:pointer; font-size:18px;">+</button>
      </div>
      <div style="display:flex; align-items:center; gap:30px; width:150px; justify-content:flex-end;">
        <span class="text-gradient" style="font-weight:bold; font-size:1.2rem;">฿${item.price * item.qty}</span>
        <button class="del-btn" data-id="${item.id}" style="background-color:#fff; color:#e31e24; border:1px solid #e31e24; padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:500; font-size:14px;">ลบ</button>
      </div>
    `;
    list.appendChild(itemDiv);
  });

  const summary = document.createElement('div');
  summary.style = 'margin-top:30px; padding:30px; background-color:#f9f9f9; border-radius:15px; border:1px solid #eee; text-align:right;';
  summary.innerHTML = `
    <h3 style="font-size:1.5rem; margin-bottom:15px;">ยอดชำระสุทธิ: <span class="text-gradient" style="font-weight:bold;">฿${localTotal}</span></h3>
    <button id="checkout-btn" class="bg-gradient" style="border:none; padding:15px 40px; font-size:18px; border-radius:50px; cursor:pointer; font-weight:600; color:#fff;">สั่งซื้อสินค้า</button>
  `;

  container.appendChild(list);
  container.appendChild(summary);

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const delta = parseInt(e.target.getAttribute('data-delta'));
      updateQuantity(id, delta);
    });
  });

  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      removeFromCart(id);
    });
  });

  document.getElementById('checkout-btn').addEventListener('click', openPaymentModal);
}

function updateQuantity(id, delta) {
  cartItems = cartItems.map(item => {
    if (item.id === id) {
      const newQty = item.qty + delta;
      return { ...item, qty: newQty > 0 ? newQty : 1 };
    }
    return item;
  });
  localStorage.setItem('cart', JSON.stringify(cartItems));
  window.dispatchEvent(new Event('cartUpdated'));
  renderCart();
}

function removeFromCart(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  window.dispatchEvent(new Event('cartUpdated'));
  renderCart();
}

async function openPaymentModal() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  if (!token || !username) {
    alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อครับ");
    window.location.href = '/register';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/users/profile', { headers: { Authorization: 'Bearer ' + token } });
    if(res.ok) {
      const data = await res.json();
      shippingAddress = data.address || '';
    }
  } catch(e) {}

  receiptData.username = username;
  receiptData.items = cartItems;
  receiptData.total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  isCheckoutSuccess = false;
  showModal();
}

function showModal() {
  const modal = document.getElementById('payment-modal');
  modal.style.display = 'flex';
  modal.style.position = 'fixed';
  modal.style.top = '0'; modal.style.left = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
  modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
  modal.style.zIndex = '1000'; modal.style.backdropFilter = 'blur(5px)';

  let content = `
    <div style="background-color:#fff; padding:40px; border-radius:20px; width:90%; max-width:500px; box-shadow:0 10px 30px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
      <h2 class="text-gradient" style="text-align:center; margin-top:0; font-size:1.8rem;">
        ${isCheckoutSuccess ? 'ทำรายการสำเร็จ!' : 'ยืนยันการสั่งซื้อ'}
      </h2>
      <hr style="border-top:1px dashed #ddd; margin:20px 0;" />
      <div style="margin:20px 0; font-size:16px; color:#444;">
        <p style="margin-bottom:10px;"><strong>หมายเลขคำสั่งซื้อ:</strong> <span style="float:right; color:${isCheckoutSuccess?'#1a499b':'#999'}; font-weight:${isCheckoutSuccess?'bold':'normal'};">${receiptData.orderId}</span></p>
        <p style="margin-bottom:20px;"><strong>ชื่อลูกค้า:</strong> <span style="float:right;">${receiptData.username}</span></p>
  `;

  if (!isCheckoutSuccess) {
    content += `
        <div style="margin-bottom:20px; background-color:#f9fafb; padding:15px; border-radius:10px; border:1px solid #eee;">
          <strong style="color:#1a499b; display:block; margin-bottom:8px;">ที่อยู่จัดส่ง:</strong>
          <textarea id="shipping-address" placeholder="กรุณากรอกที่อยู่จัดส่ง..." rows="3" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; outline-color:#1a499b; resize:vertical;">${shippingAddress}</textarea>
        </div>
    `;
  } else {
    content += `
        <div style="margin-bottom:20px; background-color:#f0fdf4; padding:15px; border-radius:10px; border:1px solid #c3e6cb;">
          <strong style="color:#28a745; display:block; margin-bottom:5px;">จัดส่งไปยัง:</strong>
          <p style="margin:0; font-size:14px; line-height:1.5;">${shippingAddress}</p>
        </div>
    `;
  }

  content += `
        <h4 style="margin-bottom:15px; color:#1a499b;">รายการสินค้า:</h4>
        <ul style="list-style:none; padding:0; margin:0;">
          ${receiptData.items.map(item => `<li style="margin-bottom:10px; display:flex; justify-content:space-between;"><span>${item.productName} <span style="color:#888;">(x${item.qty})</span></span><span style="font-weight:500;">฿${item.price * item.qty}</span></li>`).join('')}
        </ul>
      </div>
      <hr style="border-top:1px dashed #ddd; margin:20px 0;" />
      <h3 style="text-align:right; font-size:1.5rem; color:#333;">รวมทั้งสิ้น: <span class="text-gradient">฿${receiptData.total}</span></h3>
  `;

  if (isCheckoutSuccess) {
    content += `<button id="close-modal-btn" class="bg-gradient" style="width:100%; border:none; padding:15px; font-size:18px; border-radius:50px; cursor:pointer; margin-top:30px; font-weight:bold; color:#fff;">ปิดหน้าต่าง</button>`;
  } else {
    content += `
      <div style="display:flex; gap:15px; margin-top:30px;">
        <button id="cancel-btn" style="flex:1; background-color:#fff; color:#666; border:1px solid #ccc; padding:15px; font-size:16px; border-radius:50px; cursor:pointer; font-weight:500;">ยกเลิก</button>
        <button id="confirm-payment-btn" class="bg-gradient" style="flex:1; border:none; padding:15px; font-size:16px; border-radius:50px; cursor:pointer; font-weight:bold; color:#fff;">ยืนยันชำระเงิน</button>
      </div>
    `;
  }

  content += `</div>`;
  modal.innerHTML = content;

  if (isCheckoutSuccess) {
    document.getElementById('close-modal-btn').addEventListener('click', closeAndClear);
  } else {
    document.getElementById('confirm-payment-btn').addEventListener('click', handleConfirmPayment);
    document.getElementById('cancel-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  }
}

async function handleConfirmPayment() {
  const addrInput = document.getElementById('shipping-address');
  if (!addrInput.value.trim()) { alert('กรุณาระบุที่อยู่จัดส่งสินค้าด้วยครับ!'); return; }
  shippingAddress = addrInput.value;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ cart: cartItems, shippingAddress })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unknown error');
    
    receiptData.total = data.total;
    receiptData.orderId = data.orderId;
    isCheckoutSuccess = true;
    showModal();
  } catch(err) {
    console.error('Checkout Error:', err);
    alert(err.message ? `เกิดข้อผิดพลาด: ${err.message}` : 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    document.getElementById('payment-modal').style.display = 'none';
  }
}

function closeAndClear() {
  document.getElementById('payment-modal').style.display = 'none';
  cartItems = [];
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
  alert("ขอบคุณที่ใช้บริการครับ!");
  window.location.href = '/profile';
}

document.addEventListener('DOMContentLoaded', loadCart);