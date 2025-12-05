import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import socket from "./socket";

import Canvas from "./Components/Canvas";
import LandingPage from "./Components/LandingPage";
import LobbyPage from "./Components/LobbyPage";
import RoomPage from "./Components/RoomPage";
import ResultsPage from "./Components/ResultsPage";

function App() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || "";
  });

  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    function handleNavigate({ page, roomCode }) {
      // Build path dynamically
      if (roomCode) navigate(`/${page}/${roomCode}`);
      else navigate(`/${page}`);
    }

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

    socket.on("navigate", handleNavigate);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("token");
      socket.off("navigate", handleNavigate);
    };
  }, [navigate]);

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
              avatar={avatar}
              setAvatar={setAvatar}
            />
          }
        />
        <Route
          path="/lobby"
          element={
            <LobbyPage
              nickname={nickname}
              token={token}
              rooms={rooms}
              setRooms={setRooms}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
              avatar={avatar}
              setAvatar={setAvatar}
            />
          }
        />
        <Route
          path="/room/:roomCode"
          element={
            <RoomPage
              nickname={nickname}
              token={token}
              avatar={avatar}
              setAvatar={setAvatar}
            />
          }
        />
        <Route
          path="/canvas/:roomCode"
          element={<Canvas nickname={nickname} token={token} />}
        />
        <Route
          path="/results/:roomCode"
          element={<ResultsPage nickname={nickname} token={token} avatar={avatar} setAvatar={setAvatar} />}
        />
      </Routes>
    </main>
  );
}

export default App;
