import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Player, Hls, DefaultUi } from "@vime/react";
import "@vime/core/themes/default.css";
import { useLiveQuery } from "dexie-react-hooks";
import Page from "./components/Page";
import { GlobalContext } from "./App";
import db from "./config/dexie";
import "./css/play.css";

export default function Play() {
  const { channelName } = useParams();
  const [error, setError] = useState({ code: null, message: "" });
  const [playbackQuality, setPlaybackQuality] = useState("Auto");
  const videoPlayer = useRef(null);
  const { currentChannelData, setCurrentChannelData } =
    useContext(GlobalContext);

  useLiveQuery(() => {
    // If currentChannelData exists in the context
    // and the channel name in the context is the same
    // as it is in the url param, then use it.
    // Else select it from the database by
    // channelName obtained from the url param
    if (
      Object.keys(currentChannelData).length === 0 ||
      decodeURIComponent(currentChannelData?.name) !== channelName
    ) {
      setCurrentChannelData({});

      db.open().then(() => {
        db.playlists.toArray().then((result) => {
          const channelDataMatchesWithEmptyArrays = result.map(
            (playlistItem) => {
              const channelDataMatchesWithEmptyArrays = playlistItem.data.find(
                (channelItem) =>
                  channelItem.name === decodeURIComponent(channelName)
              );
              return channelDataMatchesWithEmptyArrays
                ? [channelDataMatchesWithEmptyArrays]
                : [];
            }
          );
          const channelDataMatches = channelDataMatchesWithEmptyArrays.find(
            (array) => array.length > 0
          );
          channelDataMatches
            ? setCurrentChannelData(channelDataMatches[0])
            : setError({
                code: 404,
                message: "No channel data found for this channel name",
              });
        });
      });
    }
  }, [channelName]);

  useEffect(() => {
    const currentVideoPlayer = videoPlayer.current;
    // Refocus on the videoPlayer on fullscreen change
    currentVideoPlayer.onfullscreenchange = () => {
      currentVideoPlayer?.focus();
    };

    const handleKeyDown = (e) => {
      e.preventDefault();
      currentVideoPlayer?.focus();
      // Enable keyboard shortcuts in fullscreen
      if (
        currentVideoPlayer?.isFullscreenActive &&
        e.target !== currentVideoPlayer
      ) {
        // Create a new keyboard event
        const keyboardEvent = new KeyboardEvent("keydown", {
          key: e.key,
          code: e.code,
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        });

        // dispatch it to the videoPlayer
        currentVideoPlayer?.dispatchEvent(keyboardEvent);
      }
      // Enable keyboard shortcuts when not in fullscreen
      else if (
        !currentVideoPlayer?.isFullscreenActive &&
        e.target === currentVideoPlayer
      ) {
        // Create a new keyboard event
        const keyboardEvent = new KeyboardEvent("keydown", {
          key: e.key,
          code: e.code,
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        });

        // dispatch it to the videoPlayer
        currentVideoPlayer?.dispatchEvent(keyboardEvent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (
      localStorage.getItem("playbackQuality") !== null &&
      localStorage.getItem("playbackQuality") !== ""
    ) {
      currentVideoPlayer?.addEventListener(
        "vmPlaybackQualitiesChange",
        (data) => {
          if (data.detail.length > 0) {
            const savedQuality = localStorage.getItem("playbackQuality");
            let playbackQualities = data.detail;

            if (parseInt(savedQuality)) {
              // Initialize a variable with lowest quality to store closestQuality
              let closestQuality = playbackQualities[1];
              // This lowest quality will be selected if no other quality greater than this is the closest

              for (let i = 0; i < playbackQualities.length; i++) {
                if (parseInt(playbackQualities[i]) <= parseInt(savedQuality)) {
                  // Update closestQuality variable with current quality
                  closestQuality = playbackQualities[i];
                }
              }

              if (parseInt(closestQuality) >= 144) {
                setPlaybackQuality(closestQuality);
              }
            }
            // else select auto quality
          }
        }
      );
    }

    currentVideoPlayer?.addEventListener("vmPlaybackReady", (state) => {
      currentVideoPlayer?.addEventListener(
        "vmPlaybackQualityChange",
        (data) => {
          localStorage.setItem("playbackQuality", data.detail);
        }
      );
    });
    // cleanup function to remove event listeners
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      currentVideoPlayer.onfullscreenchange = null;
    };
  }, []);

  useEffect(() => {
    const currentVideoPlayer = videoPlayer.current;
    currentVideoPlayer?.addEventListener("vmPlaybackReady", (state) => {
      // If player is ready
      if (state.detail) {
        currentVideoPlayer?.canSetPlaybackQuality().then((bool) => {
          if (bool) currentVideoPlayer.playbackQuality = playbackQuality;
        });
      }
    });
  }, [playbackQuality]);

  const onPlayerError = (e) => {
    if (e?.detail?.data?.networkDetails?.status === 403) {
      setError({
        code: 403,
        message: "Forbidden",
      });
    }
  };

  /**
   * @see https://hls-js.netlify.app/api-docs/file/src/config.ts.html.
   */
  const hlsConfig = {
    // ...
  };

  return (
    <Page title="Ellipto IPTV">
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ flex: 1, height: "auto", position: "sticky", top: 54 }}>
            <Player
              ref={videoPlayer}
              onVmError={onPlayerError}
              tabIndex="0"
              style={{ outline: "none" }}
            >
              {error.message ? (
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    zIndex: 51,
                    bgcolor: "#000",
                    color: "#fff",
                  }}
                >
                  <ErrorOutlineIcon fontSize="large" />
                  <Typography variant="body1"> {error.message}</Typography>
                </Box>
              ) : null}
              <Hls version="1.4.14" config={hlsConfig} poster="">
                <source
                  data-src={currentChannelData?.url}
                  type="application/x-mpegURL"
                />
              </Hls>
              <DefaultUi />
            </Player>
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            <img
              src={currentChannelData?.tvg?.logo}
              alt={currentChannelData?.name}
              style={{ width: 80, height: "auto", maxWidth: 80, maxHeight: 80 }}
            />
            <Box>
              <Typography variant="h2" sx={{ fontSize: 20 }}>
                {currentChannelData?.name}
              </Typography>
              <Typography variant="caption">
                {currentChannelData?.group?.title}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: { xs: "100%", md: 240 } }}></Box>
      </Box>
    </Page>
  );
}
