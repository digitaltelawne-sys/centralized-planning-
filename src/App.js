import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./pages/maindashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;