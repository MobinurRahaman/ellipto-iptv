import { useState, useEffect, createContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./Home";
import Playlists from "./Playlists";
import LiveTv from "./LiveTv";
import PageNotFound from "./PageNotFound";

export const GlobalContext = createContext();

function App() {
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
  const [currentChannelData, setCurrentChannelData] = useState({});

  // Get selectedPlaylistName from localStorage if it exists or not empty
  useEffect(() => {
    if (
      localStorage.getItem("selectedPlaylistName") !== null &&
      localStorage.getItem("selectedPlaylistName") !== ""
    ) {
      setSelectedPlaylistName(localStorage.getItem("selectedPlaylistName"));
    }
  }, []);

  // Store selectedPlaylistName in localStorage if it is changed
  useEffect(() => {
    localStorage.setItem("selectedPlaylistName", selectedPlaylistName);
  }, [selectedPlaylistName]);

  return (
    <GlobalContext.Provider
      value={{
        selectedPlaylistName,
        setSelectedPlaylistName,
        currentChannelData,
        setCurrentChannelData,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/live-tv/:channelId" element={<LiveTv />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
}

export default App;
