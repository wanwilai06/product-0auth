"use server";

import { auth } from "@/auth";
import { deleteProduct, updateProduct } from "@/lib/products";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


async function requireUser() {
  const session = await auth(); // ตรวจสอบ session ของผู้ใช้
  if (!session?.user) {
    throw new Error("Unauthorized"); // ถ้าผู้ใช้ไม่ได้ล็อกอิน ให้โยนข้อผิดพลาด
  }
  return session.user; // ถ้าผู้ใช้ล็อกอินแล้ว ให้ส่งข้อมูลผู้ใช้กลับ
}

export async function createProductAction(formData: FormData) {
  await requireUser(); // ตรวจสอบ session ของผู้ใช้ก่อนสร้างสินค้า

  const title = String(formData.get("title") ?? "").trim(); // ชื่อสินค้า + ตัดช่องว่างด้านหน้า/หลัง
  const description = String(formData.get("description") ?? "").trim(); // คำอธิบายสินค้า + ตัดช่องว่างด้านหน้า/หลัง
  const price = Number(formData.get("price")); // ราคาสินค้า
  const stock = Number(formData.get("stock") ?? 0); // จำนวนคงเหลือสินค้า (ถ้าไม่มีค่า = 0)
  const category = String(formData.get("category") ?? "GENERAL"); // หมวดหมู่สินค้า (ถ้าไม่มีค่า = "GENERAL")

  if (!title || !description) {
    throw new Error("กรุณากรอกข้อมูลให้ครบ"); 
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("ราคาไม่ถูกต้อง"); 
  }

  revalidatePath("/"); // สั่งให้ Next ดึงข้อมูลหน้าแรกใหม่
  redirect("/"); // สั่งให้ Next นำทางไปหน้าแรกหลังสร้างสินค้า
}

export async function updateProductAction(id: string | number, formData: FormData) {
  // เติม: ฟังก์ชันที่ตรวจ session ซ้ำก่อนแก้ข้อมูล
  await requireUser();

  const name = String(formData.get("name") ?? "").trim(); // ชื่อสินค้า + ตัดช่องว่างด้านหน้า/หลัง
  const description = String(formData.get("description") ?? "").trim(); // คำอธิบายสินค้า + ตัดช่องว่างด้านหน้า/หลัง
  const price = Number(formData.get("price")); // ราคาสินค้า

  if (!name || !description) {
    throw new Error("กรุณากรอกข้อมูลให้ครบ");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("ราคาไม่ถูกต้อง");
  }

  updateProduct(id, { title: name, description, price }); // เรียกฟังก์ชัน lib/products.ts เพื่อแก้ไขข้อมูลสินค้า

  // เติม: ฟังก์ชันที่สั่งให้ Next ดึงข้อมูลหน้าแรกใหม่
  revalidatePath("/"); // สั่งให้ Next ดึงข้อมูลหน้าแรกใหม่
  redirect("/"); // สั่งให้ Next นำทางไปหน้าแรกหลังแก้ไขข้อมูล
}

export async function deleteProductAction(id: string | number) {
    await requireUser(); // ตรวจสอบ session ของผู้ใช้ก่อนลบสินค้า
    
    deleteProduct(id); // เรียกฟังก์ชัน lib/products.ts เพื่อสั่งลบสินค้า

    revalidatePath("/");
    redirect("/");
}

