import { useState, useRef, forwardRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Page from "./components/Page";
// MUI
import Box from "@mui/material/Box";
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
import Typography from "@mui/material/Typography";
import Zoom from "@mui/material/Zoom";
// Icons
import PlaylistAddTwoToneIcon from "@mui/icons-material/PlaylistAddTwoTone";
import LinkIcon from "@mui/icons-material/Link";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
// Others
import parser from "iptv-playlist-parser";
import { GlobalContext } from "./App";
import db from "./config/dexie";
import BackdropLoader from "./components/BackdropLoader";

const Transition = forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

export default function Playlists() {
  const navigate = useNavigate();
  // _ States
  // Add playlist menu state
  const [addPlaylistMenuAnchorEl, setAddPlaylistMenuAnchorEl] = useState(null);
  // Backdrop loader
  const [backdropLoaderOpen, setBackdropLoaderOpen] = useState(false);
  // Add remote playlist states
  const [addRemotePlaylistDialogOpen, setAddRemotePlaylistDialogOpen] =
    useState(false);
  const [remotePlaylistName, setRemotePlaylistName] = useState("");
  const [remotePlaylistUrl, setRemotePlaylistUrl] = useState("");
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
  const {
    setAlertMessage,
    playlistCount,
    playlistData,
    selectedPlaylistName,
    setSelectedPlaylistName,
  } = useContext(GlobalContext);

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
  const handleRemotePlaylistNameChange = (event) => {
    setRemotePlaylistName(event.target.value.trim());
  };
  const handleRemotePlaylistUrlChange = (event) => {
    setRemotePlaylistUrl(event.target.value.trim());
  };
  const handleRemotePlaylistUrlInputKeyUp = (event) => {
    if (event.key === "Enter" && remotePlaylistUrl?.length > 0) {
      handleAddRemotePlaylistTrigger();
    }
  };
  const handleAddRemotePlaylistCancel = () => {
    setAddRemotePlaylistDialogOpen(false);
    setRemotePlaylistName("");
    setRemotePlaylistUrl("");
  };
  const handleAddRemotePlaylistTrigger = () => {
    setAddRemotePlaylistDialogOpen(false);
    setBackdropLoaderOpen(true);

    const playlistName =
      remotePlaylistName || remotePlaylistUrl?.split("/").pop();

    fetch(remotePlaylistUrl)
      .then((res) => res.text())
      .then((rawPlaylistData) =>
        handleAddPlaylistToDB(playlistName, rawPlaylistData)
      )
      .catch((error) => {
        setBackdropLoaderOpen(false);
        !navigator.onLine
          ? setAlertMessage({
              title: "No internet",
              message: "Turn on internet connection",
            })
          : setAlertMessage({
              title: "Unknown error",
              message: "Unknown error occurred",
            });
        console.log("error to add playlist ", error);
      })
      .finally(() => {
        // Empty remote playlist name and url finally
        setRemotePlaylistName("");
        setRemotePlaylistUrl("");
      });
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
              db.playlists.add({
                name: playlistName,
                data: playlistData,
              });
              // If the the playlist is added, then make it selected
              setSelectedPlaylistName(playlistName);
              console.log(`${playlistName} playlist created`);
            } else {
              // If this playlist already exists in the database
              setAlertMessage({
                title: "Playlist exists",
                message: `${playlistName} playlist already exists`,
              });
            }
          });
      } else {
        setAlertMessage({
          title: "No data",
          message: "No playlist data found",
        });
      }
    } catch {
      const fileExt = playlistName?.split(".").pop();
      if (!["m3u", "m3u8"].includes(fileExt)) {
        setAlertMessage({
          title: "Not a playlist",
          message:
            "This is not an IPTV playlist. Enter url or add file with m3u or m3u8 extension",
        });
      } else {
        setAlertMessage({
          title: "Failed to parse",
          message:
            "Failed to parse playlist. Make sure that this is a valid playlist",
        });
      }
    } finally {
      setBackdropLoaderOpen(false);
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
      setBackdropLoaderOpen(true);
      const file = e.target.files[0];
      if (file) {
        const fileName = file.name?.split(/(\\|\/)/g).pop();

        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (e) {
          handleAddPlaylistToDB(fileName, e.target.result);
          // Empty input file to listen to same file picking
          fileInputRef.current.value = "";
        };
        reader.onerror = function (e) {
          setBackdropLoaderOpen(false);
          setAlertMessage({ title: "Error", message: "Failed to read file" });
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
  const handleNewPlaylistNameChange = (event) => {
    setRenamedPlaylistName(event.target.value.trim());
  };
  const handleRenamePlaylistDialogKeyUp = (event) => {
    if (event.key === "Enter" && renamedPlaylistName?.length > 0) {
      handleRenamePlaylistTrigger();
    } else if (event.key === "Escape") {
      handleRenamePlaylistCancel();
    }
  };
  const handleRenamePlaylistCancel = () => {
    setRenamePlaylistDialogOpen(false);
    setRenamedPlaylistName("");
  };
  const handleRenamePlaylistTrigger = async () => {
    setRenamePlaylistDialogOpen(false);
    await db.playlists
      .where("name")
      .equals(playlistData[playlistTargetIndex]?.name)
      .modify({
        name: renamedPlaylistName,
      });
    // Empty renamed playlist name
    setRenamedPlaylistName("");
    // If current selected playlist name is changed, then update the state of selectedPlaylistName
    if (playlistData[playlistTargetIndex]?.name === selectedPlaylistName) {
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
      .equals(playlistData[playlistTargetIndex]?.name)
      .delete();

    if (selectedPlaylistName === playlistData[playlistTargetIndex]?.name) {
      if (playlistData.length > 1) {
        const desiredIndex =
          playlistTargetIndex > 1 ? playlistTargetIndex - 1 : 0;
        setSelectedPlaylistName(playlistData[desiredIndex]?.name);
      } else if (playlistData.length === 1) {
        setSelectedPlaylistName("");
      }
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
      {playlistCount !== null ? (
        playlistCount === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: "absolute",
              top: (theme) => `${theme.mixins.toolbar.minHeight}px`,
              right: 0,
              bottom: 0,
              left: 0,
              p: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">No playlists found.</Typography>
            <Typography variant="body1">
              Click on the{" "}
              <span
                style={{
                  verticalAlign: "middle",
                }}
              >
                <PlaylistAddTwoToneIcon />
              </span>{" "}
              icon in the top right corner to add a playlist.
            </Typography>
          </Box>
        ) : null
      ) : null}
      <List>
        {playlistData?.map((playlistNameObj, index) => (
          <ListItem
            button
            key={index}
            onClick={() => handlePlaylistItemClick(playlistNameObj?.name)}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={`show context menu for ${playlistNameObj?.name} playlist`}
                aria-controls="playlist-context-menu"
                aria-haspopup="true"
                onClick={(event) => handlePlaylistContextMenuOpen(event, index)}
              >
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemText
              sx={{
                "& span": {
                  wordBreak: "break-word", // Prevent overflow by breaking long words in playlist title
                },
              }}
              primary={playlistNameObj?.name}
              secondary={`${playlistNameObj?.count} channels`}
            />
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
        TransitionComponent={Transition}
      >
        <DialogTitle>Add a playlist from remote URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="filename"
            autoComplete="off"
            label="Playlist Name (optional)"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleRemotePlaylistNameChange}
          />
          <TextField
            required
            margin="dense"
            name="url"
            autoComplete="off"
            label="Playlist URL"
            type="url"
            fullWidth
            variant="standard"
            onChange={handleRemotePlaylistUrlChange}
            onKeyUp={handleRemotePlaylistUrlInputKeyUp}
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
        onKeyUp={handleRenamePlaylistDialogKeyUp}
        TransitionComponent={Transition}
      >
        <DialogTitle>
          Rename {playlistData[playlistTargetIndex]?.name} playlist
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
            onChange={handleNewPlaylistNameChange}
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
        TransitionComponent={Transition}
      >
        <DialogTitle id="delete-playlist-dialog-title">
          Are you sure to delete {playlistData[playlistTargetIndex]?.name}{" "}
          playlist?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeletePlaylistCancel}>Cancel</Button>
          <Button color="error" onClick={handleDeletePlaylistTrigger} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <BackdropLoader open={backdropLoaderOpen} />
    </Page>
  );
}
