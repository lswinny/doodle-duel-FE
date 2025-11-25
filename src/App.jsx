import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import socket from "./socket";

import Canvas from "./Components/Canvas";
import LandingPage from "./Components/LandingPage";
import LobbyPage from "./Components/LobbyPage";
import RoomPage from "./Components/RoomPage";
import ResultsPage from "./Components/ResultsPage";

function App() {
  const [nickname, setNickname] = useState("");

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
    <main className="app">
      <Routes>
        {}
        <Route
          path="/"
          element={
            <LandingPage
              nickname={nickname}
              setNickname={setNickname}
            />
          }
        />

        {}
        <Route
          path="/lobby"
          element={<LobbyPage nickname={nickname} />}
        />

        <Route
          path="/room"
          element={<RoomPage nickname={nickname} />}
        />

        <Route
          path="/canvas"
          element={<Canvas nickname={nickname} />}
        />

        <Route
          path="/results"
          element={<ResultsPage nickname={nickname} />}
        />
      </Routes>
    </main>
  );
}

export default App;
