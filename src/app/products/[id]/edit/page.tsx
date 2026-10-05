"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProduct, updateProduct } from "@/lib/products";
import type { Product } from "@/lib/products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ดึง id จาก Promise
  const router = useRouter(); // การนำทาง (navigation) หลังจากแก้ไขสินค้า
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]); // ดึงข้อมูลสินค้าตาม id ที่ได้ แล้วอัปเดตลง State พร้อมปิดสถานะโหลด

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "60px", fontFamily: "sans-serif", color: "#64748b" }}>กำลังโหลดข้อมูล...</p>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px", fontFamily: "sans-serif", color: "#1e293b" }}>
        <h2 style={{ marginBottom: "12px" }}>ไม่พบสินค้า</h2>
        <Link href="/" style={{ color: "#0284c7", textDecoration: "none", fontWeight: "500" }}>กลับหน้าแรก</Link>
      </div>
    );
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;

    await updateProduct(id, { title, price, description });
    router.push("/");
    router.refresh();
  } //ป้องกันรีเฟรชหน้า -> ดึงค่าจากฟอร์ม -> สั่งอัปเดตข้อมูล -> พาเด้งกลับหน้าแรกและรีเฟรชข้อมูล

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box" as const,
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
    background: "#ffffff",
  };

  return (
    <main style={{ maxWidth: "900px", margin: "60px auto", padding: "40px", fontFamily: "sans-serif", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "28px", color: "#0f172a" }}>แก้ไขข้อมูลสินค้า</h1>
      
      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        
        {/* ชื่อสินค้า */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>ชื่อสินค้า</label>
          <input
            name="title"
            defaultValue={product.title}
            required
            style={inputStyle}
          />
        </div>

        {/* ราคา */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>ราคา</label>
          <input
            name="price"
            type="number"
            step="any"
            defaultValue={product.price}
            required
            style={inputStyle}
          />
        </div>

        {/* รายละเอียด */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>รายละเอียด</label>
          <textarea
            name="description"
            defaultValue={product.description || ""}
            rows={5}
            style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
          />
        </div>

        {/* ปุ่มควบคุม */}
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "15px",
              whiteSpace: "nowrap" // บังคับให้เป็นบรรทัดเดียว ไม่ตัดคำ
            }}
          >
            บันทึกการแก้ไข
          </button>
          
          <Link
            href="/"
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              textAlign: "center",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "15px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap"
            }}
          >
            ยกเลิก
          </Link>
        </div>

      </form>
    </main>
  );
}