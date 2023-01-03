import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Page from "./components/Page";
// MUI
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
import { useLivePlaylistNames } from "./hooks/dbhooks";
import { GlobalContext } from "./App";

// Create database and playlist store/collection
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

export default function Playlists() {
  const navigate = useNavigate();
  // Get playlist names from custom hook
  const playlistNames = useLivePlaylistNames();
  // _ States
  // Add playlist menu state
  const [addPlaylistMenuAnchorEl, setAddPlaylistMenuAnchorEl] = useState(null);
  // Add remote playlist states
  const [addRemotePlaylistDialogOpen, setAddRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState(null);
  // Add from device ref
  const fileInputRef = useRef(null);
  // Playlist context menu states
  const [playlistContextMenuAnchorEl, setPlaylistContextMenuAnchorEl] =
    useState(null);
  const [playlistTargetIndex, setPlaylistTargetIndex] = useState(null);
  // Rename playlist states
  const [renamePlaylistDialogOpen, setRenamePlaylistDialogOpen] =
    useState(false);
  const [renamedPlaylistName, setRenamedPlaylistName] = useState("");
  // Delete playlist state
  const [deletePlaylistDialogOpen, setDeletePlaylistDialogOpen] =
    useState(false);

  // __ Context
  const { selectedPlaylistName, setSelectedPlaylistName } =
    useContext(GlobalContext);

  // __ Functions
  // Add playlist menu functions
  const handleAddPlaylistMenuOpen = (event) => {
    setAddPlaylistMenuAnchorEl(event.currentTarget);
  };
  const handleAddPlaylistMenuClose = () => {
    setAddPlaylistMenuAnchorEl(null);
  };

  // Remote playlist url dialog functions
  const handleRemotePlaylistDialogOpen = () => {
    setAddPlaylistMenuAnchorEl(null);
    setAddRemotePlaylistDialogOpen(true);
  };
  const handlePlaylistUrlChange = (event) => {
    setRemotePlaylistUrl(event.target.value.trim());
  };
  const handleAddRemotePlaylistCancel = () => {
    setAddRemotePlaylistDialogOpen(false);
    setRemotePlaylistUrl("");
  };
  const handleAddRemotePlaylistTrigger = () => {
    setAddRemotePlaylistDialogOpen(false);
    const playlistName = remotePlaylistUrl.split("/").pop();

    fetch(remotePlaylistUrl)
      .then((res) => res.text())
      .then((rawPlaylistData) =>
        handleAddPlaylistToDB(playlistName, rawPlaylistData)
      )
      .catch((error) => {
        !navigator.onLine && alert("No internet. Turn on internet connection");
        alert("Error");
        console.log("error", error);
      });
    // Empty remote playlist url
    setRemotePlaylistUrl("");
  };

  const handleAddPlaylistToDB = (playlistName, rawPlaylistData) => {
    // Convert IPTV playlist to JavaScript array of objects
    try {
      const playlistData = parser.parse(rawPlaylistData).items;
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
              // If the the playlist is added, then make it selected
              setSelectedPlaylistName(playlistName);
              console.log(`${playlistName} playlist created`);
            } else {
              // If this playlist already exists in the database
              alert(`${playlistName} playlist already exists`);
            }
          });
      } else {
        alert("No playlist data found");
      }
    } catch {
      const fileExt = playlistName.split(".").pop();
      if (!["m3u", "m3u8"].includes(fileExt)) {
        alert(
          "This is not an IPTV playlist. Enter url or add file with m3u or m3u8 extension"
        );
      } else {
        alert(
          "Failed to parse playlist. Make sure that this is a valid playlist"
        );
      }
    }
  };

  // Add playlist from device functions
  const handleFilePickerOpen = () => {
    if (fileInputRef.current) {
      handleAddPlaylistMenuClose();
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    if (fileInputRef.current) {
      const file = e.target.files[0];
      if (file) {
        const fileName = file.name.split(/(\\|\/)/g).pop();
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
          handleAddPlaylistToDB(fileName, e.target.result);
          // Empty input file to listen to same file picking
          fileInputRef.current.value = "";
        };
        reader.onerror = function (e) {
          alert("Failed to read file");
        };
      }
    }
  };

  // Playlist item function
  const handlePlaylistItemClick = (playlistName) => {
    setSelectedPlaylistName(playlistName);
    navigate("/");
  };

  // Playlist context menu functions
  const handlePlaylistContextMenuOpen = (event, index) => {
    event.stopPropagation();
    setPlaylistContextMenuAnchorEl(event.currentTarget);
    setPlaylistTargetIndex(index);
  };
  const handlePlaylistContextMenuClose = () => {
    setPlaylistContextMenuAnchorEl(null);
    setPlaylistTargetIndex(null);
  };

  // Rename playlist dialog functions
  const handleRenamePlaylistDialogOpen = () => {
    setPlaylistContextMenuAnchorEl(null);
    setRenamePlaylistDialogOpen(true);
  };
  const handlePlaylistNameChange = (event) => {
    setRenamedPlaylistName(event.target.value.trim());
  };
  const handleRenamePlaylistCancel = () => {
    setRenamePlaylistDialogOpen(false);
    setRenamedPlaylistName("");
  };
  const handleRenamePlaylistTrigger = async () => {
    setRenamePlaylistDialogOpen(false);
    await db.playlists
      .where("name")
      .equals(playlistNames[playlistTargetIndex])
      .modify({ name: renamedPlaylistName });
    // Empty renamed playlist name
    setRenamedPlaylistName("");
    // If current selected playlist name is changed, then update the state of selectedPlaylistName
    if (playlistNames[playlistTargetIndex] === selectedPlaylistName) {
      setSelectedPlaylistName(renamedPlaylistName);
    }
  };

  // Delete playlist dialog functions
  const handleDeletePlaylistDialogOpen = () => {
    setPlaylistContextMenuAnchorEl(null);
    setDeletePlaylistDialogOpen(true);
  };
  const handleDeletePlaylistCancel = () => {
    setDeletePlaylistDialogOpen(false);
  };
  const handleDeletePlaylistTrigger = async () => {
    setDeletePlaylistDialogOpen(false);
    await db.playlists
      .where("name")
      .equals(playlistNames[playlistTargetIndex])
      .delete();
    if (selectedPlaylistName === playlistNames[playlistTargetIndex]) {
      setSelectedPlaylistName(playlistNames[0]);
    }
  };

  // Create add playlist menu to share to <Page/> component as a prop
  const addPlaylistMenu = (
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
        <MenuItem onClick={handleFilePickerOpen}>
          <ListItemIcon>
            <PhoneAndroidIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add playlist from device</ListItemText>
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
    </>
  );

  return (
    <Page title="Playlists" addPlaylistMenu={addPlaylistMenu}>
      <List>
        {playlistNames?.map((playlistName, index) => (
          <ListItem
            button
            key={index}
            onClick={() => handlePlaylistItemClick(playlistName)}
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
        <MenuItem onClick={handleRenamePlaylistDialogOpen}>
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
        open={renamePlaylistDialogOpen}
        onClose={handleRenamePlaylistDialogOpen}
      >
        <DialogTitle>
          Rename {playlistNames[playlistTargetIndex]} playlist
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            autoComplete="off"
            label="New playlist name"
            type="text"
            fullWidth
            variant="standard"
            inputProps={{ maxLength: 256 }}
            onChange={handlePlaylistNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenamePlaylistCancel}>Cancel</Button>
          <Button
            disabled={renamedPlaylistName?.length > 0 ? false : true}
            onClick={handleRenamePlaylistTrigger}
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
          <Button color="error" onClick={handleDeletePlaylistTrigger} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
