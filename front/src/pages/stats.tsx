import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useAuthenticatedFetch } from "../hook/useAuthenticatedFetch";

interface StatByCategory {
  category: string;
  count: number;
}

interface StatByDate {
  date: string;
  count: number;
}

export const StatsPage = () => {
  const [resourcesByCategory, setResourcesByCategory] = useState<
    StatByCategory[]
  >([]);
  const [resourcesByDate, setResourcesByDate] = useState<StatByDate[]>([]);
  const [userCount, setUserCount] = useState<number>(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const { authenticatedFetch, loading, isLoaded, isSignedIn } =
    useAuthenticatedFetch();

  const fetchStats = useCallback(async () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (categoryId) params.append("categoryId", categoryId);

    const catRes = await authenticatedFetch(
      `/stats/resources-by-category?${params.toString()}`
    );
    const dateRes = await authenticatedFetch(
      `/stats/resources-by-date?${params.toString()}`
    );
    const userRes = await authenticatedFetch(
      `/stats/user-count?${params.toString()}`
    );
    const catListRes = await authenticatedFetch(`/categories`);

    const catData = await catRes?.data;
    const dateData = await dateRes?.data;
    const userData = await userRes?.data;
    const catList = await catListRes?.data;
    console.log("catData: ", catData);
    console.log("dateRes: ", dateRes);
    setResourcesByCategory(catData);
    setResourcesByDate(dateData);
    setUserCount(userData);
    setCategories(catList);
    console.log("date filtered : ", dateData);
    console.log("user count : ", userCount);
  }, [authenticatedFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    fetchStats();
  }, [isLoaded, startDate, endDate, categoryId]);

  useEffect(() => {}, [
    resourcesByCategory,
    resourcesByDate,
    userCount,
    categories,
  ]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const catSheet = XLSX.utils.json_to_sheet(resourcesByCategory);
    const dateSheet = XLSX.utils.json_to_sheet(resourcesByDate);
    XLSX.utils.book_append_sheet(wb, catSheet, "Par Catégorie");
    XLSX.utils.book_append_sheet(wb, dateSheet, "Par Date");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(file, "statistiques.xlsx");
  };

  if (loading) {
    return <p className="text-center text-gray-500">Chargement...</p>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Exporter en Excel
        </button>
      </div>

      <div className="text-lg">
        Nombre total d'utilisateurs : <strong>{userCount}</strong>
      </div>

      <div className="w-full h-80">
        <h2 className="text-xl font-semibold mb-2">Ressources par catégorie</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resourcesByCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full h-80">
        <h2 className="text-xl font-semibold mb-2">
          Ressources par date de création
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resourcesByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
