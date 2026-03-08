import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [quantities, setQuantities] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 
  
  const categoryParam = searchParams.get('category'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        
        setProducts(resProducts.data);
        setCategories(resCategories.data); 
        
        const initialQtys = {};
        resProducts.data.forEach(p => {
          initialQtys[p.id] = 1;
        });
        setQuantities(initialQtys);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, searchKeyword]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleQtyChange = (id, value, maxStock) => {
    let val = parseInt(value) || 1;
    if (val > maxStock) val = maxStock;
    if (val < 1) val = 1;
    setQuantities(prev => ({ ...prev, [id]: val }));
  };

  const addToCart = (product) => {
    const stock = product.stockquantity || 0;
    if (stock === 0) {
      alert("ขออภัย สินค้านี้หมดชั่วคราวครับ");
      return;
    }

    const selectedQty = quantities[product.id] || 1;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    const currentCartQty = existingItemIndex >= 0 ? cart[existingItemIndex].qty : 0;

    if (currentCartQty + selectedQty > stock) {
      alert(`คุณมีสินค้านี้ในตะกร้าแล้ว ${currentCartQty} ชิ้น สั่งเพิ่มได้อีกแค่ ${stock - currentCartQty} ชิ้นครับ`);
      return;
    }

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].qty += selectedQty;
      cart[existingItemIndex].imageUrl = product.imageurl || product.imageUrl; 
    } else {
      cart.push({ 
        id: product.id, 
        productName: product.productname || product.productName, 
        price: Number(product.price), 
        qty: selectedQty,
        imageUrl: product.imageurl || product.imageUrl 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated')); 
    alert(`เพิ่ม "${product.productname || product.productName}" จำนวน ${selectedQty} ชิ้น ลงในตะกร้าแล้ว!`);
  };

  const filteredProducts = products.filter((product) => {
    const matchCategory = categoryParam 
      ? parseInt(product.categoryid) === parseInt(categoryParam) || parseInt(product.categoryId) === parseInt(categoryParam)
      : true;

    const keyword = searchKeyword.toLowerCase();
    const matchProductName = (product.productname || product.productName || '').toLowerCase().includes(keyword);
    
    const productCat = categories.find(c => parseInt(c.id) === parseInt(product.categoryid || product.categoryId));
    const matchCategoryName = productCat && (productCat.categoryname || productCat.categoryName || '').toLowerCase().includes(keyword);

    const matchSearch = matchProductName || matchCategoryName;

    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  let pageTitle = "สินค้าทั้งหมด";
  if (categoryParam) {
    const activeCategory = categories.find(c => parseInt(c.id) === parseInt(categoryParam));
    if (activeCategory) {
      pageTitle = activeCategory.categoryname || activeCategory.categoryName;
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2%', color: '#333' }}>
      
      {/* 🌟 ชุดคำสั่ง CSS สำหรับจัดการ Responsive ทั้งหมวดหมู่ และ ตะแกรงสินค้า */}
      <style>{`
        .products-layout {
          display: flex;
          flex-direction: row;
          gap: 30px;
          align-items: flex-start;
        }
        .category-sidebar {
          flex: 0 0 260px;
          background-color: #fff;
          padding: 20px;
          border-radius: 15px;
          border: 1px solid #eee;
          box-shadow: 0 5px 15px rgba(0,0,0,0.02);
        }
        .category-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-btn {
          text-align: left;
          padding: 12px 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          font-size: 15px;
          display: block;
          width: 100%;
        }
        .category-btn:hover {
          filter: brightness(0.95);
        }

        /* ตะแกรงสินค้าสำหรับจอคอม (ปรับขนาดอัตโนมัติ) */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* 📱 กฎสำหรับหน้าจอที่เล็กกว่า 992px (Tablet & Mobile) */
        @media (max-width: 992px) {
          .products-layout {
            flex-direction: column; 
          }
          .category-sidebar {
            flex: none;
            width: 100%;
            padding: 15px;
            box-sizing: border-box;
          }
          .category-title {
            display: none; 
          }
          .category-menu {
            flex-direction: row; 
            overflow-x: auto; 
            padding-bottom: 10px;
            -webkit-overflow-scrolling: touch; 
          }
          .category-btn {
            white-space: nowrap; 
            flex-shrink: 0; 
            width: auto;
            border-radius: 50px; 
            padding: 10px 25px;
            border: 1px solid #eee;
          }
        }

        /* 📱 กฎพิเศษสำหรับหน้าจอมือถือโดยเฉพาะ (บีบเป็น 2 คอลัมน์) */
        @media (max-width: 600px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr); /* บังคับให้เป็น 2 ชิ้นต่อแถว */
            gap: 12px; /* ลดช่องว่างลงนิดนึง */
          }
          .product-card {
            padding: 12px !important; /* ลด padding กล่องให้บางลง */
          }
          .product-image {
            height: 120px !important; /* ย่อรูปให้พอดีกับจอ 2 คอลัมน์ */
            margin-bottom: 10px !important;
          }
          .product-title {
            font-size: 14px !important; /* ลดขนาดชื่อสินค้า */
          }
          .product-price {
            font-size: 1.1rem !important; /* ลดขนาดราคา */
          }
          .action-container {
            flex-wrap: wrap; /* ถ้าปุ่มเบียดกันมากให้ปัดลงบรรทัดใหม่ */
          }
          .qty-input {
            width: 45px !important; /* ย่อช่องตัวเลข */
            padding: 8px 4px !important;
            font-size: 13px !important;
          }
          .add-cart-btn {
            padding: 8px 5px !important; /* ย่อปุ่มหยิบใส่ตะกร้า */
            font-size: 13px !important;
          }
        }

        /* ตกแต่ง Scrollbar แนวนอน */
        .category-menu::-webkit-scrollbar { height: 6px; }
        .category-menu::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .category-menu::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        .category-menu::-webkit-scrollbar-thumb:hover { background: #1a499b; }
      `}</style>

      <h2 className="text-gradient" style={{ textAlign: 'center', margin: '30px 0 40px 0', fontSize: '2rem' }}>
        {pageTitle}
      </h2>
      
      <div className="products-layout">
        
        {/* ----- ฝั่งซ้าย (หรือด้านบน): Sidebar หมวดหมู่ ----- */}
        <div className="category-sidebar">
          <h3 className="category-title" style={{ color: '#333', marginBottom: '15px', fontSize: '18px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
            หมวดหมู่สินค้า
          </h3>

          <div className="category-menu">
            <button
              className="category-btn"
              onClick={() => { setSearchParams({}); setSearchKeyword(''); }}
              style={{ 
                backgroundColor: !categoryParam ? '#1a499b' : '#f8f9fa', 
                color: !categoryParam ? '#fff' : '#555', 
                fontWeight: !categoryParam ? 'bold' : 'normal'
              }}
            >
              🌟 สินค้าทั้งหมด
            </button>
            
            {categories.map(cat => {
              const isActive = parseInt(categoryParam) === parseInt(cat.id);
              return (
                <button
                  key={cat.id}
                  className="category-btn"
                  onClick={() => { setSearchParams({ category: cat.id }); setSearchKeyword(''); }}
                  style={{ 
                    backgroundColor: isActive ? '#1a499b' : '#f8f9fa', 
                    color: isActive ? '#fff' : '#555', 
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}
                >
                  📌 {cat.categoryname || cat.categoryName}
                </button>
              )
            })}
          </div>
        </div>

        {/* ----- ฝั่งขวา (หรือด้านล่าง): ค้นหา + สินค้า + แบ่งหน้า ----- */}
        <div style={{ flex: '1 1 700px', minWidth: 0 }}>
          
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '50px', padding: '5px 20px', border: '1px solid #ddd', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '20px', marginRight: '10px' }}>🔍</span>
            <input
              type="text"
              placeholder="ค้นหาชื่ออุปกรณ์ หรือ ชื่อหมวดหมู่..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ flex: 1, padding: '12px 0', border: 'none', fontSize: '16px', outline: 'none', backgroundColor: 'transparent' }}
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '16px', fontWeight: 'bold' }}>✕</button>
            )}
          </div>

          {currentProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <p style={{ color: '#999', fontSize: '18px' }}>ไม่พบสินค้าที่ค้นหา</p>
            </div>
          ) : (
            <>
              {/* ตะแกรงแสดงสินค้า เรียกใช้ class product-grid */}
              <div className="product-grid">
                {currentProducts.map((product) => {
                  const stock = product.stockquantity || 0; 
                  const isOutOfStock = stock === 0;

                  const fileName = product.imageurl || product.imageUrl;
                  const fullImageUrl = fileName ? `http://localhost:5000/uploads/${fileName}` : 'https://via.placeholder.com/150?text=No+Image';

                  return (
                    <div key={product.id} className="product-card" style={{ 
                      border: '1px solid #eee', padding: '15px', borderRadius: '15px', textAlign: 'center', 
                      backgroundColor: '#fff', opacity: isOutOfStock ? 0.6 : 1,
                      boxShadow: '0 5px 15px rgba(0,0,0,0.03)', transition: 'transform 0.2s',
                      display: 'flex', flexDirection: 'column'
                    }}>
                      <img 
                        src={fullImageUrl} 
                        alt={product.productname || product.productName} 
                        className="product-image"
                        style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '10px', marginBottom: '15px' }} 
                      />
                      
                      <h3 className="product-title" style={{ margin: '10px 0', fontSize: '16px', color: '#333', flex: 1 }}>{product.productname || product.productName}</h3>
                      <p className="product-price" style={{ color: '#1a499b', fontWeight: 'bold', fontSize: '1.2rem', margin: '5px 0' }}>฿{product.price}</p>
                      
                      <p style={{ margin: '10px 0', color: isOutOfStock ? '#e31e24' : '#666', fontSize: '13px', backgroundColor: '#f9f9f9', padding: '5px', borderRadius: '5px' }}>
                        {isOutOfStock ? 'สินค้าหมดชั่วคราว' : `สต๊อกคงเหลือ: ${stock} ชิ้น`}
                      </p>
                      
                      <div className="action-container" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <input type="number" min="1" max={stock} disabled={isOutOfStock} value={quantities[product.id] || 1} onChange={(e) => handleQtyChange(product.id, e.target.value, stock)}
                          className="qty-input"
                          style={{ width: '50px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', fontSize: '14px', outline: 'none' }}
                        />
                        <button onClick={() => addToCart(product)} disabled={isOutOfStock}
                          className={`add-cart-btn ${isOutOfStock ? "" : "bg-gradient"}`}
                          style={{ flex: 1, backgroundColor: isOutOfStock ? '#ccc' : 'transparent', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}
                        >
                          ใส่ตะกร้า
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '40px', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#ccc' : '#555', fontWeight: '500' }}
                  >
                    &laquo; ก่อนหน้า
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{ 
                        padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: 'none',
                        backgroundColor: currentPage === page ? '#1a499b' : '#f0f0f0',
                        color: currentPage === page ? '#fff' : '#555'
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#ccc' : '#555', fontWeight: '500' }}
                  >
                    ถัดไป &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Products;