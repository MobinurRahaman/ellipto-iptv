import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../config/dexie";

const useLivePlaylistCount = () => {
  const [playlistCount, setPlaylistCount] = useState(null);

  useLiveQuery(() => {
    db.playlists.count((count) => {
      setPlaylistCount(count);
    });
  }, []);

  return playlistCount;
};

export default useLivePlaylistCount;
