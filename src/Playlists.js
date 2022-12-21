import { useState } from "react";
// Components
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
// Icons
import PlaylistAddTwoToneIcon from "@mui/icons-material/PlaylistAddTwoTone";
import LinkIcon from "@mui/icons-material/Link";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

import Page from "./components/Page";

export default function Playlists() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [remotePlaylistDialogOpen, setRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemotePlaylistDialogOpen = () => {
    setAnchorEl(null);
    setRemotePlaylistDialogOpen(true);
  };
  const handlePlaylistUrlChange = (event) => {
    setRemotePlaylistUrl(event.target.value);
  };
  const handleAddRemotePlaylistCancel = () => {
    setRemotePlaylistDialogOpen(false);
  };
  const handleAddRemotePlaylistTrigger = () => {
    setRemotePlaylistDialogOpen(false);

    fetch(remotePlaylistUrl)
      .then((res) => res.text())
      .then((rawPlaylist) => {
        console.log("rawPlaylist", rawPlaylist);
      })
      .catch((error) => {
        !navigator.onLine &&
          console.log("No internet. Turn on internet connection");
        console.log("error", error);
      });
  };

  const menu = (
    <>
      <IconButton
        size="large"
        aria-label="add a playlist"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <PlaylistAddTwoToneIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemotePlaylistDialogOpen}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add playlist from remote URL</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <PhoneAndroidIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add playlist file from device</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Page title="Playlists" menu={menu}>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemotePlaylistDialogOpen}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add playlist from remote URL</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <PhoneAndroidIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add playlist file from device</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog
        open={remotePlaylistDialogOpen}
        onClose={handleAddRemotePlaylistCancel}
      >
        <DialogTitle>Add a playlist from remote URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="url"
            autoComplete="off"
            label="Playlist URL"
            type="url"
            fullWidth
            variant="standard"
            onChange={handlePlaylistUrlChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddRemotePlaylistCancel}>Cancel</Button>
          <Button onClick={handleAddRemotePlaylistTrigger}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
