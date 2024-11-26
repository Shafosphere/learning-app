import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import api from "../../../utils/api";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function VisitChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get(`/admin/visits-data`);
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching visits data:", error);
        return [];
      }
    }
    getData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "last week page views",
        position: "left",
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        stacked: true, // Włączenie stosowania dla osi X
      },
      y: {
        stacked: true, // Włączenie stosowania dla osi Y
      },
    },
  };

  return chartData ? (
    <div className="chart">
      <Bar data={chartData} options={options} />
    </div>
  ) : (
    <p>Ładowanie danych...</p>
  );
}
