import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../config/dexie";

const useLivePlaylistData = () => {
  const [playlistData, setPlaylistData] = useState([]);

  useLiveQuery(() => {
    db.playlists.toArray((data) => {
      const playlistNamesWithCount = data.map((playlist) => ({
        name: playlist?.name,
        count: playlist?.data?.length,
      }));
      setPlaylistData(playlistNamesWithCount);
    });
  }, []);
  return playlistData;
};

export default useLivePlaylistData;
