import { z } from "zod";

// รายชื่อหมวดหมู่ คัดลอกจาก
// https://dummyjson.com/products/category-list
export const CATEGORIES = [
  "beauty", "fragrances", "furniture", "groceries",
  "home-decoration", "kitchen-accessories", "laptops",
  "mens-shirts", "mens-shoes", "mens-watches",
  "mobile-accessories", "motorcycle", "skin-care",
  "smartphones", "sports-accessories", "sunglasses",
  "tablets", "tops", "vehicle", "womens-bags",
  "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
] as const;

export const SORT_FIELDS = ["title", "price", "stock"] as const;

// ย้าย SearchQuerySchema และ Type ขึ้นมาไว้ด้านบน เพื่อให้ด้านล่างเรียกใช้งานได้ทันที
export const SearchQuerySchema = z.object({
  q: z.string().trim(),
  limit: z
    .number({ error: "กรุณากรอกจำนวนรายการ" })
    .int("จำนวนรายการต้องเป็นจำนวนเต็ม")
    .min(1, "อย่างน้อย 1 รายการ")
    .max(30, "ไม่เกิน 30 รายการ"),
  sortBy: z.enum(SORT_FIELDS),
}); // Schema สำหรับตรวจสอบเงื่อนไขการค้นหาสินค้า (SearchQuery)

export type SearchQuery = z.infer<typeof SearchQuerySchema>; // type ที่อ่านออกมาจาก Schema

export const ProductSchema = z.object({
  id: z.number(),
  // เงื่อนไขที่บังคับว่าข้อความต้องยาวอย่างน้อยเท่าใด
  title: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  // รองรับ thumbnail
  thumbnail: z.string().url({ message: "URL รูปภาพไม่ถูกต้อง" }).optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  price: z.number({ error: "กรุณากรอกราคา" }).min(0, "ราคาต้องไม่ติดลบ"),
  stock: z
    .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
  category: z.enum(CATEGORIES, { error: "กรุณาเลือกหมวดหมู่" }),
  description: z.string().trim().optional(),
  // กำหนดให้ rating อยู่ในช่วง 0 - 5 (และเป็น optional ได้)
  rating: z.number().min(0, "คะแนนต้องไม่ต่ำกว่า 0").max(5, "คะแนนต้องไม่เกิน 5").optional(),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema), // รายการสินค้าที่ตรงกับเงื่อนไขการค้นหา
  total: z.number(), // จำนวนสินค้าทั้งหมดที่ตรงกับเงื่อนไขการค้นหา
  skip: z.number(),
  limit: z.number(), // จำนวนรายการที่ส่งกลับมาในแต่ละครั้ง
});

// ตัวช่วยของ Zod ที่อ่าน Type ออกมาจาก Schema
export type Product     = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;

// เมธอดของ Zod ที่สร้าง Schema ใหม่โดยนำฟิลด์ที่ระบุออก
export const ProductDraftSchema = ProductSchema.omit({ id: true });
export type ProductDraft = z.infer<typeof ProductDraftSchema>;

const API_BASE = "https://dummyjson.com";

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");
  params.set("select", "title,price,stock,category,thumbnail,images,rating");

  // ถ้ามีการพิมพ์คำค้นหา ให้ใช้เส้น /products/search
  if (query.q && query.q.trim() !== "") {
    params.set("q", query.q.trim());
    return `${API_BASE}/products/search?${params.toString()}`;
  }

  // แต่ถ้าไม่ได้พิมพ์คำค้นหา ให้ใช้เส้น /products ปกติ
  return `${API_BASE}/products?${params.toString()}`;
}


export async function fetchProducts(
  query: SearchQuery = defaultQuery
): Promise<ProductList> {
  const response = await fetch(buildProductUrl(query));
  console.log("สถานะการตอบกลับ:", response);

  if (!response.ok) {
    throw new Error(`เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`);
  }

  const data = await response.json();
  console.log("ข้อมูลที่ได้รับ:", data);

  const result = ProductListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้");
  }

  return result.data;
}

// ==========================================
// ส่วนจัดการ LocalStorage (สำหรับสินค้าที่สร้างใหม่ในเครื่อง)
// ==========================================
const LOCAL_STORAGE_KEY = "my_custom_products_v1";

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
}

// ==========================================
// ฟังก์ชันเสริมเพิ่มเติมสำหรับหน้าแรก, หน้า Edit และ Delete
// ==========================================

export async function getProducts(query: SearchQuery = defaultQuery): Promise<ProductList> {
  return fetchProducts(query);
}

export async function getProduct(id: string | number): Promise<Product | null> {
  // 1. ตรวจสอบจาก LocalStorage ของเครื่องก่อน (รองรับสินค้าที่สร้างใหม่)
  const localProducts = getLocalProducts();
  const found = localProducts.find((p) => String(p.id) === String(id));
  if (found) return found;

  // 2. ถ้าไม่เจอ ค่อยไปดึงจาก DummyJSON API ตามปกติ
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const product = await res.json();
    
    const result = ProductSchema.safeParse(product);
    if (!result.success) {
      return product as Product;
    }
    return result.data;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return null;
  }
}

export async function updateProduct(
  id: string | number,
  values: Partial<ProductDraft>
) {
  // 1. ตรวจสอบและอัปเดตใน LocalStorage ของเครื่องก่อน
  const localProducts = getLocalProducts();
  const index = localProducts.findIndex((p) => String(p.id) === String(id));
  
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...values };
    saveLocalProducts(localProducts);
    return localProducts[index];
  }

  // 2. ถ้าเป็นสินค้าเดิมจาก API ภายนอก ให้ยิง PUT ตามปกติ
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error(`อัปเดตสินค้าไม่สำเร็จ สถานะ ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("ไม่สามารถอัปเดตข้อมูลสินค้าได้");
  }
}

export async function deleteProduct(id: string | number) {
  // 1. ตรวจสอบและลบจาก LocalStorage ของเครื่องก่อน
  const localProducts = getLocalProducts();
  const filtered = localProducts.filter((p) => String(p.id) !== String(id));
  
  if (filtered.length !== localProducts.length) {
    saveLocalProducts(filtered);
    return { success: true };
  }

  // 2. ถ้าเป็นสินค้าเดิมจาก API ภายนอก ให้ยิง DELETE ตามปกติ
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`ลบสินค้าไม่สำเร็จ สถานะ ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("ไม่สามารถลบสินค้าได้");
  }
}