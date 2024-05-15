import Home from "./home/home";
import Sidebar from "../components/sidebar/sidebar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {


  return (
    <>
    <Sidebar/>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
    </Routes>
    </>
  );
}

export default App;
