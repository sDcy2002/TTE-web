let profileData = { firstname:'', lastname:'', phone:'', email:'', address:'' };
let orders = [];
let isEditing = false;

async function fetchProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/register';
    return;
  }
  try {
    const [resProfile, resOrders] = await Promise.all([
      fetch('http://localhost:5000/api/users/profile', { headers:{ Authorization: 'Bearer '+token } }).then(r=>r.json()),
      fetch('http://localhost:5000/api/orders/my-orders', { headers:{ Authorization: 'Bearer '+token } }).then(r=>r.json())
    ]);
    profileData = { ...profileData, ...resProfile };
    orders = resOrders || [];
    render();
  } catch(err) {
    console.error('Fetch Data Error', err);
  }
}

function render() {
  const container = document.getElementById('profile-content');
  container.innerHTML = '';
  
  const left = document.createElement('div');
  left.style = 'flex:1 1 350px; background-color:#fff; padding:30px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);';

  if (isEditing) {
    left.innerHTML = `
      <h3 style="color:#1a499b; margin:0 0 25px 0;">แก้ไขข้อมูลส่วนตัว</h3>
      <form id="profile-form" style="display:flex; flex-direction:column; gap:15px;">
        <div style="display:flex; gap:15px;">
          <input type="text" name="firstname" value="${profileData.firstname || ''}" placeholder="ชื่อจริง" style="flex:1; padding:12px; border-radius:8px; border:1px solid #ddd; outline-color:#1a499b;">
          <input type="text" name="lastname" value="${profileData.lastname || ''}" placeholder="นามสกุล" style="flex:1; padding:12px; border-radius:8px; border:1px solid #ddd; outline-color:#1a499b;">
        </div>
        <input type="text" name="phone" value="${profileData.phone || ''}" placeholder="เบอร์โทรศัพท์" style="padding:12px; border-radius:8px; border:1px solid #ddd; outline-color:#1a499b;">
        <input type="email" name="email" value="${profileData.email || ''}" placeholder="อีเมล" style="padding:12px; border-radius:8px; border:1px solid #ddd; outline-color:#1a499b;">
        <textarea name="address" placeholder="ที่อยู่จัดส่งเริ่มต้น" rows="4" style="padding:12px; border-radius:8px; border:1px solid #ddd; outline-color:#1a499b; resize:vertical;">${profileData.address || ''}</textarea>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button type="button" id="cancel-edit" style="flex:1; padding:12px; border-radius:8px; border:1px solid #ccc; background-color:#fff; cursor:pointer;">ยกเลิก</button>
          <button type="submit" class="bg-gradient" style="flex:1; padding:12px; border-radius:8px; border:none; color:#fff; cursor:pointer; font-weight:bold;">บันทึกข้อมูล</button>
        </div>
      </form>
    `;
  } else {
    left.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
        <h3 style="color:#1a499b; margin:0;">ข้อมูลส่วนตัว / ที่อยู่ตั้งต้น</h3>
        <button id="edit-btn" style="background:none; border:none; color:#e31e24; cursor:pointer; font-weight:bold; text-decoration:underline;">แก้ไขข้อมูล</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:15px; color:#444; font-size:16px;">
        <p><strong>ชื่อ-นามสกุล:</strong> ${profileData.firstname || '-'} ${profileData.lastname || '-'}</p>
        <p><strong>เบอร์โทรศัพท์:</strong> ${profileData.phone || '-'}</p>
        <p><strong>อีเมล:</strong> ${profileData.email || '-'}</p>
        <div>
          <strong>ที่อยู่จัดส่งเริ่มต้น:</strong>
          <div style="margin-top:10px; padding:15px; background-color:#f8f9fa; border-radius:8px; border:1px solid #eee; line-height:1.6; color:${profileData.address?'#555':'#999'};">
            ${profileData.address || 'คุณยังไม่ได้ระบุที่อยู่จัดส่ง (สามารถระบุตอนสั่งซื้อได้)'}
          </div>
        </div>
      </div>
    `;
  }

  const right = document.createElement('div');
  right.style = 'flex:2 1 500px; background-color:#fff; padding:30px; border-radius:15px; border:1px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);';
  right.innerHTML = '<h3 style="margin-bottom:20px; color:#e31e24;">ประวัติการสั่งซื้อของคุณ</h3>';
  
  if (orders.length === 0) {
    right.innerHTML += '<p style="color:#999; text-align:center; padding:30px 0;">คุณยังไม่มีประวัติการสั่งซื้อครับ</p>';
  } else {
    const listDiv = document.createElement('div');
    listDiv.style = 'display:flex; flex-direction:column; gap:15px; max-height:600px; overflow-y:auto; padding-right:10px;';
    orders.forEach(order => {
      const d = new Date(order.orderdate).toLocaleString('th-TH');
      const orderDiv = document.createElement('div');
      orderDiv.style = 'border:1px solid #eee; border-radius:10px; padding:15px; background-color:#f9f9f9;';
      orderDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <strong style="color:#1a499b; font-size:16px;">Order: ${order.ordercode}</strong>
          <span style="color:#666; font-size:14px;">${d}</span>
        </div>
        <div style="font-size:13px; color:#666; margin-bottom:10px; background-color:#fff; padding:8px; border:1px dashed #ccc; border-radius:5px;">
          <strong>จัดส่งไปที่:</strong> ${order.shippingaddress || 'ไม่ระบุ'}
        </div>
        <ul style="padding-left:20px; color:#555; font-size:14px; margin-bottom:10px;">
          ${order.items && order.items.map(item=>`<li style="margin-bottom:5px;">${item.productName} <span style="color:#888">(x${item.qty})</span></li>`).join('')}
        </ul>
        <div style="text-align:right; font-weight:bold; color:#e31e24; font-size:16px;">ยอดชำระ: ฿${order.totalamount}</div>
      `;
      listDiv.appendChild(orderDiv);
    });
    right.appendChild(listDiv);
  }

  const wrapper = document.createElement('div');
  wrapper.style = 'display:flex; flex-wrap:wrap; gap:30px; align-items:flex-start;';
  wrapper.appendChild(left); 
  wrapper.appendChild(right);
  container.appendChild(wrapper);

  if (isEditing) {
    document.getElementById('profile-form').addEventListener('submit', handleSaveProfile);
    document.getElementById('cancel-edit').addEventListener('click', () => { isEditing = false; render(); });
  } else {
    document.getElementById('edit-btn').addEventListener('click', () => { isEditing = true; render(); });
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) return;
  const form = e.target;
  
  const payload = {
    firstname: form.firstname.value,
    lastname: form.lastname.value,
    phone: form.phone.value,
    email: form.email.value,
    address: form.address.value
  };

  try {
    const res = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!');
      fetchProfile();
      isEditing = false;
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  } catch(err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
}

document.addEventListener('DOMContentLoaded', fetchProfile);