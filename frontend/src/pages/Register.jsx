import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // ดึง Axios ที่เราตั้งค่าไว้มาใช้

function Register() {
  const [isLoginMode, setIsLoginMode] = useState(false); // State สลับโหมด Register / Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        // --- โหมดเข้าสู่ระบบ (Login) ---
        const response = await api.post('/auth/login', { username, password });
        
        // เก็บ Token และ Username ลงใน localStorage
        localStorage.setItem('token', response.data.token); 
        localStorage.setItem('username', username); // <--- เพิ่มบรรทัดนี้เพื่อเก็บชื่อ User
        
        alert('เข้าสู่ระบบสำเร็จ!');
        
        // ใช้ window.location.href แทน navigate เพื่อบังคับให้ React รีเฟรชและดึงค่า Navbar ใหม่
        window.location.href = '/products'; 
      } else {
        // --- โหมดสมัครสมาชิก (Register) ---
        await api.post('/auth/register', { username, password });
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        
        // สลับเป็นโหมด Login อัตโนมัติและล้างช่องรหัสผ่าน
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      // แจ้งเตือน Error ที่ส่งมาจาก Backend
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>{isLoginMode ? 'เข้าสู่ระบบ (Login)' : 'สมัครสมาชิก (Register)'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isLoginMode ? 'Login' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        {isLoginMode ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้วใช่ไหม? "}
        <span 
          onClick={() => setIsLoginMode(!isLoginMode)} 
          style={{ color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLoginMode ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบที่นี่'}
        </span>
      </p>
    </div>
  );
}

export default Register;