import { auth } from "@/auth";
import { getProducts } from "@/lib/products";
import { AuthButtons } from "@/components/auth-buttons";
import ProductExplorer from "@/components/ProductExplorer";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main style={{ padding: "30px 40px", width: "100%", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* ส่วนหัว (Header) ดีไซน์ใหม่ให้ดูสะอาดตาและพรีเมียมขึ้น */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px", 
        paddingBottom: "16px", 
        borderBottom: "1px solid #e2e8f0" 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>
            📦 ระบบจัดการสินค้า
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
            Product Explorer & Management Dashboard
          </p>
        </div>
        <AuthButtons isLoggedIn={isLoggedIn} userName={session?.user?.name} />
      </header>

      {/* ส่งสถานะ isLoggedIn เข้าไปเช็กสิทธิ์ปุ่มแก้ไข/ลบ */}
      <ProductExplorer isLoggedIn={isLoggedIn} />
    </main>
  );
}