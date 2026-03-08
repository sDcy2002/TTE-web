import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Footer from './components/Footer'; 

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    setCartCount(count);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (token && savedUser) {
      setUser(savedUser); 
    }
    
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    window.location.href = '/'; 
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* ---------------- Navbar (ดีไซน์คลีนๆ ไม่มี Dropdown แล้ว) ---------------- */}
        <nav style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '15px 5%', backgroundColor: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100
        }}>
          
          <Link to="/" className="text-gradient" style={{ textDecoration: 'none', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
            TTE-STORE
          </Link>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#333', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            
            {/* เปลี่ยนกลับเป็นลิงก์ธรรมดา */}
            <Link to="/products" style={{ color: '#333', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>
              Products
            </Link>
            
            <Link to="/cart" style={{ color: '#333', textDecoration: 'none', fontSize: '16px', fontWeight: '500', position: 'relative', padding: '10px 0' }}>
              Cart
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '0px', right: '-15px',
                  backgroundColor: '#e31e24', color: 'white',
                  fontSize: '11px', fontWeight: 'bold',
                  padding: '2px 6px', borderRadius: '50px',
                  minWidth: '18px', textAlign: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/profile" style={{ textDecoration: 'none', fontSize: '15px', color: '#666', borderBottom: '1px solid transparent', paddingBottom: '2px', transition: '0.2s' }} onMouseOver={(e)=>e.target.style.borderBottom='1px solid #1a499b'} onMouseOut={(e)=>e.target.style.borderBottom='1px solid transparent'}>
                  สวัสดี, <strong className="text-gradient">{user}</strong>
                </Link>
                <button onClick={handleLogout} style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: 'transparent', color: '#e31e24', border: '1px solid #e31e24', borderRadius: '50px', fontSize: '14px', fontWeight: '500' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/register" className="bg-gradient" style={{ textDecoration: 'none', padding: '10px 25px', borderRadius: '50px', fontSize: '15px', fontWeight: '500' }}>
                Login / Register
              </Link>
            )}
          </div>
        </nav>

        {/* ---------------- พื้นที่แสดงผล ---------------- */}
        <div className="page-container" style={{ flex: 1, width: '100%' }}> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} /> 
            <Route path="/cart" element={<Cart />} /> 
            <Route path="/register" element={<Register />} /> 
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;