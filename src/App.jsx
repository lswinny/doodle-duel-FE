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

  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || "";
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("token", (data) => {
      const receivedToken = typeof data === "string" ? data : data?.token;

      if (!receivedToken) {
        console.warn("Token event received without a token:", data);
        return;
      }

      console.log("Received token from server:", receivedToken);
      setToken(receivedToken);
      localStorage.setItem("authToken", receivedToken);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("token");
    };
  }, []);

  return (
    <main className="app">
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              nickname={nickname}
              setNickname={setNickname}

              token={token}
            />
          }
        />
        <Route
          path="/lobby"
          element={<LobbyPage nickname={nickname} token={token} />}
        />
        <Route
          path="/room"
          element={<RoomPage nickname={nickname} token={token} />}
        />
        <Route
          path="/canvas"
          element={<Canvas nickname={nickname} token={token} />}
        />
        <Route
          path="/results"
          element={<ResultsPage nickname={nickname} token={token} />}
        />
      </Routes>
    </main>
  );
}

export default App;
