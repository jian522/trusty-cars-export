"use client";

import { useCallback, useEffect, useState } from "react";
import type { CarRecord } from "@/lib/db";
import { useLanguage } from "@/components/LanguageProvider";
import { tBrand } from "@/lib/i18n";

const emptyForm = {
  type: "fuel" as "fuel" | "ne",
  brand: "",
  model: "",
  year: "2024",
  price: "",
  priceUSD: "",
  mileage: "",
  transmission: "自动",
  fuelType: "汽油",
  emission: "国VI",
  color: "白色",
  location: "广州",
  description: "",
  descriptionEn: "",
  exportCountries: "非洲, 中东, 东南亚",
  featured: false,
  battery: "",
  range: "",
};

export default function AdminPage() {
  const { lang } = useLanguage();
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCars = useCallback(async () => {
    try {
      const res = await fetch("/api/cars");
      if (!res.ok) throw new Error("加载失败");
      const data = (await res.json()) as CarRecord[];
      setCars(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (car: CarRecord) => {
    setEditingId(car.id);
    setForm({
      type: car.type,
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      priceUSD: String(car.priceUSD),
      mileage: car.mileage,
      transmission: car.transmission,
      fuelType: car.fuelType,
      emission: car.emission,
      color: car.color,
      location: car.location,
      description: car.description,
      descriptionEn: car.descriptionEn,
      exportCountries: car.exportCountries.join(", "),
      featured: car.featured,
      battery: car.battery ?? "",
      range: car.range ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: CarRecord = {
      id: editingId ?? "",
      type: form.type,
      brand: form.brand,
      model: form.model,
      year: Number(form.year) || 2024,
      price: Number(form.price) || 0,
      priceUSD: Number(form.priceUSD) || 0,
      mileage: form.mileage,
      transmission: form.transmission,
      fuelType: form.fuelType,
      emission: form.emission,
      color: form.color,
      location: form.location,
      images: [],
      description: form.description,
      descriptionEn: form.descriptionEn,
      exportCountries: form.exportCountries
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
      battery: form.battery || undefined,
      range: form.range || undefined,
    };

    try {
      const res = editingId
        ? await fetch(`/api/cars/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/cars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error("保存失败");
      setShowForm(false);
      await loadCars();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`确定删除 ${id} 吗？`)) return;
    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      await loadCars();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  const fuelCars = cars.filter((c) => c.type === "fuel");
  const neCars = cars.filter((c) => c.type === "ne");

  const input = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚗 后台管理 Admin</h1>
          <button
            onClick={openAdd}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
          >
            + 添加车型
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">总车型</h3>
            <p className="text-3xl font-bold text-blue-600">{cars.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">燃油车</h3>
            <p className="text-3xl font-bold text-green-600">{fuelCars.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">新能源</h3>
            <p className="text-3xl font-bold text-emerald-600">{neCars.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">热门车型</h3>
            <p className="text-3xl font-bold text-purple-600">
              {cars.filter((c) => c.featured).length}
            </p>
          </div>
        </div>

        {/* Car List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">加载中...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">车型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">年份</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格(USD)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">热门</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {car.type === "fuel" ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">燃油</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">新能源</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {tBrand(car.brand, lang)} {car.model}
                      </div>
                      <div className="text-sm text-gray-500">{car.id}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{car.year}</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      ${car.priceUSD.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {car.featured ? "🔥" : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(car)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "编辑车型" : "添加新车型"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as "fuel" | "ne" })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="fuel">燃油车</option>
                    <option value="ne">新能源</option>
                  </select>
                </div>
                {input("品牌", "brand")}
                {input("型号", "model")}
                {input("年份", "year", "number")}
                {input("价格(人民币)", "price", "number")}
                {input("价格(美元)", "priceUSD", "number")}
                {input("里程", "mileage")}
                {input("变速箱", "transmission")}
                {input("燃料类型", "fuelType")}
                {input("排放标准", "emission")}
                {input("颜色", "color")}
                {input("位置", "location")}
              </div>
              {form.type === "ne" && (
                <div className="grid grid-cols-2 gap-4">
                  {input("电池", "battery")}
                  {input("续航", "range")}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述(中文)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述(英文)</label>
                <textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  适合出口国家（逗号分隔）
                </label>
                <input
                  value={form.exportCountries}
                  onChange={(e) =>
                    setForm({ ...form, exportCountries: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  设为热门车型
                </label>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "保存中..." : editingId ? "更新" : "添加"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
