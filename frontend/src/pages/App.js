import React, { useEffect, useState } from "react";
import axios from "axios";
import Home from "./home/home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/data")
      .then((response) => {
        setData(response.data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
