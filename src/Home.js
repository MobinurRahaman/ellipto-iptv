import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Page from "./components/Page";
import { useLiveQuery } from "dexie-react-hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { GlobalContext } from "./App";
import db from "./config/dexie";

const styles = {
  channelItemGrid: {
    minHeight: 148,
    border: "3px solid rgba(0,0,0,.1)",
  },
  buttonBase: {
    width: "100%",
    height: "100%",
    padding: "20px",
    overflow: "hidden",
  },
  lazyLoadImage: {
    width: "auto",
    height: "auto",
    maxWidth: 120,
    maxHeight: 120,
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [channelsToRenderCount, setChannelsToRenderCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [channelsToRender, setChannelsToRender] = useState([]);

  const chipStackRef = useRef(null);
  const {
    playlistCount,
    selectedPlaylistName,
    selectedCategoryName,
    setSelectedCategoryName,
    searchTerm,
    setCurrentChannelData,
  } = useContext(GlobalContext);

  const perPage = 30;

  useEffect(() => {
    setPageNum(1);
    setChannelsToRender([]);
    setChannelsToRenderCount(0);
    window.scrollTo(0, 0);
    chipStackRef?.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }, [selectedPlaylistName]);

  useEffect(() => {
    setPageNum(1);
    setChannelsToRender([]);
    setChannelsToRenderCount(0);
  }, [selectedCategoryName, searchTerm]);

  useLiveQuery(() => {
    db.open().then(() => {
      db.playlists
        .where("name")
        .equals(selectedPlaylistName)
        .toArray()
        .then((result) => {
          setChannelsToRenderCount(result[0]?.data?.length);
          if (result[0]?.data?.length > 0) {
            const categoryCount = {};
            for (const channel of result[0].data) {
              const category = channel?.group?.title;
              if (categoryCount[category]) {
                categoryCount[category]++;
              } else {
                categoryCount[category] = 1;
              }
            }

            const categoryData = [
              { name: "All channels", count: result[0]?.data?.length },
            ];
            for (const category in categoryCount) {
              categoryData.push({
                name: category,
                count: categoryCount[category],
              });
            }
            setCategoryData(categoryData);
          }
        });
    });
  }, [selectedPlaylistName]);

  useLiveQuery(() => {
    db.open().then(() => {
      db.playlists
        .where("name")
        .equals(selectedPlaylistName)
        .toArray()
        .then((result) => {
          const filteredData =
            selectedCategoryName === "All channels"
              ? result[0]?.data?.filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : result[0]?.data?.filter(
                  (item) =>
                    item.group.title === selectedCategoryName &&
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
          setChannelsToRenderCount(filteredData?.length);
          setChannelsToRender(
            filteredData?.length > 0
              ? Array.from(new Set([...filteredData?.slice(0, perPage)]))
              : []
          );
        });
    });
  }, [selectedPlaylistName, selectedCategoryName, searchTerm]);

  useLiveQuery(() => {
    if (pageNum > 1) {
      db.open().then(() => {
        db.playlists
          .where("name")
          .equals(selectedPlaylistName)
          .toArray()
          .then((result) => {
            const filteredData =
              selectedCategoryName === "All channels"
                ? result[0]?.data?.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                : result[0]?.data?.filter(
                    (item) =>
                      item.group.title === selectedCategoryName &&
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  );
            setChannelsToRenderCount(filteredData?.length);
            setChannelsToRender(
              Array.from(
                new Set([
                  ...channelsToRender,
                  ...filteredData?.slice(
                    Math.max(0, (pageNum - 1) * perPage),
                    pageNum * perPage
                  ),
                ])
              )
            );
          });
      });
    }
  }, [pageNum]);

  const fetchMoreData = () => {
    setPageNum((prevPageNum) => prevPageNum + 1);
  };

  const onChipRefChange = useCallback((currrentChip) => {
    if (currrentChip !== null) {
      // Currrent chip referenced by ref has changed and exists
      currrentChip.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleChannelClick = (channelObj) => {
    setCurrentChannelData(channelObj);
    navigate(`/live-tv/${channelObj.tvg.id}`);
  };

  return (
    <Page title="Ellipto IPTV">
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
              Click on the manage button in the playlists section of the left
              drawer and add a playlist.
            </Typography>
          </Box>
        ) : null
      ) : null}
      <Stack
        ref={chipStackRef}
        direction="row"
        spacing={1}
        sx={{
          p: 1,
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        {categoryData?.map((categoryObj, categoryIndex) => (
          <Chip
            ref={
              selectedCategoryName === categoryObj?.name
                ? onChipRefChange
                : null
            }
            label={`${categoryObj?.name} (${categoryObj?.count})`}
            color="primary"
            variant={
              selectedCategoryName === categoryObj?.name ? "filled" : "outlined"
            }
            onClick={() => setSelectedCategoryName(categoryObj?.name)}
            key={categoryIndex}
          />
        ))}
      </Stack>
      <InfiniteScroll
        dataLength={channelsToRender?.length || 0}
        next={fetchMoreData}
        hasMore={pageNum < Math.ceil(channelsToRenderCount / perPage) || false}
        loader={
          <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        }
      >
        <Grid container>
          {channelsToRender?.map((item, index) => (
            <Grid
              item
              key={index}
              xs={6}
              sm={3}
              md={2}
              style={styles.channelItemGrid}
            >
              <ButtonBase
                style={styles.buttonBase}
                onClick={() => handleChannelClick(item)}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <LazyLoadImage
                      src={item.tvg.logo}
                      alt=""
                      placeholder={<CircularProgress size="120px" />}
                      style={styles.lazyLoadImage}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {item.name}
                  </Grid>
                </Grid>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Page>
  );
}
