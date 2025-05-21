
// Statystyki (globalne)
import {
  fetchGlobalData,
  fetchVisitsData
} from "../repositories/stats.repo.js";

import ApiError from "../errors/ApiError.js";
// Patchy
import {
  generateNewPatchesBatch,
  deleteOldNeWPatches
} from "../repositories/patch.repo.js";

// Aktywność użytkownika
import {
  fetchUserActivityData
} from "../repositories/user.repo.js";

import { format, eachDayOfInterval } from "date-fns";

export const getGlobalData = async (req, res) => {
  const globalData = await fetchGlobalData();
  res.status(200).json(globalData);
};

function getColor(index) {
  const colors = [
    "rgba(255, 99, 132, 0.5)", // Czerwony
    "rgba(54, 162, 235, 0.5)", // Niebieski
    "rgba(75, 192, 192, 0.5)", // Zielony
    "rgba(153, 102, 255, 0.5)", // Fioletowy
    "rgba(255, 159, 64, 0.5)", // Pomarańczowy
  ];
  return colors[index % colors.length];
}

export const getVisitsData = async (req, res) => {
  const rows = await fetchVisitsData();

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);

  const datesArray = eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).map((date) => format(date, "yyyy-MM-dd"));

  const formattedDates = datesArray.map((date) =>
    format(new Date(date), "MMMM d")
  );

  const pageNamesSet = new Set(rows.map((row) => row.page_name));
  const pageNamesArray = Array.from(pageNamesSet);

  const datasets = pageNamesArray.map((pageName, index) => ({
    label: pageName,
    data: [],
    backgroundColor: getColor(index),
  }));

  datesArray.forEach((date) => {
    pageNamesArray.forEach((pageName, index) => {
      const row = rows.find(
        (r) =>
          format(r.stat_date, "yyyy-MM-dd") === date &&
          r.page_name === pageName
      );
      const visitCount = row ? row.visit_count : 0;
      datasets[index].data.push(visitCount);
    });
  });

  const chartData = {
    labels: formattedDates,
    datasets: datasets,
  };

  res.status(200).json(chartData);
};

export const getUserActivityData = async (req, res) => {
  const rows = await fetchUserActivityData();

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);

  const filteredRows = rows.filter((row) => {
    const rowDate = new Date(row.activity_date);
    return rowDate >= startDate && rowDate <= endDate;
  });

  const datesArray = eachDayOfInterval({
    start: startDate,
    end: endDate,
  }).map((date) => format(date, "yyyy-MM-dd"));

  const formattedDates = datesArray.map((date) =>
    format(new Date(date), "MMMM d")
  );

  const activityTypesSet = new Set(
    filteredRows.map((row) => row.activity_type)
  );
  const activityTypesArray = Array.from(activityTypesSet);

  const datasets = activityTypesArray.map((activityType, index) => ({
    label: activityType,
    data: [],
    backgroundColor: getColor(index),
  }));

  datesArray.forEach((date) => {
    activityTypesArray.forEach((activityType, index) => {
      const row = filteredRows.find(
        (r) =>
          format(new Date(r.activity_date), "yyyy-MM-dd") === date &&
          r.activity_type === activityType
      );

      const activityCount = row ? row.activity_count : 0;
      datasets[index].data.push(activityCount);
    });
  });

  const chartData = {
    labels: formattedDates,
    datasets: datasets,
  };

  res.status(200).json(chartData);
};

export const generatePatches = async (req, res) => {
  await deleteOldNeWPatches();
  await generateNewPatchesBatch(30);
  res.status(200).json({ success: true });
};

