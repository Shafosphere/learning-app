import {
  fetchGlobalData,
  fetchVisitsData,
  generateNewPatchesBatch,
  deleteOldNeWPatches,
  fetchUserActivityData,
} from "../models/userModel.js";

import { format, eachDayOfInterval } from 'date-fns';

export const getGlobalData = async (req, res) => {
  try {
    const globalData = await fetchGlobalData();
    res.status(200).json(globalData);
  } catch (error) {
    console.error("Error fetching global data:", error);
    res.status(500).send("Server Error");
  }
};

function getColor(index) {
  const colors = [
    'rgba(255, 99, 132, 0.5)',    // Czerwony
    'rgba(54, 162, 235, 0.5)',    // Niebieski
    'rgba(75, 192, 192, 0.5)',    // Zielony
    'rgba(153, 102, 255, 0.5)',   // Fioletowy
    'rgba(255, 159, 64, 0.5)',    // Pomarańczowy
  ];
  return colors[index % colors.length];
}

export const getVisitsData = async (req, res) => {
  try {
    const rows = await fetchVisitsData();

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // Ustawienie godziny na początek dnia
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 6 dni temu

    const datesArray = eachDayOfInterval({ start: startDate, end: endDate }).map(date =>
      format(date, 'yyyy-MM-dd')
    );

    // Sformatuj daty do etykiet wykresu
    const formattedDates = datesArray.map(date => format(new Date(date), 'MMMM d'));

    const pageNamesSet = new Set(rows.map(row => row.page_name));
    const pageNamesArray = Array.from(pageNamesSet);

    // Inicjalizuj datasets
    const datasets = pageNamesArray.map((pageName, index) => ({
      label: pageName,
      data: [],
      backgroundColor: getColor(index),
    }));

    // Wypełnij datasets liczbami wizyt
    datesArray.forEach(date => {
      pageNamesArray.forEach((pageName, index) => {
        const row = rows.find(
          r =>
            format(r.stat_date, 'yyyy-MM-dd') === date &&
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
  } catch (error) {
    console.error('Error fetching visits data:', error);
    res.status(500).send('Server Error');
  }
};

export const getUserActivityData = async (req, res) => {
  try {
    const rows = await fetchUserActivityData();

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // Ustawienie godziny na początek dnia
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 6 dni temu

    // Filtrujemy dane do ostatnich 7 dni
    const filteredRows = rows.filter(row => {
      const rowDate = new Date(row.activity_date);
      return rowDate >= startDate && rowDate <= endDate;
    });

    const datesArray = eachDayOfInterval({ start: startDate, end: endDate }).map(date =>
      format(date, 'yyyy-MM-dd')
    );

    // Sformatuj daty do etykiet wykresu
    const formattedDates = datesArray.map(date => format(new Date(date), 'MMMM d'));

    const activityTypesSet = new Set(filteredRows.map(row => row.activity_type));
    const activityTypesArray = Array.from(activityTypesSet);

    // Inicjalizuj datasets
    const datasets = activityTypesArray.map((activityType, index) => ({
      label: activityType,
      data: [],
      backgroundColor: getColor(index),
    }));

    // Wypełnij datasets liczbami aktywności
    datesArray.forEach(date => {
      activityTypesArray.forEach((activityType, index) => {
        const row = filteredRows.find(
          r =>
            format(new Date(r.activity_date), 'yyyy-MM-dd') === date &&
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
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    res.status(500).send('Server Error');
  }
};

export const generatePatches = async (req, res) => {
  try {

    // Usuń stare patche przed generowaniem nowych
    await deleteOldNeWPatches();

    // Generuj nowe patche
    await generateNewPatchesBatch(30); // Rozmiar patcha można modyfikować

    res.status(200).send("Patches have been generated successfully.");
  } catch (error) {
    console.error("Error while generating patches:", error);
    res.status(500).send("An error occurred while generating patches.");
  }
};