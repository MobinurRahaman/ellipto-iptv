import { useState } from "react";
// Components
import Page from "./components/Page";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
// Others
import parser from "iptv-playlist-parser";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// Create playlist store
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

export default function Playlists() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [remotePlaylistDialogOpen, setRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState(null);
  const [playlistNames, setPlaylistNames] = useState([]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useLiveQuery(() => {
    db.playlists.orderBy("name").keys((keys) => {
      setPlaylistNames(keys);
    });
  }, []);

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
    const playlistName = remotePlaylistUrl.split("/").pop();

    fetch(remotePlaylistUrl)
      .then((res) => res.text())
      .then((rawPlaylist) => {
        // Convert IPTV playlist to JavaScript array of objects
        const playlistData = parser.parse(rawPlaylist).items;

        // If a valid IPTV playlist
        if (playlistData.length > 0) {
          db.playlists
            .where("name")
            .equalsIgnoreCase(playlistName)
            .count()
            .then((count) => {
              // If this playlist doesn't exist in the database
              if (count === 0) {
                db.playlists.add({ name: playlistName, data: playlistData });
                console.log(`${playlistName} playlist created`);
              } else {
                // If this playlist already exists in the database
                console.log(`${playlistName} playlist already exists`);
              }
            });
        } else {
          // If not a valid IPTV playlist
          console.log("This is not an IPTV playlist url");
        }
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
        edge="end"
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
      <List>
        {playlistNames?.map((item, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={`show context menu for ${item} playlist`}
              >
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
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
