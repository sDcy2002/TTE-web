let isLoginMode = true;

function updateForm() {
  const title = document.querySelector('.page-container h2');
  const submitBtn = document.querySelector('#auth-form button[type=submit]');
  const toggleText = document.getElementById('toggle-text');
  const toggleLink = document.getElementById('toggle-link');

  title.textContent = isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
  submitBtn.textContent = isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
  toggleText.textContent = isLoginMode ? 'ยังไม่มีบัญชีใช่ไหม? ' : 'มีบัญชีอยู่แล้ว? ';
  toggleLink.textContent = isLoginMode ? 'สมัครเลย' : 'เข้าสู่ระบบ';
}

async function handleSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const data = { username, password };
  
  try {
    if (isLoginMode) {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (!res.ok) throw body;
      
      localStorage.setItem('token', body.token);
      localStorage.setItem('username', body.username);
      localStorage.setItem('role', body.role);
      
      alert(`ยินดีต้อนรับ ${body.username}!`);
      window.location.href = '/';
    } else {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      isLoginMode = true;
      updateForm();
    }
  } catch (err) {
    alert(err.message || err || 'เกิดข้อผิดพลาด');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateForm();
  document.getElementById('auth-form').addEventListener('submit', handleSubmit);
  document.getElementById('toggle-link').addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    updateForm();
  });
});