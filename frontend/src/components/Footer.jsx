import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #eee',
      padding: '50px 5% 20px',
      marginTop: 'auto', // คำสั่งนี้จะดัน Footer ให้ไปอยู่ล่างสุดเสมอโดยไม่ทับเนื้อหา
      width: '100%'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '30px' }}>
        
        {/* คอลัมน์ 1: โลโก้และข้อมูลร้าน */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 className="text-gradient" style={{ margin: '0 0 15px 0', fontSize: '24px', letterSpacing: '1px' }}>
            TTE-STORE
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', maxWidth: '300px' }}>
            แหล่งรวมอุปกรณ์และตัวเชื่อมคุณภาพเยี่ยม มั่นใจได้ในมาตรฐานและการบริการที่รวดเร็ว ตอบโจทย์ทุกงานช่างของคุณ
          </p>
        </div>

        {/* คอลัมน์ 2: เมนูลัด */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px' }}>เมนูลัด</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>หน้าแรก</Link></li>
            <li><Link to="/products" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>สินค้าทั้งหมด</Link></li>
            <li><Link to="/cart" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>ตะกร้าสินค้า</Link></li>
          </ul>
        </div>

        {/* คอลัมน์ 3: ติดต่อเรา */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px' }}>ติดต่อเรา</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', color: '#666', fontSize: '14px' }}>
            <li>📍 มจพ. ปราจีนบุรี (KMUTNB)</li>
            <li>📞 08X-XXX-XXXX</li>
            <li>✉️ s6606022630057@kmutnb.ac.th</li>
          </ul>
        </div>
      </div>

      {/* ส่วนลิขสิทธิ์ด้านล่างสุด */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', color: '#888', fontSize: '13px' }}>
        &copy; {currentYear} TTE-STORE. All rights reserved. Designed for Information and Network Engineering.
      </div>
    </footer>
  );
}

export default Footer;