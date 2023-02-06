import { useState } from "react";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// Create database and playlist store/collection
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

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

export { useLivePlaylistData };
