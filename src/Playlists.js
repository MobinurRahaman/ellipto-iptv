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
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const [addPlaylistMenuAnchorEl, setAddPlaylistMenuAnchorEl] = useState(null);
  const [playlistContextMenuAnchorEl, setPlaylistContextMenuAnchorEl] =
    useState(null);
  const [remotePlaylistDialogOpen, setRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState(null);
  const [playlistNames, setPlaylistNames] = useState([]);

  const handleAddPlaylistMenu = (event) => {
    setAddPlaylistMenuAnchorEl(event.currentTarget);
  };
  const handleAddPlaylistMenuClose = () => {
    setAddPlaylistMenuAnchorEl(null);
  };

  const handlePlaylistContextMenu = (event) => {
    setPlaylistContextMenuAnchorEl(event.currentTarget);
  };
  const handlePlaylistContextMenuClose = () => {
    setPlaylistContextMenuAnchorEl(null);
  };

  useLiveQuery(() => {
    db.playlists.orderBy("name").keys((keys) => {
      setPlaylistNames(keys);
    });
  }, []);

  const handleRemotePlaylistDialogOpen = () => {
    setAddPlaylistMenuAnchorEl(null);
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
        aria-controls="add-playlist-menu"
        aria-haspopup="true"
        onClick={handleAddPlaylistMenu}
        color="inherit"
      >
        <PlaylistAddTwoToneIcon />
      </IconButton>
      <Menu
        id="add-playlist-menu"
        anchorEl={addPlaylistMenuAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(addPlaylistMenuAnchorEl)}
        onClose={handleAddPlaylistMenuClose}
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
                aria-controls="playlist-context-menu"
                aria-haspopup="true"
                onClick={handlePlaylistContextMenu}
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
        id="playlist-context-menu"
        anchorEl={playlistContextMenuAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(playlistContextMenuAnchorEl)}
        onClose={handlePlaylistContextMenuClose}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
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
          <Button
            disabled={remotePlaylistUrl?.length > 0 ? false : true}
            onClick={handleAddRemotePlaylistTrigger}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
