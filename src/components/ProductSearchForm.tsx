"use client";

import { useState } from "react";
import type { SearchQuery } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";

type ProductSearchFormProps = {
    onSearch: (query: SearchQuery) => void;
};

export default function ProductSearchForm({ onSearch }: ProductSearchFormProps) {
    const [title, setTitle] = useState("");
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState<string>("title");
    const [category, setCategory] = useState<string>("");

    return (
        <div style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            width: "100%",
            boxSizing: "border-box"
        }}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch({ title, limit, sortBy, category: category || undefined } as any);
                }}
            >
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    
                    {/* คำค้น */}
                    <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>คำค้น</label>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อสินค้า..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#1e293b", background: "#fff" }}
                        />
                    </div>

                    {/* จำนวนรายการ */}
                    <div style={{ width: "120px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>จำนวนรายการ</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#1e293b", background: "#fff" }}
                        />
                    </div>

                    {/* เรียงตาม */}
                    <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>เรียงตาม</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#1e293b", background: "#fff" }}
                        >
                            <option value="title">ชื่อสินค้า</option>
                            <option value="price">ราคา</option>
                        </select>
                    </div>

                    {/* หมวดหมู่ */}
                    <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>หมวดหมู่</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#1e293b", background: "#fff" }}
                        >
                            <option value="">ทุกหมวดหมู่</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* ปุ่มค้นหา */}
                    <div>
                        <button
                            type="submit"
                            style={{
                                padding: "9px 20px",
                                background: "#0f172a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "500",
                                fontSize: "14px",
                                height: "38px"
                            }}
                        >
                            ค้นหา
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}