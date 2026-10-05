"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProduct, deleteProduct } from "@/lib/products";
import type { Product } from "@/lib/products";

export default function DeleteProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // รับค่ารหัสสินค้า (id) มาจาก URL ในรูปแบบ Promise
}) {
  const { id } = use(params); // ดึง id จาก Promise
  const router = useRouter(); // การนำทาง (navigation) หลังจากลบสินค้า
  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    getProduct(id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]); // ดึงข้อมูลสินค้าตาม id ที่ได้ แล้วอัปเดตลง State พร้อมปิดสถานะโหลด

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "60px", fontFamily: "sans-serif" }}>กำลังโหลดข้อมูล...</p>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px", fontFamily: "sans-serif" }}>
        <h2>ไม่พบสินค้า</h2>
        <Link href="/">กลับหน้าแรก</Link>
      </div>
    );
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    try {
      await deleteProduct(id);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  } // ป้องกันรีเฟรชหน้า -> สั่งลบสินค้า -> พาเด้งกลับหน้าแรก -> รีเฟรชข้อมูลหน้าเว็บ

  return (
    <main style={{ maxWidth: "500px", margin: "60px auto", padding: "30px", fontFamily: "sans-serif", border: "1px solid #ddd", borderRadius: "8px", background: "#fff" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#dc2626", marginBottom: "15px" }}>ยืนยันการลบสินค้า</h1>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        คุณต้องการลบสินค้า <strong>&quot;{product.title}&quot;</strong> นี้ใช่หรือไม่?
      </p>
      <form onSubmit={handleDelete} style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          style={{ flex: 1, padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          ยืนยันการลบ
        </button>
        <Link
          href="/"
          style={{ flex: 1, padding: "10px", background: "#fff", color: "#333", border: "1px solid #ccc", borderRadius: "4px", textAlign: "center", textDecoration: "none", fontWeight: "bold", boxSizing: "border-box" }}
        >
          ยกเลิก
        </Link>
      </form>
    </main>
  );
}