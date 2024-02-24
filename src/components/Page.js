import { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
// MUI
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
// Icons
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
// Hooks
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { GlobalContext } from "../App";

const drawerWidth = 240;

function Page(props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { window, addPlaylistMenu } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchFieldRef = useRef(null);

  const {
    playlistData,
    selectedPlaylistName,
    setSelectedPlaylistName,
    setSelectedCategoryName,
    searchBarOpen,
    setSearchBarOpen,
    searchTerm,
    setSearchTerm,
  } = useContext(GlobalContext);

  useEffect(() => {
    if (
      localStorage.getItem("selectedPlaylistName") === null ||
      localStorage.getItem("selectedPlaylistName") === ""
    ) {
      if (playlistData.length > 0)
        setSelectedPlaylistName(playlistData[0]?.name);
    }
    // eslint-disable-next-line
  }, [playlistData]);

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.value = searchTerm;
    }
  }, [searchTerm]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleSearchBarOpen = () => {
    setSearchBarOpen(true);
  };
  const handleSearchBarClose = () => {
    setSearchBarOpen(false);
    if (searchFieldRef.current) {
      setSearchTerm("");
    }
  };
  const handleSearchFieldClear = () => {
    if (searchFieldRef.current) {
      searchFieldRef.current.value = "";
      setSearchTerm("");
      searchFieldRef.current.focus();
    }
  };
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const drawer = (
    <div>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              handleDrawerToggle();
              pathname !== "/" && navigate("/");
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              handleDrawerToggle();
              pathname !== "/settings" && navigate("/settings");
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box
        sx={{
          mx: (theme) => theme.spacing(1),
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="overline">Playlists</Typography>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => {
            handleDrawerToggle();
            pathname !== "/playlists" && navigate("/playlists");
          }}
        >
          Manage
        </Button>
      </Box>
      <List>
        {playlistData?.map((playlistNameObj, playlistIndex) => (
          <ListItem disablePadding key={playlistIndex}>
            <ListItemButton
              selected={
                playlistNameObj?.name ===
                localStorage.getItem("selectedPlaylistName")
              }
              onClick={() => {
                handleDrawerToggle();
                setSelectedPlaylistName(playlistNameObj?.name);
                setSelectedCategoryName("All channels");
                localStorage.setItem(
                  "selectedPlaylistName",
                  playlistNameObj?.name
                );
                pathname !== "/" && navigate("/");
              }}
            >
              <ListItemIcon>
                <PlaylistPlayIcon />
              </ListItemIcon>
              <ListItemText
                sx={{
                  "& span": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
                primary={playlistNameObj?.name}
                secondary={`${playlistNameObj?.count} channels`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <HelmetProvider>
      <Helmet>
        <meta
          name="theme-color"
          content={theme.palette.mode === "light" ? "primary.main" : "#282424"}
        />
      </Helmet>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            ml: { lg: `${drawerWidth}px` },
          }}
        >
          {pathname === "/" && (searchBarOpen || searchTerm) ? (
            <Toolbar>
              <Paper
                elevation={0}
                component="form"
                // Disable form submit
                onSubmit={(e) => e.preventDefault()}
                sx={{
                  mx: -2,
                  p: "2px 4px",
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  bgcolor:
                    theme.palette.mode === "light" ? "primary.main" : "#282424",
                  color: "#fff",
                }}
              >
                <IconButton
                  color="inherit"
                  sx={{ p: "10px" }}
                  aria-label="hide search field"
                  onClick={handleSearchBarClose}
                >
                  <ArrowBackIcon />
                </IconButton>
                <InputBase
                  inputRef={searchFieldRef}
                  autoFocus
                  sx={{ flex: 1, color: "inherit" }}
                  placeholder="Search for channels"
                  inputProps={{ "aria-label": "search for channels" }}
                  onChange={handleSearchTermChange}
                />
                <IconButton
                  color="inherit"
                  sx={{ p: "10px" }}
                  aria-label="clear search field"
                  onClick={handleSearchFieldClear}
                >
                  <ClearIcon />
                </IconButton>
              </Paper>
            </Toolbar>
          ) : (
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { lg: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                {pathname === "/" && selectedPlaylistName
                  ? selectedPlaylistName
                  : props.title}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {pathname === "/" && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleSearchBarOpen}
                >
                  <SearchIcon />
                </IconButton>
              )}
              {addPlaylistMenu}
            </Toolbar>
          )}
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
          aria-label="menu"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <SwipeableDrawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onOpen={handleDrawerToggle}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                overflowX: "hidden",
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                overflowX: "hidden",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            overflowX: "hidden",
          }}
        >
          <Toolbar />
          {props.children}
        </Box>
      </Box>
    </HelmetProvider>
  );
}

Page.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Page;
