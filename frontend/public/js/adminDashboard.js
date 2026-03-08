let activeTab = 'dashboard'; // ค่าเริ่มต้นคือหน้า Dashboard
let usersData = [];
let ordersData = [];
let productsData = [];
let selectedOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  if (role !== 'admin' || !token) {
    alert('ปฏิเสธการเข้าถึง! พื้นที่นี้สำหรับผู้ดูแลระบบเท่านั้น');
    window.location.href = '/';
    return;
  }
  
  const container = document.querySelector('.page-container');
  container.style.maxWidth = '1200px';
  container.style.width = '100%';
  container.style.padding = '20px';
  
  fetchData();
});

// ฟังก์ชันดึงข้อมูล "ทั้งหมด" มารอไว้เพื่อใช้คำนวณสถิติ
async function fetchData() {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };
  
  try {
    const [resUsers, resOrders, resProducts] = await Promise.all([
      fetch('http://localhost:5000/api/users', { headers }),
      fetch('http://localhost:5000/api/orders', { headers }),
      fetch('http://localhost:5000/api/products')
    ]);
    
    usersData = await resUsers.json();
    ordersData = await resOrders.json();
    productsData = await resProducts.json();
    
    renderAdminUI();
  } catch (err) {
    console.error(err);
    alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    window.location.href = '/';
  }
}

async function saveProductUpdate(id, name) {
  const priceInput = document.getElementById(`price-${id}`).value;
  const stockInput = document.getElementById(`stock-${id}`).value;
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ price: priceInput, stockQuantity: stockInput })
    });
    
    if (res.ok) {
      alert(`อัปเดตสินค้า "${name}" สำเร็จ!`);
      fetchData();
    } else { throw new Error('Update failed'); }
  } catch (error) { alert("เกิดข้อผิดพลาดในการอัปเดตสินค้า"); }
}

function renderAdminUI() {
  const container = document.querySelector('.page-container');
  
  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
      <h2 style="font-size:2rem; margin:0; display:flex; align-items:center; gap:15px;">
        ⚙️ ระบบจัดการหลังบ้าน (Admin Panel)
      </h2>
      <button onclick="window.print()" class="bg-gradient" style="border:none; padding:10px 20px; border-radius:50px; color:#fff; font-weight:bold; cursor:pointer; font-size:16px;">
        🖨️ พิมพ์รายงาน
      </button>
    </div>
    
    <div class="admin-tabs" style="display:flex; gap:10px; margin-bottom:30px; border-bottom:2px solid #eee; padding-bottom:10px; overflow-x:auto;">
      <button onclick="switchTab('dashboard')" style="${tabStyle(activeTab === 'dashboard')}">📊 ภาพรวมสถิติ</button>
      <button onclick="switchTab('users')" style="${tabStyle(activeTab === 'users')}">👥 ข้อมูลผู้ใช้งาน</button>
      <button onclick="switchTab('orders')" style="${tabStyle(activeTab === 'orders')}">📦 รายการคำสั่งซื้อ</button>
      <button onclick="switchTab('products')" style="${tabStyle(activeTab === 'products')}">🏷️ จัดการคลังสินค้า</button>
    </div>
  `;

  // ==================== แท็บ 0: DASHBOARD หน้าแรก ====================
  if (activeTab === 'dashboard') {
    const totalSales = ordersData.reduce((sum, order) => sum + Number(order.totalamount), 0);
    const completedOrders = ordersData.filter(o => o.status === 'Completed').length;
    const recentOrders = ordersData.slice(0, 5); // กิจกรรมล่าสุด 5 รายการ

    html += `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:40px;">
        <div style="background-color:#fff; padding:25px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.02);">
          <h4 style="color:#64748b; margin:0 0 10px 0; font-size:16px;">ยอดขายรวมทั้งหมด</h4>
          <h2 style="margin:0; font-size:2.5rem; color:#1a499b;">฿${totalSales.toLocaleString()}</h2>
        </div>
        <div style="background-color:#fff; padding:25px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.02);">
          <h4 style="color:#64748b; margin:0 0 10px 0; font-size:16px;">คำสั่งซื้อทั้งหมด</h4>
          <h2 style="margin:0; font-size:2.5rem; color:#22c55e;">${ordersData.length} <span style="font-size:1rem; color:#94a3b8;">รายการ</span></h2>
        </div>
        <div style="background-color:#fff; padding:25px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.02);">
          <h4 style="color:#64748b; margin:0 0 10px 0; font-size:16px;">สมาชิกลูกค้า</h4>
          <h2 style="margin:0; font-size:2.5rem; color:#f59e0b;">${usersData.length} <span style="font-size:1rem; color:#94a3b8;">คน</span></h2>
        </div>
      </div>

      <h3 style="margin-bottom:20px;">⚡ กิจกรรมล่าสุด (Recent Activities)</h3>
      <div style="background-color:#fff; padding:20px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.02); overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background-color:#f8fafc; color:#334155; border-bottom:2px solid #e2e8f0;">
              <th style="padding:15px;">Order ID</th>
              <th style="padding:15px;">เวลา</th>
              <th style="padding:15px;">ลูกค้า</th>
              <th style="padding:15px;">ยอดชำระ</th>
            </tr>
          </thead>
          <tbody>
            ${recentOrders.map(o => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:15px; font-weight:bold; color:#1a499b;">${o.ordercode}</td>
                <td style="padding:15px;">${new Date(o.orderdate).toLocaleString('th-TH')}</td>
                <td style="padding:15px;">@${o.username}</td>
                <td style="padding:15px; font-weight:bold; color:#e31e24;">฿${o.totalamount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  // ==================== แท็บ 1: ข้อมูลผู้ใช้งาน ====================
  else if (activeTab === 'users') {
    html += `
      <div style="background-color:#fff; padding:20px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05); overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left; min-width:800px;">
          <thead>
            <tr style="background-color:#f8fafc; color:#334155; border-bottom:2px solid #e2e8f0;">
              <th style="padding:15px;">ID</th><th style="padding:15px;">Username</th>
              <th style="padding:15px;">ชื่อ-นามสกุล</th><th style="padding:15px;">อีเมล</th>
              <th style="padding:15px;">เบอร์โทร</th><th style="padding:15px;">สิทธิ์ (Role)</th>
            </tr>
          </thead>
          <tbody>
            ${usersData.map(u => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:15px;">${u.id}</td>
                <td style="padding:15px; font-weight:bold; color:#0f172a;">${u.username}</td>
                <td style="padding:15px;">${u.firstname || ''} ${u.lastname || ''}</td>
                <td style="padding:15px;">${u.email || '-'}</td>
                <td style="padding:15px;">${u.phone || '-'}</td>
                <td style="padding:15px;">
                  <span style="background-color:${u.role==='admin'?'#fef08a':'#e2e8f0'}; color:#000; padding:5px 10px; border-radius:50px; font-size:12px; font-weight:bold;">
                    ${u.role.toUpperCase()}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } 
  // ==================== แท็บ 2: รายการคำสั่งซื้อ ====================
  else if (activeTab === 'orders') {
    html += `
      <div style="background-color:#fff; padding:20px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05); overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left; min-width:800px;">
          <thead>
            <tr style="background-color:#f8fafc; color:#334155; border-bottom:2px solid #e2e8f0;">
              <th style="padding:15px;">หมายเลข Order</th><th style="padding:15px;">วัน/เวลา</th>
              <th style="padding:15px;">ลูกค้า (Username)</th><th style="padding:15px;">ยอดชำระ</th>
              <th style="padding:15px;">สถานะ</th><th style="padding:15px; text-align:center;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${ordersData.map(o => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:15px; font-weight:bold; color:#1a499b;">${o.ordercode}</td>
                <td style="padding:15px; font-size:14px;">${new Date(o.orderdate).toLocaleString('th-TH')}</td>
                <td style="padding:15px;">${o.username}</td>
                <td style="padding:15px; font-weight:bold; color:#e31e24;">฿${o.totalamount}</td>
                <td style="padding:15px;">
                  <span style="background-color:#dcfce3; color:#166534; padding:5px 10px; border-radius:50px; font-size:12px; font-weight:bold;">${o.status}</span>
                </td>
                <td style="padding:15px; text-align:center;">
                  <button onclick='viewOrder(${JSON.stringify(o).replace(/'/g, "&apos;")})' style="background-color:#0f172a; color:#fff; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-size:13px;">ดูรายละเอียด</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }
  // ==================== แท็บ 3: จัดการคลังสินค้า ====================
  else if (activeTab === 'products') {
    html += `
      <div style="background-color:#fff; padding:20px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05); overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left; min-width:800px;">
          <thead>
            <tr style="background-color:#f8fafc; color:#334155; border-bottom:2px solid #e2e8f0;">
              <th style="padding:15px;">รหัสสินค้า</th><th style="padding:15px;">ชื่อสินค้า</th>
              <th style="padding:15px; width:150px;">ราคา (฿)</th><th style="padding:15px; width:150px;">สต๊อก (ชิ้น)</th>
              <th style="padding:15px; text-align:center;">บันทึก</th>
            </tr>
          </thead>
          <tbody>
            ${productsData.map(p => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:15px; color:#64748b; font-size:14px;">${p.productcode || `P-00${p.id}`}</td>
                <td style="padding:15px; font-weight:500;">${p.productname || p.productName}</td>
                <td style="padding:10px;">
                  <input type="number" id="price-${p.id}" value="${p.price}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #cbd5e1; outline-color:#1a499b; color:#000;">
                </td>
                <td style="padding:10px;">
                  <input type="number" id="stock-${p.id}" value="${p.stockquantity || p.stockQuantity || 0}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #cbd5e1; outline-color:#1a499b; color:#000;">
                </td>
                <td style="padding:15px; text-align:center;">
                  <button onclick="saveProductUpdate(${p.id}, '${p.productname || p.productName}')" style="background-color:#22c55e; color:#fff; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px;">บันทึก</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }

  // Modal ดูรายละเอียดออเดอร์
  if (selectedOrder) {
    const itemsHtml = selectedOrder.items ? selectedOrder.items.map(item => `
      <li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #e2e8f0;">
        <span style="color:#000;">${item.productName} <strong style="color:#64748b;">x${item.qty}</strong></span>
        <strong style="color:#000;">฿${item.price * item.qty}</strong>
      </li>
    `).join('') : '';

    html += `
      <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background-color:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
        <div style="background-color:#fff; padding:30px; border-radius:15px; width:90%; max-width:600px; max-height:80vh; overflow-y:auto; color:#000;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:20px;">
            <h3 style="margin:0; color:#0f172a;">รายละเอียด Order: ${selectedOrder.ordercode}</h3>
            <button onclick="closeModal()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#ef4444;">✕</button>
          </div>
          <div style="margin-bottom:20px; background-color:#f8fafc; padding:15px; border-radius:10px;">
            <p><strong>ชื่อลูกค้า:</strong> ${selectedOrder.firstname || ''} ${selectedOrder.lastname || ''} (@${selectedOrder.username})</p>
            <p><strong>ที่อยู่จัดส่ง:</strong> ${selectedOrder.shippingaddress || 'ไม่ได้ระบุ'}</p>
            <p><strong>เวลาสั่งซื้อ:</strong> ${new Date(selectedOrder.orderdate).toLocaleString('th-TH')}</p>
          </div>
          <h4 style="margin-bottom:10px; color:#1a499b;">รายการสินค้า:</h4>
          <ul style="list-style:none; padding:0; margin:0;">${itemsHtml}</ul>
          <div style="text-align:right; margin-top:20px; font-size:1.2rem;">
            <strong>ยอดรวมทั้งสิ้น: <span style="color:#e31e24;">฿${selectedOrder.totalamount}</span></strong>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function switchTab(tab) {
  activeTab = tab;
  renderAdminUI();
}

function viewOrder(order) {
  selectedOrder = order;
  renderAdminUI();
}

function closeModal() {
  selectedOrder = null;
  renderAdminUI();
}

const tabStyle = (isActive) => `
  padding: 12px 25px; border: none; white-space: nowrap;
  background-color: ${isActive ? '#0f172a' : 'transparent'};
  color: ${isActive ? '#fff' : 'inherit'};
  border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 15px;
`;