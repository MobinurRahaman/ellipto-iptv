import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowLeftSharpIcon from "@mui/icons-material/KeyboardArrowLeftSharp";
import KeyboardArrowRightSharpIcon from "@mui/icons-material/KeyboardArrowRightSharp";
import Page from "./components/Page";
import { useLiveQuery } from "dexie-react-hooks";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { GlobalContext } from "./App";
import db from "./config/dexie";
import "./css/horizontal-scrolling-menu.css";
import usePreventBodyScroll from "./hooks/usePreventBodyScroll";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  backgroundColor: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
  },
  "&:active": {
    backgroundColor: theme.palette.primary.main,
  },
}));

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
    aspectRatio: "1/1.2",
    alignItems: "stretch",
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
  const { disableScroll, enableScroll } = usePreventBodyScroll();
  const [channelsToRenderCount, setChannelsToRenderCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [channelsToRender, setChannelsToRender] = useState([]);

  const chipStackRef = useRef(null);
  const {
    playlistCount,
    selectedPlaylistName,
    categoryData,
    setCategoryData,
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
    navigate(`/play/${encodeURIComponent(channelObj.name)}`);
  };

  const LeftArrow = () => {
    const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-start",
          backgroundImage: (theme) =>
            `linear-gradient(90deg, ${theme.palette.background.paper} , transparent)`,
          visibility:
            categoryData === null ||
            categoryData?.length === 0 ||
            isFirstItemVisible
              ? "hidden"
              : "visible",
        }}
      >
        <StyledIconButton
          aria-label="scroll to previous categories"
          size="small"
          onClick={() => scrollPrev()}
        >
          <KeyboardArrowLeftSharpIcon />
        </StyledIconButton>
      </Box>
    );
  };

  const RightArrow = () => {
    const { isLastItemVisible, scrollNext } = useContext(VisibilityContext);

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-end",
          backgroundImage: (theme) =>
            `linear-gradient(90deg , transparent, ${theme.palette.background.paper})`,
          visibility:
            categoryData === null ||
            categoryData?.length === 0 ||
            isLastItemVisible
              ? "hidden"
              : "visible",
        }}
      >
        <StyledIconButton
          aria-label="scroll to next categories"
          size="small"
          onClick={() => scrollNext()}
        >
          <KeyboardArrowRightSharpIcon />
        </StyledIconButton>
      </Box>
    );
  };

  function onWheel(apiObj, ev) {
    const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;

    if (isThouchpad) {
      ev.stopPropagation();
      return;
    }

    if (ev.deltaY < 0) {
      apiObj.scrollPrev();
    } else if (ev.deltaY > 0) {
      apiObj.scrollNext();
    }
  }

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
        sx={{
          p: 1,
          display: categoryData?.length > 0 ? "block" : "none",
        }}
        onMouseEnter={disableScroll}
        onMouseLeave={enableScroll}
      >
        <ScrollMenu
          LeftArrow={LeftArrow}
          RightArrow={RightArrow}
          onWheel={onWheel}
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
                selectedCategoryName === categoryObj?.name
                  ? "filled"
                  : "outlined"
              }
              onClick={() => setSelectedCategoryName(categoryObj?.name)}
              key={categoryIndex}
            />
          ))}
        </ScrollMenu>
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
                component={Link}
                to={`/play/${encodeURIComponent(item.name)}`}
                style={styles.buttonBase}
                onClick={() => handleChannelClick(item)}
              >
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="flex-end"
                  >
                    <LazyLoadImage
                      src={item.tvg.logo}
                      alt=""
                      placeholder={<CircularProgress size="120px" />}
                      style={styles.lazyLoadImage}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="flex-end"
                    textAlign="center"
                    fontSize=".9rem"
                  >
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
