import { useState, useEffect } from 'react';
import api from '../api';

function Profile() {
  const [profile, setProfile] = useState({ firstname: '', lastname: '', phone: '', email: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProfile = await api.get('/users/profile');
        if (resProfile.data) setProfile(prev => ({ ...prev, ...resProfile.data }));
        
        const resOrders = await api.get('/orders/my-orders');
        setOrders(resOrders.data);
      } catch (error) {
        console.error("Fetch Data Error", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profile);
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!');
      setIsEditing(false); 
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div>
      <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>บัญชีของฉัน</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* ----- ฝั่งซ้าย: ข้อมูลส่วนตัว / ที่อยู่จัดส่ง ----- */}
        <div style={{ flex: '1 1 350px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: '#1a499b', margin: 0 }}>ข้อมูลส่วนตัว / ที่อยู่ตั้งต้น</h3>
            
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#e31e24', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', textDecoration: 'underline' }}>
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <input type="text" name="firstname" placeholder="ชื่อจริง" value={profile.firstname || ''} onChange={handleChange} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a499b' }} />
                <input type="text" name="lastname" placeholder="นามสกุล" value={profile.lastname || ''} onChange={handleChange} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a499b' }} />
              </div>
              <input type="text" name="phone" placeholder="เบอร์โทรศัพท์" value={profile.phone || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a499b' }} />
              <input type="email" name="email" placeholder="อีเมล (ถ้ามี)" value={profile.email || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a499b' }} />
              <textarea name="address" placeholder="ที่อยู่จัดส่งเริ่มต้น (จะถูกดึงไปใช้อัตโนมัติตอนสั่งซื้อ)" value={profile.address || ''} onChange={handleChange} rows="4" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outlineColor: '#1a499b', resize: 'vertical' }}></textarea>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>ยกเลิก</button>
                <button type="submit" className="bg-gradient" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>บันทึกข้อมูล</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#444', fontSize: '16px' }}>
              <p><strong>ชื่อ-นามสกุล:</strong> {profile.firstname || '-'} {profile.lastname || '-'}</p>
              <p><strong>เบอร์โทรศัพท์:</strong> {profile.phone || '-'}</p>
              <p><strong>อีเมล:</strong> {profile.email || '-'}</p>
              <div>
                <strong>ที่อยู่จัดส่งเริ่มต้น:</strong>
                <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee', lineHeight: '1.6', color: profile.address ? '#555' : '#999' }}>
                  {profile.address || 'คุณยังไม่ได้ระบุที่อยู่จัดส่ง (สามารถระบุตอนสั่งซื้อได้)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ----- ฝั่งขวา: ประวัติการสั่งซื้อ ----- */}
        <div style={{ flex: '2 1 500px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '20px', color: '#e31e24' }}>ประวัติการสั่งซื้อของคุณ</h3>
          
          {orders.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '30px 0' }}>คุณยังไม่มีประวัติการสั่งซื้อครับ</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
              {orders.map((order) => {
                const dateObj = new Date(order.orderdate);
                const displayDate = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ color: '#1a499b', fontSize: '16px' }}>Order: {order.ordercode}</strong>
                      <span style={{ color: '#666', fontSize: '14px' }}>{displayDate}</span>
                    </div>
                    
                    {/* โชว์ที่อยู่ของออเดอร์นี้ */}
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', backgroundColor: '#fff', padding: '8px', border: '1px dashed #ccc', borderRadius: '5px' }}>
                      <strong>จัดส่งไปที่:</strong> {order.shippingaddress || 'ไม่ระบุ'}
                    </div>

                    <ul style={{ paddingLeft: '20px', color: '#555', fontSize: '14px', marginBottom: '10px' }}>
                      {order.items && order.items.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>
                          {item.productName} <span style={{ color: '#888' }}>(x{item.qty})</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#e31e24', fontSize: '16px' }}>
                      ยอดชำระ: ฿{order.totalamount}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;