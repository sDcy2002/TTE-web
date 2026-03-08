import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  
  // เพิ่ม State สำหรับเก็บที่อยู่จัดส่ง
  const [shippingAddress, setShippingAddress] = useState('');
  
  const [receiptData, setReceiptData] = useState({
    orderId: 'รอดำเนินการ...',
    username: '',
    total: 0,
    items: []
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const triggerCartUpdate = () => {
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    triggerCartUpdate();
  };

  const updateQuantity = (id, delta) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 }; 
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    triggerCartUpdate();
  };

  // เมื่อกดเปิด Popup ให้ไปดึงที่อยู่จาก Profile มาเติมให้ก่อน
  const openPaymentModal = async () => {
    if (cartItems.length === 0) {
      alert("ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อนครับ");
      return;
    }

    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!token || !username) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อครับ");
      navigate('/register');
      return;
    }

    try {
      // ดึง Profile เพื่อเอาที่อยู่จัดส่งเริ่มต้น
      const res = await api.get('/users/profile');
      if (res.data && res.data.address) {
        setShippingAddress(res.data.address);
      } else {
        setShippingAddress(''); // ถ้าไม่มีก็ปล่อยว่างไว้ให้พิมพ์เอง
      }
    } catch (err) {
      console.error("ดึงข้อมูล Profile ไม่สำเร็จ", err);
    }

    const localTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    setReceiptData({
      orderId: 'รอดำเนินการ...',
      username: username,
      total: localTotal,
      items: cartItems
    });

    setIsCheckoutSuccess(false); 
    setIsModalOpen(true); 
  };

  // ส่งข้อมูลที่อยู่ไปพร้อมกับตะกร้า
  const handleConfirmPayment = async () => {
    if (!shippingAddress.trim()) {
      alert("กรุณาระบุที่อยู่จัดส่งสินค้าด้วยครับ!");
      return;
    }

    try {
      const response = await api.post('/cart/checkout', { 
        cart: cartItems, 
        shippingAddress: shippingAddress 
      });
      
      setReceiptData(prev => ({
        ...prev,
        total: response.data.total,
        orderId: response.data.orderId 
      }));

      setIsCheckoutSuccess(true);

    } catch (error) {
      console.error("Checkout Error:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
      setIsModalOpen(false); 
    }
  };

  const closeAndClear = () => {
    setIsModalOpen(false);
    setCartItems([]);
    localStorage.removeItem('cart'); 
    triggerCartUpdate(); 
    alert("ขอบคุณที่ใช้บริการครับ!");
    navigate('/profile'); 
  };

  const localTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: '#333' }}>
      <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>ตะกร้าสินค้าของคุณ</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
          <p style={{ color: '#999', fontSize: '18px', marginBottom: '20px' }}>ไม่มีสินค้าในตะกร้า</p>
          <button onClick={() => navigate('/products')} className="bg-gradient" style={{ border: 'none', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer', fontSize: '16px' }}>ไปเลือกช้อปเลย</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map((item) => {
              const fileName = item.imageUrl;
              const fullImageUrl = fileName ? `http://localhost:5000/uploads/${fileName}` : 'https://via.placeholder.com/150?text=No+Image';

              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    <img 
                      src={fullImageUrl} 
                      alt={item.productName} 
                      style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #f0f0f0', padding: '2px' }} 
                    />
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>{item.productName}</h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ราคาชิ้นละ: ฿{item.price}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '5px' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ backgroundColor: 'transparent', color: '#333', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px' }}>-</button>
                    <span style={{ fontSize: '16px', width: '30px', textAlign: 'center', fontWeight: '500' }}>{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ backgroundColor: 'transparent', color: '#333', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px' }}>+</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '150px', justifyContent: 'flex-end' }}>
                    <span className="text-gradient" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>฿{item.price * item.qty}</span>
                    <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: '#fff', color: '#e31e24', border: '1px solid #e31e24', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>ลบ</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '30px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '15px', border: '1px solid #eee', textAlign: 'right' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>ยอดชำระสุทธิ: <span className="text-gradient" style={{ fontWeight: 'bold' }}>฿{localTotal}</span></h3>
            <button onClick={openPaymentModal} className="bg-gradient" style={{ border: 'none', padding: '15px 40px', fontSize: '18px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}>
              สั่งซื้อสินค้า
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Modal / Popup Payment ---------------- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src="https://via.placeholder.com/150?text=Logo" alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '15px' }} />
            </div>

            <h2 className="text-gradient" style={{ textAlign: 'center', marginTop: 0, fontSize: '1.8rem' }}>
              {isCheckoutSuccess ? 'ทำรายการสำเร็จ!' : 'ยืนยันการสั่งซื้อ'}
            </h2>
            <hr style={{ borderTop: '1px dashed #ddd', margin: '20px 0' }} />
            
            <div style={{ margin: '20px 0', fontSize: '16px', color: '#444' }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>หมายเลขคำสั่งซื้อ:</strong> 
                <span style={{ float: 'right', color: isCheckoutSuccess ? '#1a499b' : '#999', fontWeight: isCheckoutSuccess ? 'bold' : 'normal' }}>
                  {receiptData.orderId}
                </span>
              </p>
              <p style={{ marginBottom: '20px' }}><strong>ชื่อลูกค้า:</strong> <span style={{ float: 'right' }}>{receiptData.username}</span></p>

              {/* ----- ช่องกรอกที่อยู่จัดส่ง ----- */}
              {!isCheckoutSuccess ? (
                <div style={{ marginBottom: '20px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                  <strong style={{ color: '#1a499b', display: 'block', marginBottom: '8px' }}>ที่อยู่จัดส่ง:</strong>
                  <textarea 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="กรุณากรอกที่อยู่จัดส่งอย่างละเอียด..."
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outlineColor: '#1a499b', resize: 'vertical' }}
                  ></textarea>
                </div>
              ) : (
                <div style={{ marginBottom: '20px', backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '10px', border: '1px solid #c3e6cb' }}>
                  <strong style={{ color: '#28a745', display: 'block', marginBottom: '5px' }}>จัดส่งไปยัง:</strong>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{shippingAddress}</p>
                </div>
              )}
              
              <h4 style={{ marginBottom: '15px', color: '#1a499b' }}>รายการสินค้า:</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {receiptData.items.map((item, index) => (
                  <li key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.productName} <span style={{ color: '#888' }}>(x{item.qty})</span></span>
                    <span style={{ fontWeight: '500' }}>฿{item.price * item.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr style={{ borderTop: '1px dashed #ddd', margin: '20px 0' }} />
            <h3 style={{ textAlign: 'right', fontSize: '1.5rem', color: '#333' }}>
              รวมทั้งสิ้น: <span className="text-gradient">฿{receiptData.total}</span>
            </h3>

            {isCheckoutSuccess ? (
              <button onClick={closeAndClear} className="bg-gradient" style={{ width: '100%', border: 'none', padding: '15px', fontSize: '18px', borderRadius: '50px', cursor: 'pointer', marginTop: '30px', fontWeight: 'bold' }}>
                ปิดหน้าต่าง
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, backgroundColor: '#fff', color: '#666', border: '1px solid #ccc', padding: '15px', fontSize: '16px', borderRadius: '50px', cursor: 'pointer', fontWeight: '500' }}>
                  ยกเลิก
                </button>
                <button onClick={handleConfirmPayment} className="bg-gradient" style={{ flex: 1, border: 'none', padding: '15px', fontSize: '16px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ยืนยันชำระเงิน
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;