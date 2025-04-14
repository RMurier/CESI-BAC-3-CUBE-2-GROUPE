import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

interface StatByCategory {
  category: string;
  count: number;
}

interface StatByDate {
  date: string;
  count: number;
}

export const StatsPage = () => {
  const [resourcesByCategory, setResourcesByCategory] = useState<StatByCategory[]>([]);
  const [resourcesByDate, setResourcesByDate] = useState<StatByDate[]>([]);
  const [userCount, setUserCount] = useState<number>(0);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchStats = async () => {
    const [catRes, dateRes, userRes] = await Promise.all([
      fetch(`${BASE_URL}/stats/resources-by-category`),
      fetch(`${BASE_URL}/stats/resources-by-date`),
      fetch(`${BASE_URL}/stats/user-count`),
    ]);

    const catData = await catRes.json();
    const dateData = await dateRes.json();
    const userData = await userRes.json();

    setResourcesByCategory(catData);
    setResourcesByDate(dateData);
    setUserCount(userData.count);
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>

      <div className="flex justify-between items-center">
        <p className="text-lg">Nombre total d'utilisateurs : <strong>{userCount}</strong></p>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Exporter en Excel
        </button>
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
        <h2 className="text-xl font-semibold mb-2">Ressources par date de création</h2>
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
