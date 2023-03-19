import { useState, useEffect, forwardRef, useMemo, createContext } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Zoom from "@mui/material/Zoom";
import Button from "@mui/material/Button";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Home from "./Home";
import Playlists from "./Playlists";
import Play from "./Play";
import PageNotFound from "./PageNotFound";
// Get playlist data from custom hook
import useLivePlaylistData from "./hooks/useLivePlaylistData";
import useLivePlaylistCount from "./hooks/useLivePlaylistCount";

export const GlobalContext = createContext();

const Transition = forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

function App() {
  const playlistData = useLivePlaylistData();
  const playlistCount = useLivePlaylistCount();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [searchBarOpen, setSearchBarOpen] = useState(false);
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

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  useEffect(() => {
    if (Object.keys(alertMessage).length > 0) {
      setAlertOpen(true);
    }
  }, [alertMessage]);

  // Get selectedPlaylistName and selectedCategoryName from localStorage if they exist or not empty on mount
  useEffect(() => {
    if (
      localStorage.getItem("selectedPlaylistName") !== null &&
      localStorage.getItem("selectedPlaylistName") !== ""
    ) {
      setSelectedPlaylistName(localStorage.getItem("selectedPlaylistName"));
    }

    if (
      localStorage.getItem("selectedCategoryName") !== null &&
      localStorage.getItem("selectedCategoryName") !== ""
    ) {
      setSelectedCategoryName(localStorage.getItem("selectedCategoryName"));
    } else {
      setSelectedCategoryName("All channels");
    }
  }, []);

  // Store selectedPlaylistName in localStorage if it is changed
  useEffect(() => {
    localStorage.setItem("selectedPlaylistName", selectedPlaylistName);
  }, [selectedPlaylistName]);

  // Store selectedCategoryName in localStorage if it is changed
  useEffect(() => {
    if (selectedCategoryName) {
      localStorage.setItem("selectedCategoryName", selectedCategoryName);
    }
  }, [selectedCategoryName]);

  return (
    <GlobalContext.Provider
      value={{
        playlistData,
        playlistCount,
        setAlertMessage,
        selectedPlaylistName,
        setSelectedPlaylistName,
        categoryData,
        setCategoryData,
        selectedCategoryName,
        setSelectedCategoryName,
        searchBarOpen,
        setSearchBarOpen,
        searchTerm,
        setSearchTerm,
        currentChannelData,
        setCurrentChannelData,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Dialog
          open={alertOpen}
          onClose={handleAlertClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="sm"
          TransitionComponent={Transition}
        >
          <DialogTitle id="alert-dialog-title">
            {alertMessage?.title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {alertMessage?.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAlertClose} autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/play/:channelName" element={<Play />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </GlobalContext.Provider>
  );
}

export default App;
