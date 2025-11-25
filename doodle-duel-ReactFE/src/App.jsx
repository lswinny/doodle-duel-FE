import { useEffect } from "react";
import socket from "./socket"
import Canvas from "./Components/Canvas";
import LandingPage from "./Components/LandingPage";
import { Routes, Route } from "react-router-dom";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

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
