"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORIES, ProductDraftSchema } from "@/lib/products";
import type { Product, ProductDraft } from "@/lib/products";

type ProductFormProps = {
    editing: Product | null; // ถ้าเป็น null = เพิ่มสินค้าใหม่ ถ้าไม่เป็น null = การแก้ไขสินค้า
    onSave: (draft: ProductDraft) => void; 
    onCancel: () => void; 
};

export default function ProductForm(
    { editing, onSave, onCancel }: ProductFormProps
) {
    const {
        register, // ใช้เชื่อมโยงฟิลด์ในฟอร์มกับ React Hook Form
        handleSubmit, // ใช้จัดการการส่งฟอร์ม
        reset, 
        formState: { errors }, 
    } = useForm<ProductDraft>({
        resolver: zodResolver(ProductDraftSchema), 
        mode: "onTouched", // ตรวจสอบความถูกต้องเมื่อผู้ใช้แตะออกจากฟิลด์
        defaultValues: editing
            ? {
                title: editing.title, 
                price: editing.price,
                description: editing.description || "",
                stock: editing.stock ?? 0, 
                category: (editing.category as any) || undefined,
                rating: editing.rating ?? 0,
            }
            : { title: "", price: 0, description: "", stock: 0, category: undefined, rating: 0 },
    }); // กำหนดค่าเริ่มต้นของฟอร์มตามว่ากำลังแก้ไขสินค้าหรือเพิ่มสินค้าใหม่

    useEffect(() => {
        if (editing) {
            reset({
                title: editing.title,
                price: editing.price,
                description: editing.description || "",
                stock: editing.stock ?? 0,
                category: (editing.category as any) || undefined,
                rating: editing.rating ?? 0,
            }); 
        } else {
            reset({ title: "", price: 0, description: "", stock: 0, category: undefined, rating: 0 });
        }
    }, [editing, reset]); // รีเซ็ตข้อมูลในฟอร์มใหม่ทันทีเมื่อค่าของ editing เปลี่ยนแปลงไป

    const inputStyle = {
        width: '100%', 
        padding: '10px 14px', 
        borderRadius: '8px', 
        border: '1px solid #cbd5e1', 
        boxSizing: 'border-box' as const, 
        background: '#fff',
        height: '42px',
        fontSize: '14px',
        color: '#1e293b',
        outline: 'none'
    };

    return (
        <div style={{ width: '100%' }}>
            {/* หัวข้อหลักอยู่นอกกล่องฟอร์มย่อย ให้มาอยู่ระนาบเดียวกับหัวข้อภาพรวม */}
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a' }}>
                {editing ? "✏️ แก้ไขข้อมูลสินค้า" : "➕ เพิ่มสินค้าใหม่"} 
            </h2>

            <form
                onSubmit={handleSubmit((values) => { 
                    onSave(values); 
                    reset({ title: "", price: 0, description: "", stock: 0, category: undefined, rating: 0 }); 
                })}
                noValidate
                style={{
                    background: 'transparent', // เอาพื้นหลังสีเทาออกเพื่อให้กลืนไปกับกรอบนอก
                    padding: '0px',
                    borderRadius: '0px',
                    border: 'none', // เอาเส้นกรอบด้านในออก เหลือเพียงกรอบนอกอันเดียว
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {/* ชื่อสินค้า */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="title" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>ชื่อสินค้า</label>
                        <input
                            id="title"
                            placeholder="ระบุชื่อสินค้า..."
                            {...register("title")}
                            style={inputStyle}
                        />
                        {errors.title && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.title.message}</span>}
                    </div>

                    {/* ราคา */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="price" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>ราคา</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register("price", { valueAsNumber: true })}
                            style={inputStyle}
                        />
                        {errors.price && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.price.message}</span>}
                    </div>

                    {/* รายละเอียดสินค้า */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                        <label htmlFor="description" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>รายละเอียดสินค้า</label>
                        <input
                            id="description"
                            placeholder="ระบุรายละเอียดสินค้า..."
                            {...register("description")}
                            style={inputStyle}
                        />
                        {errors.description && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.description.message}</span>}
                    </div>

                    {/* จำนวนคงเหลือ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="stock" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>จำนวนคงเหลือ</label>
                        <input
                            id="stock"
                            type="number"
                            placeholder="0"
                            {...register("stock", { valueAsNumber: true })}
                            style={inputStyle}
                        />
                        {errors.stock && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.stock.message}</span>}
                    </div>

                    {/* หมวดหมู่ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="category" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>หมวดหมู่</label>
                        <select
                            id="category"
                            {...register("category")}
                            style={inputStyle}
                        >
                            <option value="">กรุณาเลือกหมวดหมู่</option>
                            {CATEGORIES.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        {errors.category && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.category.message}</span>}
                    </div>

                    {/* คะแนนรีวิว */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                        <label htmlFor="rating" style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>คะแนนรีวิว (0 - 5)</label>
                        <input
                            id="rating"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="4.5"
                            {...register("rating", { valueAsNumber: true })}
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* ปุ่มควบคุม */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#0f172a',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '500',
                            height: '42px',
                            fontSize: '14px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                    </button>

                    {editing && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                color: '#334155',
                                cursor: 'pointer',
                                fontWeight: '500',
                                height: '42px',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}