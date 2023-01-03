import { useState, useEffect, useMemo, createContext } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./Home";
import Playlists from "./Playlists";
import LiveTv from "./LiveTv";
import PageNotFound from "./PageNotFound";

export const GlobalContext = createContext();

function App() {
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentChannelData, setCurrentChannelData] = useState({});

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

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
        searchTerm,
        setSearchTerm,
        currentChannelData,
        setCurrentChannelData,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/live-tv/:channelId" element={<LiveTv />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </GlobalContext.Provider>
  );
}

export default App;
