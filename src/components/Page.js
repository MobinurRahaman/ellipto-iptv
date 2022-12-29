import { useState, useContext } from "react";
import PropTypes from "prop-types";
// Components
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
// Icons
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
// Hooks
import { useNavigate, useLocation } from "react-router-dom";
import { useLivePlaylistNames } from "../hooks/dbhooks";
import { GlobalContext } from "../App";

const drawerWidth = 240;

function Page(props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Get playlist names from custom hook
  const playlistNames = useLivePlaylistNames();
  const { window, menu } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  // Context
  const { selectedPlaylistName, setSelectedPlaylistName } =
    useContext(GlobalContext);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
        {playlistNames?.map((playlistName, playlistIndex) => (
          <ListItem disablePadding key={playlistIndex}>
            <ListItemButton
              selected={
                pathname === "/" &&
                playlistName === localStorage.getItem("selectedPlaylistName")
              }
              onClick={() => {
                handleDrawerToggle();
                setSelectedPlaylistName(playlistName);
                localStorage.setItem("selectedPlaylistName", playlistName);
                pathname !== "/" && navigate("/");
              }}
            >
              <ListItemIcon>
                <PlaylistPlayIcon />
              </ListItemIcon>
              <ListItemText primary={playlistName} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
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
          {menu}
        </Toolbar>
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
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
