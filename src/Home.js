import { useState, useContext } from "react";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Page from "./components/Page";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { GlobalContext } from "./App";

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

// Create database and playlist store/collection
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

export default function Home() {
  const [pageNum, setPageNum] = useState(1);
  const [totalPlaylistDataLen, setTotalPlaylistDataLen] = useState(0);
  const [playlistData, setPlaylistData] = useState([]);
  const { selectedPlaylistName, setCurrentChannelData } =
    useContext(GlobalContext);

  const perPage = 30;

  useLiveQuery(() => {
    db.open().then(() => {
      db.playlists
        .where("name")
        .equals(selectedPlaylistName)
        .toArray()
        .then((result) => {
          setTotalPlaylistDataLen(result[0].data.length);
          setPlaylistData(
            Array.from(
              new Set([
                ...result[0].data.slice(
                  Math.max(0, (pageNum - 1) * perPage),
                  pageNum * perPage
                ),
              ])
            )
          );
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
          setTotalPlaylistDataLen(result[0].data.length);
          setPlaylistData(
            Array.from(
              new Set([
                ...playlistData,
                ...result[0].data.slice(
                  Math.max(0, (pageNum - 1) * perPage),
                  pageNum * perPage
                ),
              ])
            )
          );
        });
    });
  }, [pageNum]);

  const fetchMoreData = () => {
    setPageNum((prevPageNum) => prevPageNum + 1);
  };

  const handleChannelClick = (channelObj) => {
    setCurrentChannelData(channelObj);
  };

  return (
    <Page title="React IPTV">
      <InfiniteScroll
        dataLength={playlistData?.length || 0}
        next={fetchMoreData}
        hasMore={pageNum < Math.ceil(totalPlaylistDataLen / perPage)}
        loader={
          <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        }
      >
        <Grid container>
          {playlistData?.map((item, index) => (
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
                onClick={() =>
                  handleChannelClick({
                    playlistName: selectedPlaylistName,
                    data: item,
                  })
                }
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
