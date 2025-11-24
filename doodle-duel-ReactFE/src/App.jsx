import { useState } from "react";
import Canvas from "./Components/Canvas";
import LandingPage from "./Components/LandingPage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
        <main>
          <h1>Hello Frontend</h1>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/canvas" element={<Canvas />} />
          </Routes>
        </main>
    </>
  );
}

export default App;
