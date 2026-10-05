"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultQuery, fetchProducts, getLocalProducts, saveLocalProducts } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import ProductSearchForm from "@/components/ProductSearchForm";
import ProductForm from "@/components/ProductForm";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [products, setProducts] = useState<Product[]>([]); // เก็บรายการสินค้า
    const [status, setStatus] = useState<LoadState>("loading"); 
    const [errorMessage, setErrorMessage] = useState("");  

    function loadAllProducts(list: ProductList) {
        const localItems = getLocalProducts(); // ดึงสินค้าที่สร้างใหม่จาก LocalStorage ของเครื่อง
        const combined = [...localItems, ...list.products.filter(p => !localItems.some(l => l.id === p.id))]; // รวมสินค้าที่ดึงจาก API กับสินค้าที่สร้างใหม่ในเครื่อง (ไม่ซ้ำกัน)
        setProducts(combined);  // อัปเดตรายการสินค้าใน State
        setStatus("ready"); // เปลี่ยนสถานะเป็น "ready" หลังโหลดข้อมูลสำเร็จ
    }

    useEffect(() => {
        fetchProducts(defaultQuery)
            .then(list => loadAllProducts(list))
            .catch(showError);
    }, []); // โหลดข้อมูลสินค้าครั้งแรกเมื่อคอมโพเนนต์ถูกสร้างขึ้น

    function showError(error: unknown) {
        setErrorMessage(
            error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
        );
        setStatus("error"); 
    }

    async function loadProducts(query: SearchQuery) {
        setStatus("loading");
        setErrorMessage("");

        try {
            const list = await fetchProducts(query);
            loadAllProducts(list);
        } catch (error) {
            showError(error);
        }
    } // โหลดข้อมูลสินค้าตามเงื่อนไขค้นหา (query) และอัปเดต State ของคอมโพเนนต์

    function saveProduct(draft: ProductDraft) {
        if (!isLoggedIn) {
            alert("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
            return;
        }

        const newProduct: Product = {
            ...draft,
            id: Date.now(),
            thumbnail: "https://via.placeholder.com/150",
            rating: draft.rating || 5.0,
            category: draft.category || "GENERAL",
            description: draft.description || ""
        };

        const updatedLocal = [newProduct, ...getLocalProducts()];
        saveLocalProducts(updatedLocal);
        setProducts([newProduct, ...products]);
    } // บันทึกสินค้าใหม่ (เช็กสถานะล็อกอิน -> สร้างข้อมูลสินค้าใหม่ด้วยไอดีเวลาปัจจุบัน -> บันทึกลง LocalStorage และอัปเดตหน้าจอ)

    return (
        <main style={{ width: '100%', margin: '20px 0', padding: '0 24px', fontFamily: 'sans-serif', color: '#1e293b', boxSizing: 'border-box' }}>
            
            {/* หัวข้อ "รายการสินค้า" และปุ่มโหลดข้อมูลใหม่ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                    รายการสินค้า
                </h1>
                <button
                    type="button"
                    onClick={() => loadProducts(defaultQuery)}
                    disabled={status === "loading"}
                    style={{ 
                        fontSize: '13px', 
                        padding: '6px 14px', 
                        cursor: 'pointer', 
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                >
                    {status === "loading" ? "กำลังโหลด..." : "โหลดข้อมูลใหม่"}
                </button>
            </div>

            {/* ฟอร์มค้นหา */}
            <div style={{ width: '100%' }}>
                <ProductSearchForm onSearch={loadProducts} />
            </div>

            {/* ➕ ฟอร์มเพิ่มสินค้าใหม่ (ย้ายขึ้นมาไว้ด้านบนก่อนแสดงรายการสินค้า และมีกรอบ/หัวข้ออันเดียว) */}
            {isLoggedIn && (
                <div style={{ margin: '30px 0', background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <ProductForm
                        editing={null}
                        onSave={saveProduct}
                        onCancel={() => {}}
                    />
                </div>
            )}

            {/* ส่วนแสดงรายการสินค้า */}
            <section aria-live="polite" style={{ marginTop: '30px', minHeight: '400px' }}>
                {status === "loading" && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px', fontSize: '16px' }}>กำลังโหลดข้อมูลสินค้า...</p>}
                {status === "error" && <p role="alert" style={{ color: '#ef4444', textAlign: 'center', padding: '40px', fontSize: '16px' }}>{errorMessage}</p>}
                {status === "ready" && products.length === 0 && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '40px', fontSize: '16px' }}>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                )}

                {status === "ready" && products.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {products.map((item) => (
                            <div key={item.id} className="product-card" style={{ padding: '16px', minHeight: '360px' }}>
                                <div>
                                    <div className="product-image-container" style={{ height: '160px', borderRadius: '8px', background: '#f8fafc', marginBottom: '12px' }}>
                                        <img
                                            src={item.thumbnail || "https://via.placeholder.com/150"}
                                            alt={item.title}
                                            className="product-image"
                                        />
                                    </div>

                                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                        {item.category}
                                    </span>

                                    <h3 style={{ 
                                        fontSize: '14px', 
                                        fontWeight: '600', 
                                        margin: '6px 0 10px 0', 
                                        color: '#1e293b', 
                                        minHeight: '40px', 
                                        maxHeight: '40px', 
                                        lineHeight: '20px', 
                                        overflow: 'hidden', 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2, 
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {item.title}
                                    </h3>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '15px' }}>฿{item.price.toLocaleString()}</span>
                                        <span style={{ color: '#64748b', fontSize: '12px' }}>คงเหลือ: {item.stock}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#eab308', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                        <span>⭐ {item.rating ? Number(item.rating).toFixed(1) : '4.5'}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: isLoggedIn ? '1px solid #f1f5f9' : 'none' }}>
                                    {isLoggedIn ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link
                                                href={`/products/${item.id}/edit`}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 10px',
                                                    fontSize: '12px',
                                                    textAlign: 'center',
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    background: '#ffffff',
                                                    color: '#334155',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                แก้ไข
                                            </Link>
                                            
                                            <Link
                                                href={`/products/${item.id}/delete`}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 10px',
                                                    fontSize: '12px',
                                                    textAlign: 'center',
                                                    borderRadius: '6px',
                                                    border: '1px solid #fecaca',
                                                    background: '#fef2f2',
                                                    color: '#ef4444',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                ลบ
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}