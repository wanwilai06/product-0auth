import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // เติม: provider ของ Google ที่ import มาด้านบน
  providers: [Google],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname; // ดึง pathname ของ URL ที่ผู้ใช้เข้าถึง
      const isProductManagementPage =
        /^\/products\/[^/]+\/(edit|delete)$/.test(pathname); // ตรวจสอบว่าเป็นหน้าจัดการสินค้าหรือไม่ (แก้ไข/ลบ)
      if (isProductManagementPage) {
        return Boolean(auth?.user); // ถ้าเป็นหน้าจัดการสินค้า ให้ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่ (มี auth.user หรือไม่)
      }
      return true; 
    },
  },
});
