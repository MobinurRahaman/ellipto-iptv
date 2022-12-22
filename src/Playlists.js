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

// Create database and playlist store/collection
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

export default function Playlists() {
  // Add playlist menu states
  const [addPlaylistMenuAnchorEl, setAddPlaylistMenuAnchorEl] = useState(null);
  // Add remote playlist dialog open
  const [addRemotePlaylistDialogOpen, setRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState(null);
  // Playlist names state
  const [playlistNames, setPlaylistNames] = useState([]);
  // Playlist context menu states
  const [playlistContextMenuAnchorEl, setPlaylistContextMenuAnchorEl] =
    useState(null);
  const [playlistTargetIndex, setPlaylistTargetIndex] = useState(null);
  const [deletePlaylistDialogOpen, setDeletePlaylistDialogOpen] =
    useState(false);

  // Add playlist menu functions
  const handleAddPlaylistMenuOpen = (event) => {
    setAddPlaylistMenuAnchorEl(event.currentTarget);
  };
  const handleAddPlaylistMenuClose = () => {
    setAddPlaylistMenuAnchorEl(null);
  };

  // Playlist context menu functions
  const handlePlaylistContextMenuOpen = (event, index) => {
    setPlaylistContextMenuAnchorEl(event.currentTarget);
    setPlaylistTargetIndex(index);
  };
  const handlePlaylistContextMenuClose = () => {
    setPlaylistContextMenuAnchorEl(null);
    setPlaylistTargetIndex(null);
  };

  // Remote playlist url dialog functions
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
                alert(`${playlistName} playlist already exists`);
              }
            });
        } else {
          // If not a valid IPTV playlist
          alert("This is not an IPTV playlist url");
        }
      })
      .catch((error) => {
        !navigator.onLine && alert("No internet. Turn on internet connection");
        alert("Error");
        console.log("error", error);
      });
  };

  // Delete playlist dialog functions
  const handleDeletePlaylistDialogOpen = () => {
    setDeletePlaylistDialogOpen(true);
  };
  const handleDeletePlaylistCancel = () => {
    setPlaylistContextMenuAnchorEl(null);
    setDeletePlaylistDialogOpen(false);
  };
  const handleDeletePlaylistTrigger = async (playlistName) => {
    setPlaylistContextMenuAnchorEl(null);
    setDeletePlaylistDialogOpen(false);
    await db.playlists.where("name").equals(playlistName).delete();
  };

  // Get playlist names from database
  useLiveQuery(() => {
    db.playlists.orderBy("name").keys((keys) => {
      setPlaylistNames(keys);
    });
  }, []);

  // Create add to playlist menu to share to <Page/> component as a prop
  const menu = (
    <>
      <IconButton
        edge="end"
        size="large"
        aria-label="add a playlist"
        aria-controls="add-playlist-menu"
        aria-haspopup="true"
        onClick={handleAddPlaylistMenuOpen}
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
          <ListItemText>Add playlist from device</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Page title="Playlists" menu={menu}>
      <List>
        {playlistNames?.map((playlistName, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={`show context menu for ${playlistName} playlist`}
                aria-controls="playlist-context-menu"
                aria-haspopup="true"
                onClick={(event) => handlePlaylistContextMenuOpen(event, index)}
              >
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemText primary={playlistName} />
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
        <MenuItem onClick={handleDeletePlaylistDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog
        open={addRemotePlaylistDialogOpen}
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
      <Dialog
        open={deletePlaylistDialogOpen}
        onClose={handleDeletePlaylistCancel}
        aria-labelledby="delete-playlist-dialog-title"
        aria-describedby="delete-playlist-dialog-description"
      >
        <DialogTitle id="delete-playlist-dialog-title">
          Are you sure to delete {playlistNames[playlistTargetIndex]} playlist?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeletePlaylistCancel}>Cancel</Button>
          <Button
            color="error"
            onClick={() =>
              handleDeletePlaylistTrigger(playlistNames[playlistTargetIndex])
            }
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
