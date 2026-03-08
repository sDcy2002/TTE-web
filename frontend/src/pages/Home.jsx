import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '60px' }}>
      
      {/* ส่วนหัว (Hero Section) */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Welcome to <span className="text-gradient" style={{ fontWeight: 'bold' }}>TTE-Store</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto 30px' }}>
          แหล่งรวมสินค้าคุณภาพดีเยี่ยม พร้อมบริการจัดส่งที่รวดเร็วและปลอดภัย ตอบโจทย์ทุกความต้องการของคุณ
        </p>
        <Link to="/products" className="bg-gradient" style={{ textDecoration: 'none', padding: '12px 30px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '500', display: 'inline-block' }}>
          เลือกซื้อสินค้าเลย
        </Link>
      </div>

      {/* เนื้อหาที่ต้อง Scroll Down ลงมาอ่าน (Flexible Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
        <div style={{ padding: '30px', backgroundColor: '#f9fafb', borderRadius: '15px', border: '1px solid #eee' }}>
          <h3 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>สินค้าคุณภาพสูง</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>เราคัดสรรเฉพาะสินค้าที่มีมาตรฐาน จากผู้ผลิตที่เชื่อถือได้ เพื่อให้คุณได้รับสิ่งที่ดีที่สุดเสมอ ไม่ว่าจะเป็นอุปกรณ์เครื่องมือ หรือของใช้ต่างๆ</p>
        </div>
        <div style={{ padding: '30px', backgroundColor: '#f9fafb', borderRadius: '15px', border: '1px solid #eee' }}>
          <h3 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>ระบบตัดสต๊อกแม่นยำ</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>มั่นใจได้ว่าสินค้าที่คุณสั่งซื้อมีพร้อมส่งเสมอ ด้วยระบบจัดการคลังสินค้าแบบ Real-time ของเรา ซื้อปุ๊บ ตัดสต๊อกปั๊บ ไร้ปัญหาสินค้าหมด</p>
        </div>
        <div style={{ padding: '30px', backgroundColor: '#f9fafb', borderRadius: '15px', border: '1px solid #eee' }}>
          <h3 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>บริการหลังการขาย</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>ทีมงานของเราพร้อมดูแลคุณตลอดเวลา หากพบปัญหาสามารถติดต่อเราได้ทันที ความพึงพอใจของคุณคือเป้าหมายสูงสุดของเรา</p>
        </div>
      </div>

      {/* ทดสอบเพิ่มเนื้อหายาวๆ เพื่อให้ Scroll ได้ */}
      <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eaeaea', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>ทำไมต้องเลือก TTE-Store?</h2>
        <p style={{ color: '#666', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
          ในยุคดิจิทัล การเลือกซื้อสินค้าออนไลน์กลายเป็นเรื่องปกติ แต่การหาร้านค้าที่ไว้ใจได้นั้นไม่ใช่เรื่องง่าย TTE-Store มุ่งมั่นที่จะสร้างประสบการณ์การช้อปปิ้งออนไลน์ที่ไร้รอยต่อ ปลอดภัย และรวดเร็ว ด้วยเทคโนโลยี Web Application ที่ทันสมัยที่สุด เพื่อให้ลูกค้าของเราทุกคนได้รับความสะดวกสบายสูงสุด...
        </p>
      </div>

    </div>
  );
}

export default Home;